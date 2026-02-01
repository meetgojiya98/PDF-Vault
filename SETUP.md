# PDF Vault - Setup Instructions

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (Create in Stripe Dashboard -> Products)
STRIPE_PRICE_SUBSCRIPTION=price_your_subscription_price_id
STRIPE_PRICE_EXPORT_PACK=price_your_export_pack_price_id

# License Keys (Generate with: openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem)
LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"

NEXT_PUBLIC_LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"
```

## Stripe Setup Instructions

### 1. Create Stripe Account
1. Go to https://stripe.com and create an account
2. Use TEST mode for development

### 2. Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (pk_test_...)
3. Copy "Secret key" (sk_test_...)
4. Add to `.env.local`

### 3. Create Products
1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Create product"

**Product 1: Pro Subscription**
- Name: PDF Vault Pro
- Description: Unlimited PDF exports
- Pricing: $0.99/month (Recurring)
- Copy the Price ID (price_...) to `STRIPE_PRICE_SUBSCRIPTION`

**Product 2: Export Pack (Optional)**
- Name: 50 Export Pack
- Description: One-time 50 export credits
- Pricing: $9.99 (One-time)
- Copy the Price ID (price_...) to `STRIPE_PRICE_EXPORT_PACK`

### 4. Setup Webhook (For Production)
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret (whsec_...) to `STRIPE_WEBHOOK_SECRET`

### 5. Generate License Keys
Run these commands in terminal:
```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem

# View private key (copy to LICENSE_PRIVATE_KEY)
cat private.pem

# View public key (copy to NEXT_PUBLIC_LICENSE_PUBLIC_KEY)
cat public.pem
```

## Testing Stripe Payments

### Test Credit Cards
Use these in TEST mode:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155

Any future date for expiry, any 3-digit CVC.

## Payment Tracking

### How It Works
1. User clicks "Upgrade to Pro"
2. Redirects to Stripe Checkout
3. After payment, Stripe redirects to `/app?success=true&session_id=xxx`
4. App calls `/api/entitlement` with session_id
5. Server verifies payment and generates JWT license token
6. Token stored in localStorage
7. Token verified on every page load
8. Pro features unlocked

### License Token Contents
- `customerId`: Stripe customer ID
- `email`: User email
- `proActive`: true if subscription active
- `exportCredits`: Available one-time credits
- `exp`: Token expiration

### Checking Payment Status
```javascript
// In React component
const { license } = useEntitlement();

if (license?.proActive) {
  // User has active subscription
}

if (license?.exportCredits > 0) {
  // User has export credits
}
```

## Development vs Production

### Development
- Use Stripe TEST mode keys
- Test with test cards
- Webhook not required (handle in success callback)

### Production
- Switch to LIVE mode keys in Stripe Dashboard
- Use real domain in `NEXT_PUBLIC_APP_URL`
- Configure webhook endpoint
- Generate production license keys
- Test thoroughly before launch

## Security Notes
- Never commit `.env.local` to git (already in .gitignore)
- Keep private keys secure
- License tokens expire after 30 days (user must re-verify)
- Tokens are JWT signed with RS256 for security
- All payment processing happens on Stripe's secure servers

## Troubleshooting

### Payment not registering
- Check Stripe Dashboard logs
- Verify webhook is receiving events
- Check browser console for errors
- Ensure `.env.local` has correct keys

### License not verifying
- Check public key matches private key
- Verify token hasn't expired
- Clear localStorage and try again: `localStorage.clear()`

### Tools not working
- Check browser console for errors
- Ensure PDF files are valid
- Try with smaller PDFs first
- Check network tab for API errors
