# ── Email Configuration ──────────────────────────────────────────────────────
# Fill in your Gmail (or other SMTP provider) credentials below.
#
# For Gmail:
#   1. Enable 2-Factor Authentication on your Google account
#   2. Go to: https://myaccount.google.com/apppasswords
#   3. Create an App Password for "Mail" → copy the 16-char password
#   4. Use that as EMAIL_HOST_PASSWORD (NOT your normal Gmail password)

EMAIL_HOST          = 'smtp.gmail.com'
EMAIL_PORT          = 587
EMAIL_HOST_USER     = 'your-email@gmail.com'    # ← your Gmail address
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'     # ← 16-char App Password
EMAIL_USE_TLS       = True
SENDER_EMAIL        = 'your-email@gmail.com'    # ← same as EMAIL_HOST_USER
ADMIN_EMAIL         = 'your-email@gmail.com'    # ← admin notifications go here