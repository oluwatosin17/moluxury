# DNS Setup — mail.moluxury.com (Resend Domain Verification)

## Why this is needed

Customer booking confirmation emails cannot be delivered until this is done.
Currently Resend is in sandbox mode — only omosope43@gmail.com can receive emails.
Once these 3 DNS records are added and verified, ALL customer emails will deliver.

## Where to add the records

1. Go to: https://www.namebright.com (your DNS registrar)
2. Sign in to your account
3. Find moluxury.com → DNS / Nameserver settings
4. Add the 3 records below exactly as shown

---

## Record 1 — DKIM (proves you own the domain)

| Field    | Value |
|----------|-------|
| Type     | TXT |
| Name/Host | `resend._domainkey.mail` |
| Value    | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCujhVrXgiFWUE7IP9NFeWBY38KGwSS4RGJWyRDP8y07J0cG1wDybRJjz135Jegz5DUycpBx2Sma5fknMNekCYxM/dorvkXDJ+vlbf1mLbZfFr1/+L9NjLSSYVsIR4v//3+QSMU5ZkRnQqX7H0tdRd8ZAW7MnP40kpwsm5He5VeWwIDAQAB` |
| TTL      | Auto (or 3600) |

Full hostname this creates: `resend._domainkey.mail.moluxury.com`

---

## Record 2 — SPF Bounce (MX record)

| Field    | Value |
|----------|-------|
| Type     | MX |
| Name/Host | `send.mail` |
| Value/Points to | `feedback-smtp.eu-west-1.amazonses.com` |
| Priority | `10` |
| TTL      | Auto (or 3600) |

Full hostname: `send.mail.moluxury.com`

---

## Record 3 — SPF Policy (TXT record)

| Field    | Value |
|----------|-------|
| Type     | TXT |
| Name/Host | `send.mail` |
| Value    | `v=spf1 include:amazonses.com ~all` |
| TTL      | Auto (or 3600) |

Full hostname: `send.mail.moluxury.com`

---

## After adding the records

DNS propagation takes 5–30 minutes typically (up to 48h max).

### Step 1 — Trigger verification in Resend
Run this once from terminal:
```bash
curl -s -X POST "https://api.resend.com/domains/acacab38-bd3a-41ed-9d56-dbcb4131de53/verify" \
  -H "Authorization: Bearer re_G26NNtrk_CVFxowqpiHMgZ735pqpQKjDp"
```

### Step 2 — Check verification status
```bash
curl -s "https://api.resend.com/domains/acacab38-bd3a-41ed-9d56-dbcb4131de53" \
  -H "Authorization: Bearer re_G26NNtrk_CVFxowqpiHMgZ735pqpQKjDp" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print('Status:', d['status'])
for r in d['records']: print(f'  {r[\"record\"]}: {r[\"status\"]}')
"
```

Should show `status: verified` and all records `verified`.

### Step 3 — Update Vercel env var
```bash
cd ~/moluxury
vercel env rm RESEND_FROM_EMAIL production --yes
echo "hello@mail.moluxury.com" | vercel env add RESEND_FROM_EMAIL production
git commit --allow-empty -m "chore: switch RESEND_FROM_EMAIL to verified domain" && git push
```

### Step 4 — Test
Place a test booking on https://moluxury.vercel.app/services/wig-installation
with a real customer email address.
Check both omosope43@gmail.com (admin) AND the customer email receive the emails.

---

## Current state (before DNS is added)

The code has a **fallback** in place:
- Booking is always saved to Supabase ✅
- Admin gets the booking notification ✅
- If customer email fails → admin gets a second email:
  Subject: "⚠️ PLEASE FORWARD TO CUSTOMER: {email} — {service} confirmation"
  → Admin can manually forward this to the customer until domain is verified

## Resend Domain ID (save this)

`acacab38-bd3a-41ed-9d56-dbcb4131de53`
