# 🔐 Authentication System Explained

## Your Question: "How will we know if they're a paid user next time?"

**Short Answer**: We use **passwordless authentication** via email + JWT tokens. No traditional auth needed!

---

## 🎯 How It Works (Step by Step)

### First Time User Subscribes

```
1. User enters email in paywall → "user@example.com"
2. Redirected to Stripe checkout
3. User pays $0.99
4. Stripe sends webhook to your server ✓
5. Server saves user to database:
   {
     "user@example.com": {
       "email": "user@example.com",
       "customerId": "cus_abc123",
       "subscriptionId": "sub_xyz789",
       "proActive": true
     }
   }
6. User returns from Stripe
7. Server generates JWT license token:
   {
     "email": "user@example.com",
     "proActive": true,
     "exp": 30 days from now
   }
8. Token stored in localStorage
9. User can now export unlimited PDFs! ✅
```

### Returning User (Same Device)

```
1. User opens app
2. App checks localStorage for "pdf-toolbox-license"
3. Token found! ✓
4. App verifies token signature (offline)
5. Token valid → User has Pro status
6. No server call needed!
```

### Returning User (New Device / Cleared Cache)

```
1. User opens app
2. No token in localStorage
3. User tries to export → Paywall appears
4. User clicks "Already subscribed? Restore your license"
5. User enters email: "user@example.com"
6. App calls: POST /api/entitlement { email }
7. Server checks database → User exists ✓
8. Server verifies with Stripe → Subscription active ✓
9. Server generates new JWT token
10. Token sent to browser → Stored in localStorage
11. User logged back in! ✅
```

---

## 💡 Why This Works Without Traditional Auth

### No Passwords Needed Because:

1. **Stripe is the source of truth**
   - Stripe knows who paid
   - We sync with Stripe via webhooks
   - We verify against Stripe on restore

2. **JWT Tokens are signed**
   - Cryptographically signed with RS256
   - Can't be forged
   - Server-side verification on restore

3. **Email is the identifier**
   - Unique per user
   - Used in Stripe
   - Used in database
   - Used in JWT token

---

## 🔒 Security Model

### What Stops Abuse?

**Scenario 1: User shares email with friend**
```
Friend enters shared email → Gets Pro status
BUT: Friend needs access to user's Stripe account to cancel
Friend needs access to user's email for receipts
Owner can see in Stripe dashboard if usage is suspicious
```

**Verdict**: Unlikely, and if it happens, owner pays for it

**Scenario 2: User tries fake JWT token**
```
Fake token → Server verifies signature → Invalid ❌
Server rejects token
User must restore from server
Server checks Stripe → No subscription → Denied ❌
```

**Verdict**: Impossible to forge tokens

**Scenario 3: User cancels subscription**
```
User cancels in Stripe
Webhook → Server marks proActive = false
Old JWT tokens still valid for up to 30 days
On restore/refresh → New token with proActive = false
User loses Pro status ✓
```

**Verdict**: Tokens expire, webhooks keep it in sync

---

## 🎯 The Authentication Flow Diagram

```
┌─────────────┐
│   Browser   │
│ (LocalStorage)│
└──────┬──────┘
       │
       ├──[Has Token?]──Yes──→ Verify Signature ──→ ✓ Logged In
       │
       └──[No Token]──→ Show Paywall
                          │
                 ┌────────┴────────┐
                 │                 │
           [Subscribe]      [Restore License]
                 │                 │
                 ↓                 ↓
          ┌──────────┐      ┌───────────┐
          │  Stripe  │      │    API    │
          │ Checkout │      │/entitlement│
          └────┬─────┘      └─────┬─────┘
               │                  │
               ↓                  ↓
          ┌────────┐         ┌─────────┐
          │Webhook │         │ Verify  │
          │  POST  │         │ w/Stripe│
          └────┬───┘         └────┬────┘
               │                  │
               └──────┬───────────┘
                      ↓
              ┌───────────────┐
              │Generate JWT   │
              │License Token  │
              └───────┬───────┘
                      ↓
              ┌───────────────┐
              │Save to        │
              │LocalStorage   │
              └───────────────┘
                      ↓
                  ✓ Logged In
```

---

## 📊 Data Flow

### Where User Data Lives

```
1. Stripe (Source of Truth)
   └─ Customer ID: cus_abc123
   └─ Subscription ID: sub_xyz789
   └─ Payment Status: active
   └─ Email: user@example.com

2. Your Database (data/subscriptions.json)
   └─ Synced via webhooks
   └─ Fast local lookup
   └─ Includes: email, IDs, status, dates

3. Browser LocalStorage
   └─ JWT Token (30-day expiry)
   └─ Contains: email, Pro status
   └─ Verified against your server
```

### How They Stay in Sync

