# DevSecOps CI/CD GitHub Actions

Ce projet contient un pipeline GitHub Actions conforme à l'objectif du cours : automatiser le build, les tests et les contrôles de sécurité directement dans GitHub.

## Fichiers ajoutés ou modifiés

- `.github/workflows/devsecops-ci-cd.yml` : pipeline principal CI/CD.
- `.github/dependabot.yml` : mises à jour automatiques des dépendances npm et des actions GitHub.
- `.env.example` : modèle des variables d'environnement sans secrets réels.
- `app/api/health/route.ts` : endpoint de santé utilisé par le scan DAST.
- `jest.config.js`, `jest.setup.ts`, `__tests__/password.test.ts` : configuration et test unitaire Jest.
- `next.config.ts` : headers de sécurité HTTP et configuration Next.js compatible CI.
- `eslint.config.mjs` : configuration ESLint compatible avec la version installée.

## Ce que fait le pipeline

Le workflow est déclenché sur `push`, `pull_request` et manuellement avec `workflow_dispatch`.

### 1. CI classique

Job `build-test` :

1. Installe les dépendances avec `npm ci`.
2. Lance ESLint avec `npm run lint`.
3. Lance la vérification TypeScript avec `npm run typecheck`.
4. Lance les tests unitaires avec `npm test -- --ci`.
5. Compile l'application avec `npm run build`.
6. Publie l'artefact de build Next.js.

### 2. Secret Detection

Job `secret-scan` :

- Utilise Gitleaks pour détecter les tokens, clés API et secrets committés par erreur.
- L'ancien fichier `.env` a été retiré du livrable, car il contenait des valeurs sensibles.

### 3. SAST

Job `sast-codeql` :

- Utilise CodeQL pour analyser statiquement le code TypeScript/JavaScript.
- Active les requêtes `security-and-quality`.

### 4. SCA

Job `sca-trivy` :

- Utilise Trivy pour scanner les dépendances et fichiers du dépôt.
- Échoue sur les vulnérabilités `HIGH` et `CRITICAL`.
- Publie un rapport SARIF dans GitHub Code Scanning.

### 5. DAST

Job `dast-zap` :

1. Build l'application.
2. Démarre Next.js sur `http://127.0.0.1:3000`.
3. Vérifie `/api/health`.
4. Lance OWASP ZAP Baseline Scan.
5. Publie les rapports HTML, JSON et Markdown.

### 6. Continuous Delivery

Job `delivery-artifact` :

- S'exécute après tous les contrôles sur un `push`.
- Produit un artefact de livraison indiquant le commit et la branche validés.

## Secrets GitHub à configurer

Dans GitHub : `Settings` > `Secrets and variables` > `Actions` > `New repository secret`.

Ajoutez les secrets suivants :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_GEMINI_CHAT_MODEL` facultatif
- `NEXT_PUBLIC_GEMINI_IMAGE_MODEL` facultatif
- `GEMINI_CHAT_MODEL` facultatif
- `GEMINI_IMAGE_MODEL` facultatif
- `ZAP_AUTH_TOKEN` facultatif pour un scan ZAP authentifié

Pour un scan de démonstration comme dans le cours, vous pouvez mettre `token_etudiant_123` comme valeur de `ZAP_AUTH_TOKEN`.

## Commandes locales utiles

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run ci
```

## Important

Ne remettez jamais un vrai `.env` dans Git. Utilisez `.env.local` en local et GitHub Actions Secrets pour le pipeline.
