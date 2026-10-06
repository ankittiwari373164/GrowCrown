# Glowcrown Supabase setup

Follow `DEPLOYMENT.md` in the project root for the full deployment guide.

1. Create a Supabase project and run `schema.sql` once. If using an existing Glowcrown database, run only `002_admin_and_enquiries.sql`.
2. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` as server environment variables. Never expose the service-role key to the browser.
3. Configure customer email/password authentication and confirmation email delivery in Supabase.
4. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD` (12+ characters), and `ADMIN_SESSION_SECRET` (32+ random characters) on the server. Admin credentials are separate from customer accounts; no Supabase admin user is needed.
5. Open `/admin` and sign in. Add real products or import the example JSON format, replacing all placeholders.
6. Contact enquiries are saved in `public.enquiries` and available in Admin → Enquiries. They are not automatically emailed.
7. Test accounts, product edits, coupons, cash-on-delivery checkout, stock changes, cancellation, order history and enquiries in your project before launch.

The schema enables row-level security. Customers can see only their own profiles and orders. Public shoppers can read active products. Management requests are authorized by signed admin sessions and then use the service-role key on the server. Old customer-account admin policies are removed by the migration.

Samples appear only while the database is disconnected. No real orders or enquiries are accepted without the configured database. Online payments are not integrated. Confirm store policies and replace sample catalog imagery before selling.
