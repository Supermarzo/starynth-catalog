# Starynth Catalog

Catalogue officiel des mods disponibles dans **Starynth**, le modloader pour
*Super Mario And The Rainbow Stars*.

Site public : https://supermarzo.github.io/starynth-catalog/

## Comment proposer un mod (méthode simple, recommandée)

Pas besoin de Git, de fork, ni de Pull Request :

1. Ouvre **[ce formulaire](https://github.com/Supermarzo/starynth-catalog/issues/new?template=submit-mod.yml)**
   (connecte-toi à un compte GitHub gratuit si besoin)
2. Remplis les champs (nom, auteur, version, description...)
3. **Renomme ton fichier `.rsm` en `.zip`** (GitHub n'accepte pas l'extension
   `.rsm` en pièce jointe — c'est le même fichier, juste l'extension qui change
   temporairement) et glisse-le dans le champ prévu
4. Valide le formulaire

Une automatisation (GitHub Actions) traite la demande automatiquement : elle
télécharge ton fichier, l'ajoute au dépôt, met à jour `catalog.json`, et
commit tout ça — sans validation manuelle. Tu reçois une confirmation
directement sur ta demande dans les minutes qui suivent. Voir
`.github/scripts/process-submission.js` pour le détail du traitement.

## Méthode avancée (fork + Pull Request)

Toujours possible si tu préfères éditer `catalog.json` toi-même ou proposer
plusieurs mods d'un coup :

1. Fork ce dépôt
2. Ajoute une entrée dans `catalog.json` (voir le format ci-dessous) et publie
   ton `.rsm` en Release GitHub
3. Ouvre une Pull Request

## Format d'une entrée

```json
{
  "id": "identifiant-unique-sans-espace",
  "name": "Nom affiché du mod",
  "author": "Ton pseudo",
  "version": "1.0",
  "gameVersion": "1.1.1",
  "description": "Description courte du mod.",
  "tags": ["gameplay", "personnages"],
  "iconUrl": "https://.../icon.png",
  "downloadUrl": "https://raw.githubusercontent.com/<user>/<repo>/main/mods/mon-mod.rsm",
  "updatedAt": "2026-07-23"
}
```

- `id` : identifiant unique, sans espace (utilisé pour le nom de fichier local)
- `gameVersion` : **important**, la version exacte de SMATRS pour laquelle le mod est fait (ex: `"1.1.1"`, `"1.0.2"`...). Starynth s'en sert pour filtrer le catalogue par version et pour proposer de créer automatiquement une instance dans la bonne version si l'utilisateur n'en a pas.
- `iconUrl` : lien direct vers une image PNG (le dossier `icons/` de ce dépôt, rempli automatiquement par le formulaire)
- `downloadUrl` : lien direct vers le fichier `.rsm` (dossier `mods/` de ce dépôt, rempli automatiquement par le formulaire)

## URL du catalogue à utiliser dans Starynth

```
https://raw.githubusercontent.com/Supermarzo/starynth-catalog/main/catalog.json
```

## Versions de SMATRS connues par Starynth

| Version | Date |
|---|---|
| 1.1.1 | dernière |
| 1.1.0 | 01/03/2025 |
| 1.0.2 | 19/08/2024 |
| 1.0.1 | 17/08/2024 |
| 1.0.0 | 16/08/2024 |

Utilise une de ces valeurs exactes pour `gameVersion`.
