# Planyo Onboarding Email Templates

This guide is the launch-ready reference for branded onboarding emails.  
It keeps the current backend trigger logic unchanged and focuses on premium email experience (Planday-style tone, structure, and clarity).

## Current Trigger Points (Already Implemented)

### Owner signup verification
- Trigger source: `app/create-company/actions.ts`
- App call: `supabase.auth.signUp(...)`
- Redirect passed by app: `/auth/callback?next=/create-company`
- Sent by Supabase template: **Confirm signup**

### Employee invite email
- Trigger source: `app/invites/actions.ts`
- App call: `supabase.auth.signInWithOtp(...)`
- Redirect passed by app: `/join-invite?email=<invite-email>`
- Sent by Supabase template: **Magic Link / OTP**

### Employee activation / account-ready email
- Trigger source: `app/join-invite/actions.ts` after successful invite activation
- App call: `supabase.auth.signInWithOtp(...)`
- Redirect passed by app: `/login?message=Your account is active...`
- Sent by Supabase template: **Magic Link / OTP** (same template family as invite)

---

## Account States (Current Model)

Invite/account progression in `public.invites.status`:

- `invited` -> employee invited, email sent
- `pending_verification` -> employee started account creation but must verify
- `active` -> invite accepted and membership activated

State transition summary:
1. Owner/admin creates invite -> `invited`
2. Verification needed before completion -> `pending_verification`
3. Membership created + invite finalized -> `active`

---

## Planyo Email Style Guide

Use this tone across all templates:

- **Clean and modern:** short sentences, clear hierarchy, no fluff.
- **Workforce SaaS voice:** practical, trustworthy, operation-focused.
- **Confident and helpful:** “what happens next” should always be obvious.
- **Simple language:** avoid technical terms when possible.
- **Human, not robotic:** friendly without sounding casual or playful.
- **Security-aware:** reassure users they can ignore the email if unexpected.

Brand writing principles:
- Start with purpose in first line.
- Keep CTA intent explicit (“Verify account”, “Accept invitation”, “Go to login”).
- Add one fallback line for support/trust.
- Avoid generic Supabase defaults and placeholder-style wording.

---

## Premium Template Pack

## 1) Owner Verification Email

- **Template type in Supabase:** Confirm signup
- **When used:** owner creates account during company onboarding
- **Redirect target:** `/auth/callback?next=/create-company`

- **Recommended subject**
  - `Verify your email to activate your Planyo workspace`

- **Recommended preheader**
  - `One quick step to finish your account setup and open your workspace.`

- **Headline**
  - `Activate your Planyo workspace`

- **Body copy**
  - `Welcome to Planyo.`  
  - `Please verify your email to complete account setup and activate your company workspace.`  
  - `After verification, you will return to onboarding to finish setup.`

- **CTA label**
  - `Verify and continue`

- **Helper / trust text**
  - `If you did not create this account, you can safely ignore this email.`

- **Fallback plain text copy**
  - `Welcome to Planyo. Verify your email to activate your workspace: {{ .ConfirmationURL }}`

---

## 2) Employee Invitation Email

- **Template type in Supabase:** Magic Link / OTP
- **When used:** owner/admin invites an employee
- **Redirect target:** `/join-invite?email=<invite-email>`

- **Recommended subject**
  - `You’ve been invited to join your team on Planyo`

- **Recommended preheader**
  - `Accept your invitation to access schedules, shifts, and team updates.`

- **Headline**
  - `You are invited to Planyo`

- **Body copy**
  - `Your company has invited you to join its workspace in Planyo.`  
  - `Planyo helps teams manage schedules, shifts, and daily workforce operations in one place.`  
  - `Use the button below to accept your invitation and continue account setup.`

- **CTA label**
  - `Accept invitation`

- **Helper / trust text**
  - `If you were not expecting this invitation, please contact your manager before continuing.`

- **Fallback plain text copy**
  - `You were invited to join your team on Planyo. Accept invitation: {{ .ConfirmationURL }}`

---

## 3) Employee Activation / Account Ready Email

- **Template type in Supabase:** Magic Link / OTP (reused event)
- **When used:** employee invite is accepted and account is active
- **Redirect target:** `/login?message=Your account is active...`

- **Recommended subject**
  - `Your Planyo account is active`

- **Recommended preheader**
  - `Your setup is complete. Use your email as your login username.`

- **Headline**
  - `Your account is ready`

- **Body copy**
  - `Your Planyo account has been activated successfully.`  
  - `You can now sign in using this email address as your username/login.`  
  - `Open the login page to access your workspace.`

- **CTA label**
  - `Go to login`

- **Helper / trust text**
  - `Need help accessing your account? Contact your workspace admin or support.`

- **Fallback plain text copy**
  - `Your Planyo account is active. Log in with your email: {{ .ConfirmationURL }}`

---

## What App Code Handles vs Supabase Handles

### Handled by app code (already in project)
- Decides when each email event fires.
- Sets onboarding states (`invited`, `pending_verification`, `active`).
- Passes redirect targets through `emailRedirectTo`.
- Completes invite acceptance and membership creation.

### Handled by Supabase Auth settings
- Email template content (subject, preheader, body, CTA text, HTML branding).
- Sender name/address and SMTP delivery setup.
- Auth redirect allowlist and URL safety settings.

---

## Manual Setup Required In Supabase (Go-Live Checklist)

1. In Supabase Auth -> Email Templates, customize:
   - Confirm signup (owner verification)
   - Magic Link / OTP (invitation + account-ready)
2. Apply Planyo branding:
   - logo, colors, spacing, typography, footer
   - production sender name and from-address
3. Configure SMTP/custom sender domain for trusted delivery.
4. Set Auth Site URL to production domain.
5. Add redirect allowlist entries:
   - `https://<your-domain>/auth/callback`
   - `https://<your-domain>/join-invite`
   - `https://<your-domain>/login`
6. Send test emails for all 3 flows in staging and verify copy/links.

---

## Launch Verification Checklist

1. Owner signup sends branded verification and returns to create-company onboarding.
2. Employee invite sends branded invitation with “Accept invitation”.
3. Employee activation sends branded account-ready email with login CTA.
4. Status transitions remain correct:
   - `invited -> pending_verification -> active`
   - or `invited -> active` when verification is not required.
