# 📄 PDF Vault

> Enterprise-grade, offline-first PDF utilities that run entirely in your browser. Beautiful, fast, and 100% private.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 🛠️ PDF Tools
- **Merge PDFs** - Combine multiple documents with custom ordering
- **Split & Extract** - Extract specific page ranges into new files
- **Digital Signature** - Add handwritten signatures to documents
- **Safe Redaction** - Permanently remove sensitive information
- **Strong Compression** - Reduce file size with advanced bitmap compression
- **Batch Processing** - Handle multiple files simultaneously

### 🎨 Design & UX
- **Enterprise-grade UI** - Modern, beautiful interface with advanced animations
- **Glass morphism effects** - Stunning backdrop blur and transparency
- **Smooth animations** - Fade-in, slide-in, scale, and hover effects
- **Interactive cards** - Dynamic hover states with mouse tracking
- **Gradient accents** - Vibrant color schemes throughout
- **Responsive design** - Optimized for all screen sizes
- **Dark mode optimized** - Eye-friendly color palette

### 🔒 Privacy & Security
- **100% Offline processing** - Files never leave your browser
- **No tracking** - Zero data collection or analytics
- **Client-side only** - All PDF operations run locally
- **Secure payments** - Powered by Stripe Checkout

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **PDF Processing**: pdf-lib + pdfjs-dist (MIT-licensed)
- **Storage**: IndexedDB for local file history
- **Payments**: Stripe Checkout
- **Authentication**: JWT-based license tokens

## 📦 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Stripe account (for payments)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_SUBSCRIPTION=price_...
STRIPE_PRICE_ID_EXPORT_PACK=price_...

# License Keys (ES256 keypair)
LICENSE_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----...
NEXT_PUBLIC_LICENSE_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
```

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🎨 Design System

### Color Palette
- **Primary**: Cyan (#22d3ee) - Main brand color
- **Secondary**: Blue (#3b82f6) - Accent color
- **Success**: Emerald (#10b981) - Positive actions
- **Warning**: Amber (#f59e0b) - Alerts
- **Backgrounds**: Slate (950-900) - Dark theme base

### Animations
- `fade-in` - Smooth entry animations
- `slide-in` - Horizontal slide transitions
- `scale-in` - Scale-up effects for modals
- `shimmer` - Loading state effects
- `float` - Floating background elements
- `pulse-glow` - Glowing text effects

### Components
All components feature:
- Hover states with smooth transitions
- Glass morphism effects
- Gradient borders and backgrounds
- Interactive feedback
- Accessibility support

## 🔧 Stripe Setup

### 1. Create Products
In the Stripe dashboard, create:
- **Pro Subscription**: $0.99/month (recurring)
- **Export Pack**: $1.99 (one-time, quantity: 5)

### 2. Configure Webhook
Create a webhook endpoint:
- **URL**: `https://your-domain.com/api/stripe/webhook`
- **Events**: `checkout.session.completed`
- Copy the webhook secret to `.env.local`

### 3. Test Payments
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 🔐 License Key Generation

Generate an ES256 keypair for license tokens:

```bash
# Generate private key
openssl ecparam -name prime256v1 -genkey -noout -out private.pem

# Generate public key
openssl ec -in private.pem -pubout -out public.pem
```

Copy the contents to your `.env.local` file.

## 🧪 Testing the Tools

### Merge PDFs
1. Upload multiple PDF files
2. Drag to reorder
3. Click "Merge" to combine
4. Export the result

### Split & Extract
1. Upload a PDF
2. Enter page ranges (e.g., `1-3,5,7-9`)
3. Process and export

### Digital Signature
1. Draw your signature
2. Drag signature onto pages
3. Process and export

### Safe Redaction
1. Draw rectangles over sensitive content
2. Process to permanently flatten
3. Export redacted PDF

### Compression
1. Upload PDF
2. Select quality/DPI
3. Process and export compressed file

## 📈 Performance

- **Initial Load**: < 2s
- **PDF Processing**: < 1s for most operations
- **Offline-ready**: Works without internet after first load
- **Zero server load**: All processing client-side

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app works on any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## 🏗️ Project Structure

```
PDF-Vault/
├── app/                    # Next.js app router
│   ├── api/               # API routes (Stripe, entitlements)
│   ├── app/               # Main app pages
│   ├── globals.css        # Global styles & animations
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── src/
│   ├── components/        # React components
│   │   ├── AppShell.tsx       # Main layout with header
│   │   ├── FileDropzone.tsx   # File upload component
│   │   ├── ToolGrid.tsx       # Tool selection grid
│   │   ├── ExportModal.tsx    # Export confirmation
│   │   └── PaywallModal.tsx   # Payment options
│   ├── engine/            # PDF processing
│   ├── services/          # Stripe & licensing
│   ├── storage/           # IndexedDB
│   └── utils/             # Helpers
└── public/                # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Stripe](https://stripe.com) - Payment processing
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Next.js](https://nextjs.org) - React framework

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@pdfvault.example.com
- Visit our [documentation](https://docs.pdfvault.example.com)

---

**Made with ❤️ for privacy-conscious users**
