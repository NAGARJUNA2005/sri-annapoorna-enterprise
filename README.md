# Sri Annapoorna — Deploy-ready bundle

This bundle includes a Next.js app (App Router) with:
- Frontend UI (customer menu & cart) styled with Tailwind and yellow/red accents
- shadcn-like UI components in `components/ui/`
- Server API routes:
  - `POST /api/otp/send` — send OTP (uses Twilio if configured, else mocks and logs)
  - `POST /api/otp/verify` — verify OTP
  - `POST /api/order` — place order (requires verified phone)
- Optional Supabase integration for persistent storage (if configured)
- File-based fallback storage in `data/` for demo/dev
- Dockerfile, vercel.json, GitHub Actions workflow

## Local setup

1. Install dependencies
```bash
npm install
```

2. Create `.env.local` from `.env.example` and set env vars as needed:
```
NEXT_PUBLIC_GOOGLE_FORM_URL=https://forms.gle/VxbMjDuGgqStyqGK6
# Optional (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM=+11234567890
# Optional (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

3. Run dev server
```bash
npm run dev
```

Open http://localhost:3000

## Production / Vercel

- Push to GitHub. In Vercel, import the repository and set environment variables listed above in Project Settings.
- The app will use Supabase and Twilio automatically if the env vars are present.
- Note: serverless file writes (to `data/`) on Vercel are ephemeral. For production you should use Supabase or another DB.

## Docker

Build and run:
```bash
docker build -t sri-annapoorna .
docker run -p 3000:3000 sri-annapoorna
```

## Supabase schema

Use `supabase-schema.sql` to create tables in your Supabase DB if you enable Supabase integration.

## Security notes

- No secrets are committed in this bundle. Use environment variables for Twilio and Supabase keys.
- Twilio and Supabase calls are only used server-side in the API routes.

"# sri-annapoorna-enterprise" 