```
User Subscribes:
Stripe → Webhook → Database → JWT → Browser

User Cancels:
Stripe → Webhook → Database
(Old tokens expire naturally in 30 days)

User Restores:
Browser → API → Stripe (verify) → New JWT → Browser
```

---

## ⚡ Technical Details

### JWT Token Structure

```json
{
  "customerId": "cus_abc123",
  "email": "user@example.com",
  "proActive": true,
  "exportCredits": 0,
  "exp": 1738454400,  // Unix timestamp (30 days)
  "iss": "pdf-vault",  // Issuer
  "aud": "pdf-vault-app"  // Audience
}
```

**Signed with**: RS256 (RSA-2048)  
**Cannot be forged**: Private key never leaves server  
**Can be verified**: Public key in browser  

### License Restoration API

**Endpoint**: `POST /api/entitlement`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Process**:
1. Check local database for email
2. If found, verify subscription with Stripe API
3. If not found, search Stripe for customer
4. Generate new JWT token
5. Return token to browser

**Response**:
```json
{
  "license": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "proActive": true,
    "subscriptionStatus": "active",
    "currentPeriodEnd": 1738454400000
  }
}
```

---

## 🚀 Why This is Better Than Traditional Auth

### Traditional Auth (Username + Password):
❌ User must remember password  
❌ Need forgot password flow  
❌ Need email verification  
❌ Need password reset emails  
❌ Security risk if password leaked  
❌ More complex backend  

### Passwordless Auth (Email + JWT):
✅ User only needs email (already has it for billing)  
✅ No password to remember  
✅ No password to leak  
✅ Simpler user experience  
✅ Stripe already handles authentication  
✅ One-click restore on new devices  

---

## 🎯 Edge Cases Handled

### 1. User Changes Email in Stripe
```
Old email: old@example.com
New email: new@example.com

Problem: Database still has old email
Solution: Webhook updates database with new email
User must restore with new email
```

### 2. User Has Multiple Subscriptions
```
Situation: User subscribes twice by accident

Database: Stores latest subscription
Stripe: Both subscriptions exist
Solution: API returns active subscription only
User gets Pro status
Can cancel extra subscription in Stripe portal
```

### 3. Token Expires While User is Offline
```
User token expires after 30 days
User tries to export (offline)
Token verification fails
On next online use:
  → Token refreshed from server
  → New 30-day token issued
```

### 4. User Subscription Fails to Renew
```
Payment fails
Stripe webhook → proActive = false
Old tokens still work for up to 30 days
On restore/refresh → New token with proActive = false
User sees paywall
```

---

## 🎉 Summary

### You DON'T Need:
- ❌ Username/password system
- ❌ Session management
- ❌ Login/logout endpoints
- ❌ Password hashing
- ❌ Email verification
- ❌ Account creation forms

### You DO Have:
- ✅ Email-based authentication
- ✅ JWT tokens (signed & verified)
- ✅ Stripe as identity provider
- ✅ Webhook-based sync
- ✅ One-click license restore
- ✅ Offline support (30 days)
- ✅ Automatic token refresh

### How You Track Users:
1. **By Email** (unique identifier)
2. **In Database** (`data/subscriptions.json`)
3. **In Stripe** (source of truth)
4. **Via Webhooks** (automatic sync)

### How Users "Log In":
1. **First time**: Subscribe via Stripe → Auto-logged in
2. **Returning**: Token in localStorage → Auto-logged in
3. **New device**: Enter email → Server verifies with Stripe → Auto-logged in

**No password ever needed!** 🎉

---

## 📱 User Experience

### From User's Perspective:

**First Time**:
```
1. Try to export PDF
2. See paywall
3. Enter email
4. Pay on Stripe
5. Return to app
6. Export works! ✓
```

**Return on Same Device**:
```
1. Open app
2. Export works immediately! ✓
(Token still in localStorage)
```

**Return on New Device**:
```
1. Open app
2. Try to export
3. See paywall
4. Click "Restore license"
5. Enter email
6. Export works! ✓
```

**All seamless, no passwords, no complex flows!**

---

## 🔧 For You (The Developer)

### To Check Who's Subscribed:

**Option 1: Check Database**
```bash
cat data/subscriptions.json | jq
```

**Option 2: Check via API**
```bash
curl "localhost:3000/api/stripe/subscription?email=user@example.com"
```

**Option 3: Check Stripe Dashboard**
```
https://dashboard.stripe.com/customers
Search by email
```

### To Test Authentication:

```bash
# 1. Subscribe with test email
# 2. Open app in incognito
# 3. Try to export → Paywall
# 4. Click "Restore license"
# 5. Enter same email
# 6. Verify Pro status restored
```

---

**Bottom Line**: You have a **complete authentication system** without any traditional auth complexity. Email + Stripe + JWT = Secure & Simple! 🚀
