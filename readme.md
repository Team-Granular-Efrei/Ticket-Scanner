# Ticket Scanner

C'est une application web pour **scanner vos tickets de caisse** et **gérer vos dépenses** automatiquement grâce à l'IA.

## Concept

**Ticket Scanner** permet de :
- **Scanner vos tickets** avec votre téléphone
- **Extraire automatiquement** les données (commerçant, montant, articles, date, etc.)
- **Corriger et éditer** les informations si nécessaire
- **Sauvegarder** dans votre portefeuille
- **Visualiser votre historique** et vos statistiques de dépenses

## Prérequis

- **Node.js** : `20.19.0` (version exacte requise)
- **pnpm** : `10.14.0`

> Utilisez [nvm](https://github.com/nvm-sh/nvm) pour gérer vos versions de Node.js : `nvm use`

## Installation et Lancement

### Étapes

```bash
git clone https://github.com/Team-Granular-Efrei/Ticket-Scanner.git
cd Ticket-Scanner
nvm use  # Pour utiliser la version Node.js du projet
npm install

# Créer un fichier .env.local et configurer :
MISTRAL_API_KEY=cle_api_mistral
NEXT_PUBLIC_API_URL=http://localhost:3001

npm run dev
```

L'application sera disponible sur `http://localhost:3000` et la db sur `http://localhost:3001`.

## Comment Utiliser

### Scanner un Reçu
1. Cliquez sur le bouton de scan
2. Prenez une photo du reçu
3. Attendez que l'IA l'analyse (quelques secondes)

### Éditer les Données
Une fois analysé, vous pouvez modifier :
- **Commerçant** : Nom du magasin
- **Date** : Date d'achat
- **Catégorie** : Groceries, Dining, Transport, Shopping, etc.
- **Articles** : Nom, prix, quantité

### Sauvegarder
Cliquez sur **"Save to Wallet"** pour enregistrer le reçu.

### Consulter l'Historique
Depuis le bouton de à l'acceuil, permet de consulter :
- Dépense totale
- Tous vos reçus récents
- Montants par achat
- Nombre d'articles

## Technologies Utilisées

- React 19, Next.js 16, TypeScript
- Tailwind CSS v4
- Mistral AI (OCR + Chat)
- JSON Server (local)
