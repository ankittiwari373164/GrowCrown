# Deploy Glowcrown

This ZIP contains the complete application source, images, UI components, lockfile, environment template and Supabase SQL. Dependencies are installed on your host; `node_modules`, personal credentials and generated build output are intentionally excluded.

## 1. Node.js hosting (recommended for this ZIP)

Use a Node.js server or a platform that supports Next.js. A PHP-only/shared static host cannot run the account, admin, enquiry and checkout APIs.

Requirements: Node.js 22.13+ and pnpm 11.25.0.

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env
```

Fill in `.env` locally, or set the same six variables as encrypted server environment variables on your hosting platform:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Project anon/publishable key for customer operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Project service-role key, server only |
| `ADMIN_USERNAME` | Your chosen admin username |
| `ADMIN_PASSWORD` | A unique password of at least 12 characters |
| `ADMIN_SESSION_SECRET` | A random secret of at least 32 characters |

Generate a random session secret without committing it to your source repository:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not prefix secrets with `NEXT_PUBLIC_`. Do not commit `.env`. No default admin credentials are included. The admin panel stays locked until its variables are configured.

Build and run:

```bash
pnpm build:node
pnpm start:node
```

The default port is 3000. Set `PORT` for a different port. Put the production server behind HTTPS. Configure automatic process restarts using your host, systemd, PM2 or a container service.

For a managed Next.js host, set the install command to `pnpm install --frozen-lockfile`, the build command to `pnpm build:node`, and use that host's Next.js runtime. Configure all server variables there before deployment.

For local development:

```bash
pnpm dev:node
```

The existing `dev` and `build` scripts use the Vinext/Cloudflare runtime used for the review Site. For standard Node deployment, use the explicit `*:node` commands above. The sanitized `.openai/hosting.json` in this ZIP contains no existing Site identity.

## 2. Supabase database

- **New database:** execute `supabase/schema.sql` once.
- **Existing Glowcrown database from the previous version:** execute only `supabase/002_admin_and_enquiries.sql`.
- Do not run the initial schema twice.
- Configure email/password authentication, confirmation-email delivery and your production Site URL in Supabase Auth settings.

Admin sign-in uses the server environment credentials, independently of Supabase customer accounts. It does not require a Supabase admin user or an `admins` table entry. The service-role key is used only in server code after admin session validation, and for validated enquiry submissions.

## 3. Store administration

Open `/admin`, sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`, and manage products, orders, coupons, customers and enquiries. Sessions expire after one hour; sign in again when needed. Signing out removes the session cookie. Changing the password or session secret invalidates existing sessions.

Add real products and authorized photographs. Use `supabase/products-example.json` for the bulk import format. Manage image uploads in your image hosting or Supabase Storage and paste HTTPS URLs into products.

Enquiries submitted on `/contact` are saved in Supabase and listed under Admin → Enquiries. They are not emailed automatically. Mark enquiries resolved after responding through your normal communication channel.

## 4. Launch checks

1. Verify customer signup, email confirmation and login.
2. Verify wrong admin credentials are rejected and correct credentials open the panel.
3. Verify a customer cannot access management APIs or other customers' orders.
4. Add a product, set stock and create a coupon.
5. Place a cash-on-delivery test order, verify totals and stock, then test cancellation and restocking.
6. Submit a contact enquiry and confirm it appears in the admin inbox.
7. Confirm your shipping, return, privacy, tax and sizing information.
8. Replace sample products and photography. The map shows Farrukhabad city only; replace its query with your exact address when confirmed.
9. Configure rate limits at your hosting/CDN edge for `/api/admin` and `/api/contact`. Included per-instance throttling is best effort, not a shared multi-server rate limit.

## Commerce scope

Cash on delivery is implemented. Card/UPI payment capture, automatic refunds and courier API integration are not configured. Delivery is currently ₹99, waived for subtotal ₹1,999+: change both the database function and storefront estimate when changing this rule. Stock is tracked per product across sizes. Bag and wishlist remain device-local; orders, accounts, catalog, coupons and enquiries persist in Supabase.

## Validation

See `VALIDATION.md` for the checks performed on this package and the integrations that still need your credentials.
