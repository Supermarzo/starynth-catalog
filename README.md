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
  "gameVersion": "1.1.1",
  "description": "Description courte du mod.",
  "tags": ["gameplay", "personnages"],
  "iconUrl": "https://.../icon.png",
  "downloadUrl": "https://github.com/<user>/<repo>/releases/download/v1.0/mon-mod.rsm",
  "updatedAt": "2026-07-23"
}
```

- `id` : identifiant unique, sans espace (utilisé pour le nom de fichier local)
- `gameVersion` : **important**, la version exacte de SMATRS pour laquelle le mod est fait (ex: `"1.1.1"`, `"1.0.2"`...). Starynth s'en sert pour filtrer le catalogue par version et pour proposer de créer automatiquement une instance dans la bonne version si l'utilisateur n'en a pas.
- `iconUrl` : lien direct vers une image PNG (peut aussi être hébergée dans ce dépôt, ex: `https://raw.githubusercontent.com/<user>/<repo>/main/icons/mon-mod.png`)
- `downloadUrl` : lien direct vers le fichier `.rsm` (utilise les Releases GitHub, pas le code source du dépôt)

## URL du catalogue à utiliser dans Starynth

Une fois ce dépôt en ligne, l'URL à mettre dans Starynth (Paramètres → URL du catalogue) est :

```
https://raw.githubusercontent.com/<TON_PSEUDO>/<NOM_DU_DEPOT>/main/catalog.json
```

## Versions de SMATRS connues par Starynth

Starynth télécharge automatiquement ces versions (paquet "All") si un mod ou
une instance en a besoin :

| Version | Date |
|---|---|
| 1.1.1 | dernière |
| 1.1.0 | 01/03/2025 |
| 1.0.2 | 19/08/2024 |
| 1.0.1 | 17/08/2024 |
| 1.0.0 | 16/08/2024 |

Utilise une de ces valeurs exactes pour `gameVersion`.
