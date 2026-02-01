# PDF Toolbox

Offline-first PDF utilities that run entirely in the browser. Merge, split, sign, redact, and compress without uploading files.

## Features
- Merge PDFs with custom ordering.
- Split/extract page ranges.
- Handwritten signature stamping.
- Safe redaction by flattening pages.
- Strong compression by rasterizing pages.
- Stripe Checkout for Pro and export packs.

## Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- pdf-lib + pdfjs-dist (MIT-licensed)
- Stripe Checkout

## Getting Started

### 1) Install dependencies
```bash
pnpm install
```

### 2) Configure environment variables
Copy `.env.example` to `.env.local` and fill in Stripe + license keys.

```bash
cp .env.example .env.local
```

### 3) Run the app
```bash
pnpm dev
```

Open http://localhost:3000

## Stripe Test Mode Setup
1. In the Stripe dashboard, create two products:
   - **Pro Subscription** ($0.99/month recurring)
   - **Export Pack** ($1.99 one-time)
2. Copy the price IDs into `.env.local`.
3. Create a webhook endpoint pointing to:
   - `http://localhost:3000/api/stripe/webhook`
4. Listen for the `checkout.session.completed` event.
5. Add the webhook secret to `.env.local`.

## License Keys
Generate an ES256 keypair:
```bash
openssl ecparam -name prime256v1 -genkey -noout -out private.pem
openssl ec -in private.pem -pubout -out public.pem
```
Paste the private key into `LICENSE_PRIVATE_KEY` and the public key into `NEXT_PUBLIC_LICENSE_PUBLIC_KEY`.

## Testing the Tools
- **Merge**: upload multiple PDFs, reorder, process & export.
- **Split**: upload a PDF, enter ranges like `1-2,4-4`, process & export.
- **Sign**: draw a signature, drag it onto a page, process & export.
- **Redact**: draw rectangles, process & export; file is flattened.
- **Compress**: choose DPI and export.

## Deployment Notes
- Works on Vercel with the same environment variables.
- All PDF processing runs client-side.
- Server routes are used only for billing and entitlement tokens.

## Legal / Privacy
PDFs never leave the browser. Only Stripe checkout and entitlement token endpoints run on the server.
