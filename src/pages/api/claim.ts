// src/pages/api/claim.ts
// Serverless API endpoint for claiming the Morrow Café ₹150 discount voucher.
import type { APIRoute } from 'astro';

export const prerender = false;

// Unambiguous character set for counter redemption:
// Omits visually confusing characters: 0 (zero), O (letter O), 1 (one), I (letter I)
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateClaimCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET[randomIndex];
  }
  return `MORROW-${code}`;
}

function cleanIndianPhone(rawPhone: string): string {
  // Strip spaces, dashes, dots, and parentheses
  let cleaned = rawPhone.replace(/[\s\-\.\(\)]/g, '');
  // Strip leading international code (+91 or 91 if 12 digits) or leading 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

export const POST: APIRoute = async ({ request }) => {
  // Production Note:
  // In a production deployment, this endpoint would:
  // 1. Enforce rate-limiting per IP and phone number (e.g. Upstash Redis / Cloudflare KV).
  // 2. Query a persistent database (PostgreSQL / DynamoDB) to reject duplicate claims for the same phone.
  // 3. Store redemption status and timestamp for cashier counter validation.
  // 4. Optionally trigger an SMS verification or confirmation webhook.

  let name = '';
  let phone = '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      name = typeof body?.name === 'string' ? body.name : '';
      phone = typeof body?.phone === 'string' ? body.phone : '';
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = (formData.get('name') as string) || '';
      phone = (formData.get('phone') as string) || '';
    } else {
      // Fallback attempt to parse JSON
      const text = await request.text();
      const body = JSON.parse(text || '{}');
      name = body.name || '';
      phone = body.phone || '';
    }
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid request payload. Please send valid JSON.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Simulated server processing delay (600ms - 900ms) for realistic UX & tactile feedback
  const latency = Math.floor(Math.random() * 300) + 600;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const trimmedName = name.trim();
  const cleanedPhone = cleanIndianPhone(phone);

  // Deterministic testing triggers:
  // - Name "error test" or containing "500" forces a 500 server error
  // - Name "bad request" forces a 400 error
  if (trimmedName.toLowerCase() === 'error test' || trimmedName.toLowerCase().includes('500')) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error while generating voucher. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (trimmedName.toLowerCase() === 'bad request') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Simulated bad request error.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Name validation: 2 to 60 characters
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 60) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Please provide your full name (between 2 and 60 characters).',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Indian mobile validation: starts with 6, 7, 8, or 9 followed by 9 digits
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleanedPhone)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate unique unambiguous claim code
  const claimCode = generateClaimCode();

  return new Response(
    JSON.stringify({
      success: true,
      claimCode,
      message: 'Offer claimed successfully! Show this code when you visit Morrow Café.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

// Disallow non-POST methods with clean 405 Method Not Allowed
export const ALL: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Method Not Allowed. Use POST.',
    }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    }
  );
};
