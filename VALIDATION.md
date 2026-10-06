# Validation

Completed for this revision:
- TypeScript type checking.
- Standard Next.js production build for the downloadable Node deployment package.
- Signed admin-session checks: missing configuration fails closed; incorrect comparisons fail; valid sessions verify; modified signatures and forged payloads fail; password rotation invalidates old sessions.
- Vinext/Cloudflare production build for the hosted review version.
- ZIP integrity and exclusion of credentials, build caches and node_modules.

Pending after you supply your Supabase project:
- Customer authentication/email delivery, live database writes, checkout/coupon/stock transactions, enquiry persistence and admin CRUD against the configured database.
- End-to-end browser interaction and visual QA. Browser preview infrastructure was unavailable in this environment.

No real orders, customer data or enquiry submissions were created during validation. The embedded map is city-level and its external provider availability may depend on the visitor's browser and network.
