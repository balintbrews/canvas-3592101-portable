Install the released baseline with Node 22.19+ (22.x) or Node 24.5+:

```sh
npm ci
```

Portable APIs require the MR packages until released. Install them in a
disposable copy. Set `CANVAS_MR` to a separate Canvas checkout at `025c6a7af034447dd0b2941d2196c05aa7f6a117`:

```sh
set -e
export PACKS="$(mktemp -d)"
(
  cd "$CANVAS_MR"
  test "$(git rev-parse HEAD)" = 025c6a7af034447dd0b2941d2196c05aa7f6a117
  npm ci
  for package in drupal-canvas @drupal-canvas/vite-plugin @drupal-canvas/cli @drupal-canvas/workbench; do
    npm run build --workspace="$package"
  done
  for package in drupal-canvas @drupal-canvas/cli @drupal-canvas/workbench; do
    npm pack --ignore-scripts --workspace="$package" --pack-destination="$PACKS"
  done
)

npm pkg set "dependencies.drupal-canvas=file:$PACKS/drupal-canvas-0.6.0.tgz"
npm pkg set "devDependencies.@drupal-canvas/cli=file:$PACKS/drupal-canvas-cli-0.25.1.tgz"
npm pkg set "devDependencies.@drupal-canvas/workbench=file:$PACKS/drupal-canvas-workbench-0.12.0.tgz"
npm pkg set 'overrides.drupal-canvas=$drupal-canvas' 'overrides.react=$react' 'overrides.react-dom=$react-dom'
npm install
npm ls drupal-canvas react react-dom @drupal-canvas/cli @drupal-canvas/workbench
```

Keep temporary manifests, locks and tarballs out of commits. Stop on build,
install or dependency errors; do not force installation.
