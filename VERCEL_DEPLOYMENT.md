# 🚀 Deploying PDF Vault to Vercel

## Quick Start

Your app is ready to deploy! Since it's 100% free with no payments, deployment is super simple.

---

## Prerequisites

1. **GitHub Account** (you already have this: `https://github.com/meetgojiya98/PDF-Vault.git`)
2. **Vercel Account** (free) - Sign up at [vercel.com](https://vercel.com)

---

## Step 1: Push Your Code to GitHub

Your changes need to be committed and pushed:

```bash
# Add all changes
git add .

# Commit with a message
git commit -m "Make app completely free - remove all pricing"

# Push to GitHub
git push origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "Add New Project"**
4. **Import your repository:**
   - Search for `PDF-Vault`
   - Click "Import"
5. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `pnpm build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
6. **Environment Variables:**
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_ENABLE_PAYMENTS` = `false`
   - Add: `NEXT_PUBLIC_APP_URL` = (leave empty, Vercel auto-fills this)
7. **Click "Deploy"**

That's it! Vercel will:
- Install dependencies
- Build your app
- Deploy it globally
- Give you a URL like `https://pdf-vault-xxx.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? pdf-vault
# - In which directory is your code? ./
# - Auto-detected settings? Yes
```

---

## Step 3: Configure Environment Variables (if needed)

After deployment, go to your Vercel dashboard:

1. **Select your project**
2. **Go to Settings → Environment Variables**
3. **Add these variables:**

```env
# Required for free app
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# Optional: Will be auto-set by Vercel
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. **Click "Save"**
5. **Redeploy** (click "Deployments" → "..." → "Redeploy")

---

## Step 4: Verify Deployment

Visit your Vercel URL and test:
- ✅ Landing page loads
- ✅ "Launch App" opens tool selection
- ✅ Upload and process a PDF
- ✅ Export works (no paywall)
- ✅ All tools function correctly

---

## Automatic Deployments

Vercel automatically deploys on every push:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

---

## Custom Domain (Optional)

To use your own domain:

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your domain (e.g., `pdfvault.com`)
2. **Update DNS records** (Vercel provides instructions)
3. **SSL is automatic!** Vercel handles HTTPS

---

## Performance Optimizations

Your app is already optimized for Vercel:
- ✅ Static page generation
- ✅ API routes for serverless functions
- ✅ Client-side PDF processing (no server load)
- ✅ Edge caching
- ✅ CDN distribution

---

## Troubleshooting

### Build Fails

**Issue:** `pnpm` not found
**Fix:** Vercel auto-detects package managers. If it fails:
1. Add `.npmrc` file with `package-manager=pnpm`
2. Or switch to `npm` by deleting `pnpm-lock.yaml`

**Issue:** TypeScript errors
**Fix:** Run `pnpm build` locally first to catch errors

### App Doesn't Work

**Issue:** Environment variables not set
**Fix:** 
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_ENABLE_PAYMENTS=false`
3. Redeploy

**Issue:** PDF tools don't work
**Fix:** This is client-side processing - check browser console for errors

### 404 Errors

**Issue:** API routes return 404
**Fix:** Ensure all API routes are in `app/api/` directory (they are!)

---

## Monitoring & Analytics

### Built-in Vercel Analytics

1. Go to your project dashboard
2. Click "Analytics" tab
3. See real-time traffic, performance, and errors

### Optional: Add Vercel Analytics to App

```bash
npm i @vercel/analytics
```

Then add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In the return statement, add:
<Analytics />
```

---

## Cost

**For Your Free App:**
- ✅ **$0/month** - Vercel Hobby plan is perfect
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month (plenty for PDFs processed client-side)
- ✅ Automatic HTTPS
- ✅ Global CDN

**If You Enable Payments Later:**
- Still free! Payment processing happens via Stripe
- Database is file-based (included)
- No additional costs

---

## Security Notes

### What's Safe

- ✅ `.env.local` is in `.gitignore` (secrets not committed)
- ✅ Client-side processing (PDFs never reach server)
- ✅ No database passwords (file-based storage)
- ✅ Vercel provides automatic HTTPS

### If You Enable Payments Later

Add these to Vercel Environment Variables (NOT GitHub):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `LICENSE_PRIVATE_KEY`

**Never commit these to Git!**

---

## Next Steps After Deployment

1. **Test Everything:**
   - All PDF tools work
   - Export functions properly
   - UI looks good on mobile

2. **Share Your App:**
   - Tweet your Vercel URL
   - Add to your portfolio
   - Get user feedback

3. **Monitor Performance:**
   - Check Vercel Analytics
   - Watch for errors in dashboard
   - Monitor bandwidth usage

4. **Optional Improvements:**
   - Add custom domain
   - Enable Vercel Analytics
   - Set up error tracking (Sentry)
   - Add SEO metadata

---

## Future: Enabling Payments on Vercel

When you're ready to monetize:

1. **Set environment variables in Vercel:**
   ```
   NEXT_PUBLIC_ENABLE_PAYMENTS=true
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   LICENSE_PRIVATE_KEY=...
   NEXT_PUBLIC_LICENSE_PUBLIC_KEY=...
   ```

2. **Update Stripe webhook URL** to:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```

3. **Redeploy**

Everything will work! The payment infrastructure is already there.

---

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js on Vercel:** [vercel.com/docs/frameworks/nextjs](https://vercel.com/docs/frameworks/nextjs)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)

---

## Summary

1. Commit and push your code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variable: `NEXT_PUBLIC_ENABLE_PAYMENTS=false`
4. Click Deploy
5. Share your app! 🎉

Your PDF Vault will be live at `https://[your-project].vercel.app` in under 2 minutes!
