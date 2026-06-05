#!/bin/bash
# Run this AFTER adding DNS records to NameBright for mail.moluxury.com
# It verifies the domain in Resend and updates Vercel automatically.

set -e
RESEND_KEY="re_G26NNtrk_CVFxowqpiHMgZ735pqpQKjDp"
DOMAIN_ID="acacab38-bd3a-41ed-9d56-dbcb4131de53"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  MoLuxury Email Domain Activation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Step 1: Triggering Resend domain verification..."
curl -s -X POST "https://api.resend.com/domains/${DOMAIN_ID}/verify" \
  -H "Authorization: Bearer $RESEND_KEY" > /dev/null
echo "  ✓ Verification triggered"

echo ""
echo "Step 2: Checking DNS record status..."
sleep 3
STATUS=$(curl -s "https://api.resend.com/domains/${DOMAIN_ID}" \
  -H "Authorization: Bearer $RESEND_KEY")
DOMAIN_STATUS=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','unknown'))")

echo "$STATUS" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'  Domain status: {d[\"status\"]}')
for r in d.get('records',[]):
    icon = '✓' if r['status'] == 'verified' else '✗'
    print(f'  {icon} {r[\"record\"]}: {r[\"status\"]}')
"

echo ""
if [ "$DOMAIN_STATUS" = "verified" ]; then
  echo "Step 3: Domain verified! Updating Vercel env var..."
  cd ~/moluxury
  vercel env rm RESEND_FROM_EMAIL production --yes 2>/dev/null || true
  echo "hello@mail.moluxury.com" | vercel env add RESEND_FROM_EMAIL production
  echo "  ✓ RESEND_FROM_EMAIL updated to hello@mail.moluxury.com"
  
  echo ""
  echo "Step 4: Redeploying to Vercel..."
  git commit --allow-empty -m "chore: activate verified email domain mail.moluxury.com"
  git push
  echo "  ✓ Redeploy triggered"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ✅ DONE — Customer emails now live!"
  echo "  From: hello@mail.moluxury.com"
  echo "  Test by placing a booking at /services"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "  ⚠ Domain not yet verified (status: $DOMAIN_STATUS)"
  echo "  DNS may still be propagating (up to 30 min)."
  echo "  Run this script again in a few minutes."
fi
