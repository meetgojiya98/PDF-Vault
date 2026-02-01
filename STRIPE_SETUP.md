# 💳 Complete Stripe Payment Setup Guide

## 📋 Overview

This guide will walk you through setting up Stripe payments for PDF Vault, including subscription management, webhooks, and customer tracking.

---

## 🚀 Quick Start Checklist

- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Create products and prices
- [ ] Set up webhook endpoint
- [ ] Configure environment variables
- [ ] Test in development
- [ ] Deploy to production
- [ ] Enable production mode

---

## 1️⃣ Create Stripe Account

1. Go to https://stripe.com
2. Click "Sign up" and create your account
3. Complete business verification (required for live mode)

---

## 2️⃣ Get Your API Keys

### Test Mode Keys (for development)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_`)

### Live Mode Keys (for production)

1. Toggle to "Live mode" in the Stripe dashboard
2. Go to https://dashboard.stripe.com/apikeys
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Click "Reveal live key" and copy your **Secret key** (starts with `sk_live_`)

---

## 3️⃣ Create Products & Prices

### Create Pro Subscription

1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Create product"
3. Fill in:
   - **Name**: `PDF Vault Pro`
   - **Description**: `Unlimited PDF exports and premium features`
   - **Pricing model**: Recurring
   - **Price**: `0.99` USD
   - **Billing period**: Monthly
4. Click "Save product"
5. **Copy the Price ID** (starts with `price_`) - you'll need this!

### Create Export Credits (Optional)

1. Click "+ Create product"
2. Fill in:
   - **Name**: `PDF Export Credits`
   - **Description**: `5 PDF export credits`
   - **Pricing model**: One-time
   - **Price**: `9.99` USD
3. Click "Save product"
4. **Copy the Price ID** - you'll need this!

---

## 4️⃣ Set Up Webhooks

Webhooks let Stripe notify your app about subscription events (payments, cancellations, etc.)

### Development (Local Testing with Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop install stripe
   
   # Linux
   # Download from https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) from the output

### Production (Live Webhooks)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Fill in:
   - **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click "Add endpoint"
5. Click on your webhook endpoint
6. Click "Reveal" under "Signing secret"
7. **Copy the webhook signing secret** (starts with `whsec_`)

---

## 5️⃣ Generate License Keys

You need RSA key pairs for signing user license tokens:

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key from private key
openssl rsa -in private.pem -pubout -out public.pem

# View private key (copy this)
cat private.pem

# View public key (copy this)
cat public.pem
```

**Important**: Keep `private.pem` secret! Never commit it to git.

---

## 6️⃣ Configure Environment Variables

Create or update `.env.local` in your project root:

```env
# ==============================================
# APP CONFIGURATION
# ==============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================
# STRIPE CONFIGURATION (Test Mode)
# ==============================================
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ==============================================
# STRIPE PRODUCTS
# ==============================================
STRIPE_PRICE_SUBSCRIPTION=price_your_subscription_price_id
STRIPE_PRICE_EXPORT_PACK=price_your_export_pack_price_id

# ==============================================
# LICENSE KEYS (JWT Signing)
# ==============================================
LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE_KEEP_THE_LINE_BREAKS
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"

NEXT_PUBLIC_LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_HERE_KEEP_THE_LINE_BREAKS
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"
```

**Important**: For production, use live mode keys!

---

## 7️⃣ Test the Payment Flow

### Start Development Server

```bash
# Terminal 1: Start Next.js
pnpm dev

# Terminal 2: Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Test Subscription Flow

1. Open http://localhost:3000
2. Click "Launch App" or "Get Started Now"
3. Try to export a PDF (you get 1 free export)
4. Try to export again - you should see the paywall
5. Click "Upgrade to Pro"
6. Enter email: `test@example.com`
7. Click "Upgrade to Pro Now"
8. You'll be redirected to Stripe Checkout
9. Use test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
10. Complete payment
11. You should be redirected back and see unlimited exports!

### Test Card Numbers

| Card | Scenario |
|------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0027 6000 3184 | Requires authentication |
| 4000 0000 0000 9995 | Insufficient funds |

---

## 8️⃣ Verify Everything Works

### Check Webhook Logs

```bash
# In your Stripe CLI terminal, you should see:
✓ checkout.session.completed [evt_xxx]
✓ customer.subscription.created [evt_xxx]
✓ invoice.paid [evt_xxx]
```

### Check User Database

```bash
# View the database file
cat data/subscriptions.json
```

You should see your test user with:
- ✅ Email
- ✅ Customer ID
- ✅ Subscription ID
- ✅ `proActive: true`

### Test License Restoration

1. Open http://localhost:3000/app in an incognito/private window
2. Try to export - see paywall
3. Click "Already subscribed? Restore your license →"
4. Enter the same email you used for checkout
5. Your Pro status should be restored!

---

## 9️⃣ Deploy to Production

### Update Environment Variables

In your production environment (Vercel, Netlify, etc.):

1. Use **live mode** Stripe keys (pk_live_ and sk_live_)
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Use the **production webhook secret** from Stripe dashboard
4. Keep the same license keys

