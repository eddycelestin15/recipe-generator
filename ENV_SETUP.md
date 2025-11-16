# Environment Variables Setup

This document lists all the required environment variables for the Recipe Generator application. You must configure these on Vercel (or your hosting platform) for the application to work correctly.

## Required Environment Variables

### MongoDB Atlas
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```
Get your connection string from: https://cloud.mongodb.com/

### NextAuth Configuration
```
AUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.vercel.app
```
Generate a secret with: `openssl rand -base64 32`

### Google OAuth
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```
Get credentials from: https://console.cloud.google.com/

### Google Gemini API
```
GEMINI_API_KEY=<your-gemini-api-key>
```
Get your API key from: https://makersuite.google.com/app/apikey

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_live_<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>
STRIPE_PRICE_MONTHLY=price_<your-monthly-price-id>
STRIPE_PRICE_YEARLY=price_<your-yearly-price-id>
```
Get your keys from: https://dashboard.stripe.com/apikeys
Get webhook secret from: https://dashboard.stripe.com/webhooks

### Resend API (Email)
```
RESEND_API_KEY=re_<your-resend-api-key>
```
Get your API key from: https://resend.com/api-keys

### Application Configuration
```
NODE_ENV=production
```

## Setting Environment Variables on Vercel

1. Go to your project on Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable listed above
4. Make sure to select the appropriate environments (Production, Preview, Development)
5. Click "Save"
6. Redeploy your application for changes to take effect

## Important Notes

- **Never commit** `.env` or `.env.local` files to GitHub
- Keep your API keys and secrets secure
- Use different API keys for development and production
- For Stripe, use test keys (`sk_test_`, `pk_test_`) during development
- The MONGODB_URI must point to a valid MongoDB Atlas cluster
- For NEXTAUTH_URL, use your actual domain in production

## Vercel CLI Alternative

You can also add environment variables using the Vercel CLI:

```bash
vercel env add MONGODB_URI production
vercel env add AUTH_SECRET production
# ... repeat for all variables
```

## Testing Locally

1. Copy `.env.example` to `.env.local`
2. Fill in all the required values
3. Run `npm run dev` to test locally
4. Ensure all features work before deploying

## Troubleshooting

If you encounter build errors:
- Verify all required environment variables are set on Vercel
- Check that MongoDB URI is correct and accessible
- Ensure Stripe webhook secret matches your webhook configuration
- Verify NextAuth URL matches your domain
