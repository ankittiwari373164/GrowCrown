# Glowcrown Boutique

Animated multipage boutique storefront and management panel protected by server environment credentials.

## Development

Use Node 22+, install dependencies using the lockfile, and run the development script. The project uses React 19 and Vinext (Next-compatible routing), with a Cloudflare Workers production target.

## Database and accounts

Follow `DEPLOYMENT.md` and `supabase/SETUP.md`. The database schema, example product import and manual setup guide are included. No Supabase credentials are committed. Until connected, the storefront renders clearly labelled sample products and disables checkout and management writes.

## Commerce

Product discovery, category and price filters, product details and sizes, device-local bag/wishlist, Supabase customer accounts, transactional cash-on-delivery checkout, order history, product CRUD/import, coupon CRUD, customer notes and order status/tracking management. Database policies protect customer and admin records.

## Configuration still needed

Supabase project and auth configuration, real catalog and photography, business policy confirmation, and any online payment provider. Online payment capture, refunds and courier API integration are not implemented. Current shipping fee is configurable in the SQL function and matching UI. Stock is per product, not independently per size.

## Validation

TypeScript and production build are checked. Live Supabase integration requires a configured project. Browser QA was unavailable in this execution environment. See VALIDATION.md.

## Updates
Expanded homepage information and About sections, contact map and stored enquiry form, price range filters, server-only admin credentials and an enquiries inbox. For standard Node/Next.js deployment use `pnpm build:node` and `pnpm start:node`.

## Catalogue v2 (06-Oct-2026)
- `data/boutique.json` is generated from the Amazon Active Listings + Inventory reports: every women's clothing listing (1,019 rows) grouped into 134 designs / 967 colour × size variants across 9 categories. Each variant keeps its SKU, ASIN, price, stock and FBA flag; "Buy on Amazon" opens the exact variant's ASIN.
- Regenerate after a new report: `python3 scripts/build-catalog.py <Active_Listings.txt> <Inventory.txt> .`
- Product images: real Amazon photos (main + up to 8 extra per colour) linked from m.media-amazon.com. Refresh them with `python3 scripts/attach-images.py <CategoryListingsReport.xlsm>`.
- Logo: `public/assets/logo-badge.png`, `logo-crown.png`, `logo-wordmark.jpg`, `favicon.png` — all cut from the supplied brand.png.
