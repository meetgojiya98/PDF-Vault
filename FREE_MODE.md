# 🆓 Making the App Free

## How to Toggle Between Free and Paid

The app has a **built-in feature flag** to easily switch between free and paid modes.

### Enable Free Mode (Current)

Add to your `.env.local`:
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

### Enable Paid Mode (When Ready)

Update `.env.local`:
```env
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Then add your Stripe keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# ... rest of Stripe config
```

That's it! One environment variable controls the entire payment system.

---

## What Changes in Free Mode

### ✅ What Users Get
- ✓ Unlimited exports (no paywall)
- ✓ All tools unlocked
- ✓ No subscription required
- ✓ No credit limits
- ✓ No signup needed

### 🎨 UI Changes Made
- Removed "Pricing" from navigation
- Replaced pricing card with "Everything Free" card
- Removed Pro subscription badge
- Hidden account panel (no subscriptions to manage)
- Export modal always allows download

### 🔧 Technical Changes
- `canExport()` always returns `true`
- Paywall modal never shown
- No license tokens generated
- No Stripe API calls made
- Database still works (just not used)

---

## When You're Ready to Enable Payments

1. **Set up Stripe** (follow `STRIPE_SETUP.md`)
2. **Add Stripe keys to `.env.local`**
3. **Set `NEXT_PUBLIC_ENABLE_PAYMENTS=true`**
4. **Rebuild**: `pnpm build`
5. **Deploy**

Everything will work immediately:
- Paywall appears after free export
- Stripe checkout enabled
- Webhooks process subscriptions
- User database tracks customers
- Account panel shows subscription

---

## Code Architecture

The payment system is **still there**, just disabled via a feature flag.

### Files That Check the Flag

```typescript
// src/utils/entitlement.ts
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

export function canExport(token: LicensePayload | null) {
  if (!PAYMENTS_ENABLED) {
    return true; // Always allow when free
  }
  // ... normal payment logic
}
```

```typescript
// src/components/ExportModal.tsx
const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
const allowed = !paymentsEnabled || canExport(license);
```

### What Still Works

Even in free mode:
- ✅ Database infrastructure
- ✅ Stripe API endpoints (just unused)
- ✅ Webhook handlers
- ✅ License token generation
- ✅ JWT verification
- ✅ All documentation

**Nothing was deleted**, just feature-flagged!

---

## Testing Both Modes

### Test Free Mode
```bash
# .env.local
NEXT_PUBLIC_ENABLE_PAYMENTS=false

pnpm dev
# Try exporting multiple PDFs - all work!
```

### Test Paid Mode
```bash
# .env.local
NEXT_PUBLIC_ENABLE_PAYMENTS=true
STRIPE_SECRET_KEY=sk_test_...
# ... other Stripe keys

pnpm dev
# Try exporting - paywall appears after first export
```

---

## Benefits of This Approach

### ✅ Easy to Toggle
- One environment variable
- No code changes needed
- Instant switch between modes

### ✅ Safe Rollout
- Start free to build userbase
- Enable payments when ready
- A/B test pricing strategies

### ✅ Clean Code
- All payment code intact
- No commented-out sections
- Easy to maintain

### ✅ No Technical Debt
- Database schema stays consistent
- API endpoints remain valid
- Can re-enable anytime

---

## Current State

**App is now 100% free!**

- ✓ No paywalls
- ✓ No signup required
- ✓ Unlimited everything
- ✓ Simple, clean UI
- ✓ Payment infrastructure ready for later

When you want to monetize, just flip the flag! 🚀
