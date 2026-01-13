# Chatbot Martin - Cercle Parisien JKD

## Contexte Projet

Chatbot de conversion IA pour école d'arts martiaux. Utilise OpenAI GPT-4o avec function calling pour :
- Capturer des leads (PocketBase)
- Générer des liens de paiement (Stripe)
- Envoyer des emails personnalisés

## Stack Technique

- **Backend** : Node.js + Express
- **IA** : OpenAI GPT-4o (function calling)
- **CRM** : PocketBase (collection `leads`)
- **Paiements** : Stripe Checkout
- **Emails** : Nodemailer (SMTP Gmail)
- **Frontend** : Vanilla JS + GSAP
- **Déploiement** : Coolify (Docker)

## Configuration Requise

Variables d'environnement Coolify :
```
OPENAI_API_KEY, OPENAI_MODEL
POCKETBASE_URL
STRIPE_SECRET_KEY
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
FRONTEND_URL
```

## Pour Dupliquer

1. Fork le repo
2. Modifier `SYSTEM_PROMPT` dans `backend/chatbot/openai.js`
3. Modifier Price IDs Stripe dans `backend/chatbot/tools.js`
4. Modifier signature emails dans `tools.js`
5. Déployer sur Coolify avec les bonnes env vars

## Prochaines Étapes

- [ ] Workflow n8n auto-reply formulaire (60 min délai)
- [ ] Tests emails après dernier déploiement
