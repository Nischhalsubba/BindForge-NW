# Email accounts for BindForge NW

The application supports email/password sign-up, sign-in, confirmation redirects and password recovery through the existing Supabase project. Google remains optional. Browser-only copying and local backups do not require an account.

## Owner configuration

1. Open the BindForge NW Supabase project and enable Email under Authentication → Sign In / Providers. Keep email confirmations enabled.
2. In Authentication → URL Configuration, set the Site URL to `https://neverwinterkeybind.netlify.app` and allow these redirect URLs:
   - `https://neverwinterkeybind.netlify.app/account`
   - `https://neverwinterkeybind.netlify.app/account?recovery=1`
3. Configure a transactional mail provider under Authentication → Email → SMTP Settings. Use the provider's verified sender domain, SMTP host, port, username and password. Store these credentials in Supabase, never in this repository or browser configuration.
4. Confirm that the confirmation and password recovery templates use Supabase's confirmation URL, preserving the supplied redirect destination. Configure appropriate email rate limits for the chosen provider's allowance.
5. Test with an address outside the Supabase project team: create an account, confirm the email, sign in, approve guest migration, change a shortcut, reload, and open the account on a second device. Then test Forgot password using the emailed link. Confirm that signing out hides account-owned local data.

The default Supabase sender is intended for testing and restricts recipients; an enabled Email provider does not prove public email delivery works. SMTP credentials and a verified sender domain are owner configuration. These are not available through the connected database tools.

## Cost

Email/password authentication can run within Supabase's Free plan allowance. SMTP providers have separate limits and pricing. Check current allowances before opening public sign-up; this is not a promise of unlimited free hosting or email.

## Existing data and security

The new sign-in method uses the existing account-owned workspace tables, RLS policies, revision checks, conflict review and export/deletion controls. Signing in does not silently upload guest data; the account screen asks the user to review and approve migration or select the cloud version.

## References

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/pricing
