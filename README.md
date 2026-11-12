# fx50-app

Published calculator and Program Code Book for classroom use. **Website builds only**: the source lives in the private `fx50-live` repo.

Live: https://nixonchanmath.github.io/fx50-app/

| Page | File |
|---|---|
| fx-50FH II | `index.html` (same as `fx-50FH-II.html`) |
| fx-3650P II | `fx-3650P-II.html` |
| Program library | `library.html` |

## Publishing a new release
From a folder that has both `fx50-live` and `fx50-app` side by side:

```bash
cd fx50-live/variants/standard && node check.mjs && node prepare-publish.mjs && cd ../../..
cd fx50-app && node tools/sync-from-source.mjs ../fx50-live/variants/standard/public
git add -A && git commit -m "Release x.y.z" && git push
```

`tools/sync-from-source.mjs` copies the build, makes `/icons` and manifest paths relative (Pages serves under `/fx50-app/`), and uses the icons in `icons-src/`.

## Safety
This repo is public. Do not commit student data, passwords or private notes here. See `.gitignore`.
