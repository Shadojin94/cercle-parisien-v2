# Cercle Parisien JKD - V2

Site web du Cercle Parisien de Jeet Kune Do avec backend Node.js et PocketBase.

## Stack Technique

- **Frontend** : HTML/CSS/JS (build Vite)
- **Backend** : Node.js + Express
- **Base de données** : PocketBase
- **Paiements** : Stripe
- **Emails** : Nodemailer (Gmail SMTP)

## Déploiement

### Variables d'environnement requises

```env
# Serveur
NODE_ENV=production
PORT=3003
FRONTEND_URL=https://cercle-parisien.com

# PocketBase
POCKETBASE_URL=https://pb.cercle-parisien.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=xxx@gmail.com
SMTP_PASS=xxx
```

### Lancer en local

```bash
cd backend
npm install
npm run dev
```

### Collection PocketBase `leads`

| Champ | Type |
|-------|------|
| email | email (unique) |
| first_name | text |
| phone | text |
| plan_id | text |
| status | select |
| resumeToken | text |

**Valeurs status** : `new`, `converted`, `expired`, `confirmed_free`, `contact_form`
