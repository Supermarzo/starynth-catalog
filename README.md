# Starynth Catalog

Catalogue officiel des mods disponibles dans **Starynth**, le modloader pour
*Super Mario And The Rainbow Stars*.

## Comment proposer un mod

1. Fork ce dépôt (bouton "Fork" en haut à droite de la page GitHub)
2. Ajoute une entrée dans `catalog.json` avec les infos de ton mod (voir format ci-dessous)
3. Publie ton fichier `.rsm` en tant que **Release** sur GitHub (menu "Releases" → "Create a new release" → glisser le `.rsm`) et récupère son URL pour `downloadUrl`
4. Ouvre une Pull Request vers ce dépôt

## Format d'une entrée

```json
{
  "id": "identifiant-unique-sans-espace",
  "name": "Nom affiché du mod",
  "author": "Ton pseudo",
  "version": "1.0",
  "game": "SMATRS",
  "description": "Description courte du mod.",
  "tags": ["gameplay", "personnages"],
  "iconUrl": "https://.../icon.png",
  "downloadUrl": "https://github.com/<user>/<repo>/releases/download/v1.0/mon-mod.rsm",
  "updatedAt": "2026-07-23"
}
```

- `id` : identifiant unique, sans espace (utilisé pour le nom de fichier local)
- `iconUrl` : lien direct vers une image PNG (peut aussi être hébergée dans ce dépôt, ex: `https://raw.githubusercontent.com/<user>/<repo>/main/icons/mon-mod.png`)
- `downloadUrl` : lien direct vers le fichier `.rsm` (utilise les Releases GitHub, pas le code source du dépôt)

## URL du catalogue à utiliser dans Starynth

Une fois ce dépôt en ligne, l'URL à mettre dans Starynth (paramètre `catalogUrl`) est :

```
https://raw.githubusercontent.com/<TON_PSEUDO>/<NOM_DU_DEPOT>/main/catalog.json
```