### Enable Stripe Billing Portal

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Click "Activate customer portal"
3. Configure:
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to update payment methods
   - ✅ Show invoice history
4. Save settings

---

## 🔟 Monitor Your Subscriptions

### Stripe Dashboard

View your users and subscriptions:
- **Customers**: https://dashboard.stripe.com/customers
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Payments**: https://dashboard.stripe.com/payments

### Check Database

```bash
# View all users
cat data/subscriptions.json | jq

# Count active Pro users
cat data/subscriptions.json | jq '[.[] | select(.proActive == true)] | length'
```

### API Endpoints

```bash
# Get user subscription status
curl http://localhost:3000/api/stripe/subscription?email=user@example.com

# Create customer portal session (returns URL)
curl -X POST http://localhost:3000/api/stripe/subscription \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

## 🎯 How Users Are Tracked

### User Journey

1. **First Visit**: User gets 1 free PDF export (tracked in localStorage)
2. **Second Export**: Paywall appears, user enters email
3. **Checkout**: Stripe creates customer + subscription
4. **Webhook**: Your server receives `checkout.session.completed` event
5. **Database**: User saved with email, customer ID, subscription ID
6. **License**: JWT token generated with user's Pro status
7. **Client**: License stored in localStorage for offline access

### User Identification

Users are identified by **email address**:
- ✅ No accounts or passwords needed
- ✅ Email is the unique identifier
- ✅ Users can restore license on any device with their email
- ✅ Stripe manages payment methods and billing

### Subscription Status Sync

Your system stays in sync with Stripe via webhooks:
- ✅ Payment succeeds → User marked as Pro
- ✅ Payment fails → User marked as inactive
- ✅ Subscription canceled → User loses Pro status
- ✅ Subscription renewed → Pro status extended

---

## 🛡️ Security Best Practices

1. **Never expose secret keys**
   - ✅ Secret keys stay on server
   - ✅ Use environment variables
   - ✅ Add `.env.local` to `.gitignore`

2. **Verify webhook signatures**
   - ✅ Already implemented in webhook handler
   - ✅ Prevents fake events

3. **Use HTTPS in production**
   - ✅ Required for Stripe webhooks
   - ✅ Protects user data

4. **Validate user input**
   - ✅ Email validation before checkout
   - ✅ Server-side verification

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Problem**: Stripe sends events but your app doesn't receive them

**Solutions**:
1. Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Check webhook URL is correct
3. Check `STRIPE_WEBHOOK_SECRET` is set correctly
4. Check server logs for errors

### Payment Succeeds But User Not Upgraded

**Problem**: User pays but doesn't get Pro status

**Solutions**:
1. Check webhook logs in Stripe CLI
2. Check `data/subscriptions.json` file exists and is writable
3. Check API logs for errors
4. Verify `LICENSE_PRIVATE_KEY` is set correctly

### License Restoration Fails

**Problem**: User enters email but license isn't restored

**Solutions**:
1. Verify email matches exactly (case-insensitive)
2. Check user exists in Stripe: https://dashboard.stripe.com/customers
3. Check subscription is active in Stripe
4. Check API response in browser console

### Production Webhooks Not Working

**Problem**: Webhooks work locally but not in production

**Solutions**:
1. Verify webhook endpoint is publicly accessible
2. Check webhook signing secret is the **production** secret (not test)
3. Check webhook events are configured correctly
4. Check server logs in your hosting platform
5. Test webhook manually in Stripe dashboard

---

## 📊 Database Structure

Your user data is stored in `data/subscriptions.json`:

```json
{
  "user@example.com": {
    "email": "user@example.com",
    "customerId": "cus_xxx",
    "subscriptionId": "sub_xxx",
    "subscriptionStatus": "active",
    "proActive": true,
    "exportCredits": 0,
    "currentPeriodEnd": 1738454400000,
    "createdAt": 1735862400000,
    "updatedAt": 1735862400000
  }
}
```

### For Production

**Important**: This file-based database is simple but **not recommended for production at scale**.

For production, migrate to a real database:
- ✅ **PostgreSQL** (Recommended) - Vercel Postgres, Supabase
- ✅ **MongoDB** - MongoDB Atlas
- ✅ **MySQL** - PlanetScale
- ✅ **Firebase** - Firestore

Update `src/services/stripe/database.ts` to use your chosen database.

---

## ✅ You're Done!

Your payment system is now fully configured and production-ready!

**What you can track:**
- ✅ Who is subscribed (by email)
- ✅ Subscription status (active/canceled/past_due)
- ✅ When subscriptions renew or expire
- ✅ Payment successes and failures
- ✅ Export credit purchases and usage

**What your users get:**
- ✅ 1 free export to try the app
- ✅ $0.99/month for unlimited exports
- ✅ Easy subscription management via Stripe portal
- ✅ Seamless license restoration on new devices
- ✅ Automatic sync across all their devices

Need help? Check the [Stripe documentation](https://stripe.com/docs) or contact support.
