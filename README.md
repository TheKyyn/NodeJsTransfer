# NodeJsTransfer - Backend

Ce repository contient le backend du projet NodeJsFinal, un serveur de fichiers avec des fonctionnalités d'authentification, de gestion de fichiers, et de liens de partage.

## Fonctionnalités

- **Authentification** : Inscription, connexion avec token JWT.
- **Gestion de Fichiers** : Téléchargement, suppression, génération de liens de partage temporaires.
- **Quota d'Upload** : 2 Go par utilisateur, avec mise à jour automatique.

## Prérequis

- Node.js et MySQL
- Docker et Docker Compose pour une conteneurisation facile.

## Installation et Déploiement

Clonez le repo :

```bash
git clone https://github.com/TheKyyn/NodeJsTransfer.git
cd NodeJsTransfer
```

Lancer en Docker :

```bash
docker-compose up -d --build
```

## Endpoints

- `POST /api/auth/register` : Inscription.
- `POST /api/auth/login` : Connexion.
- `POST /api/files/upload` : Upload d'un fichier.
- `GET /api/files/list` : Liste des fichiers.
- `POST /api/files/share/:fileId` : Générer un lien de partage.
