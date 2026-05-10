# Contributing Guide

## Objectif

Ce document explique comment les membres de l’équipe doivent contribuer au projet afin de garder un travail organisé, éviter les conflits de code et faciliter la collaboration.

Le projet utilise GitHub avec une stratégie simple basée sur les branches suivantes :

- `main` : branche stable
- `dev` : branche principale de développement
- `feature/*` : branches de travail pour chaque fonctionnalité

---

## Organisation des branches

### `main`
Cette branche contient uniquement la version stable du projet.  
Aucun développement direct ne doit être fait sur cette branche.

### `dev`
Cette branche contient la version de développement commune à toute l’équipe.  
Les nouvelles fonctionnalités validées sont fusionnées dans `dev`.

### `feature/...`
Chaque membre doit créer sa propre branche pour développer une tâche ou une fonctionnalité.

Exemples :

- `feature/login`
- `feature/chat`
- `feature/profile-page`
- `feature/notifications`

---

## Règles générales

- Ne jamais coder directement sur `main`
- Ne jamais faire un gros développement directement sur `dev`
- Toujours créer une branche de fonctionnalité à partir de `dev`
- Toujours mettre à jour `dev` avant de commencer une nouvelle tâche
- Toujours faire des commits clairs et compréhensibles
- Toujours créer un Pull Request avant de fusionner dans `dev`

---

## Cas 1 : Nouveau membre de l’équipe

Un nouveau membre doit suivre ces étapes la première fois qu’il rejoint le projet.

### 1. Cloner le dépôt

```bash
git clone https://github.com/USERNAME/PROJECT_NAME.git

2. Entrer dans le dossier du projet
cd PROJECT_NAME


3. Installer les dépendances
npm install

4. Récupérer toutes les branches distantes
git fetch --all

5. Se placer sur la branche dev
git checkout dev

Si cela ne marche pas directement :

git checkout -b dev origin/dev
6. Vérifier que le projet fonctionne
npm run dev

Le nouveau membre doit s’assurer que le projet démarre correctement avant de commencer à coder.

Cas 2 : Membre déjà présent dans l’équipe

Chaque membre déjà intégré à l’équipe doit suivre cette routine avant chaque séance de travail.

Chaque matin ou avant de commencer une tâche
1. Se placer sur dev
git checkout dev
2. Mettre à jour dev
git pull origin dev

Cette étape est obligatoire pour récupérer le travail des autres membres.

3. Créer une nouvelle branche pour la tâche
git checkout -b feature/nom-de-la-tache

Exemples :

git checkout -b feature/login-form
git checkout -b feature/chat-ui
git checkout -b feature/create-post
Développement d’une fonctionnalité

Pendant le développement :

Ajouter les modifications
git add .
Faire un commit
git commit -m "Add login form"

Exemples de bons messages de commit :

Add user profile page

Fix message display bug

Improve post creation form

Add notifications UI

Éviter les messages vagues comme :

update

work

modification

test

Envoyer sa branche sur GitHub

Après les commits :

git push origin feature/nom-de-la-tache

Exemple :

git push origin feature/login-form

Pull Request: 

Quand la fonctionnalité est prête :

Aller sur GitHub

Ouvrir la section Pull Requests

Cliquer sur New Pull Request

Choisir :

base : dev

compare : votre branche feature/...

Ajouter un titre clair

Ajouter une courte description des modifications

Créer le Pull Request

Validation avant fusion

Avant qu’un Pull Request soit accepté, il faut vérifier :

que le code fonctionne

qu’il n’y a pas de conflit

que la fonctionnalité respecte la tâche demandée

que le projet compile correctement

que le code ne casse pas le travail des autres

Après fusion dans dev

Une fois le Pull Request accepté et fusionné :

Revenir sur dev
git checkout dev
Mettre à jour dev
git pull origin dev
Supprimer l’ancienne branche locale si nécessaire
git branch -d feature/nom-de-la-tache

Ajouter une nouvelle dépendance

Si un membre a besoin d’une nouvelle dépendance, par exemple axios :

npm install axios

Ensuite il doit commit les fichiers modifiés :

git add package.json package-lock.json
git commit -m "Add axios dependency"
git push origin feature/nom-de-la-tache
Important

Quand une nouvelle dépendance est ajoutée :

il faut prévenir l’équipe

les autres membres devront exécuter :

npm install

ou, si nécessaire :

npm install axios

En général, après un git pull, faire npm install est une bonne habitude si package.json a changé.

Si un membre récupère les changements des autres

Si dev a été mise à jour entre-temps, le membre doit mettre sa branche à jour.

Méthode simple
git checkout dev
git pull origin dev
git checkout feature/nom-de-la-tache
git merge dev

Puis résoudre les conflits s’il y en a.

Conventions de nommage des branches

Utiliser des noms clairs et courts.

Recommandé

feature/login

feature/register-page

feature/chat-system

feature/post-comments

fix/navbar-bug

fix/profile-image-upload

À éviter

branche1

travail

modification

new

test123

Conventions de commit

Les commits doivent être simples, précis et en anglais si possible.

Exemples recommandés

Add login page

Create post model

Fix chat scroll bug

Update README

Improve notification layout

Ce qu’un membre doit faire au quotidien

Chaque membre doit suivre cette organisation :

Début de journée

ouvrir GitHub ou le groupe de communication

vérifier sa tâche du jour

se placer sur dev

faire git pull origin dev

créer ou reprendre sa branche de travail

Pendant le travail

coder uniquement sur sa branche

faire des commits réguliers

tester souvent sa partie

Fin de journée

pousser son travail sur GitHub avec git push

noter l’avancement de sa tâche

prévenir l’équipe si nécessaire

Ce qu’il ne faut pas faire

pousser directement sur main

travailler longtemps sans faire de commit

modifier plusieurs grandes fonctionnalités dans une seule branche

fusionner sans Pull Request

ignorer les conflits Git

ajouter une dépendance sans prévenir l’équipe
