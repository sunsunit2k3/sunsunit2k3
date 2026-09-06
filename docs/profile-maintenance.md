# Maintaining this profile

The profile uses English copy, local SVG artwork, and light/dark variants selected with GitHub's `<picture>` support. The banner includes a gently moving route highlight; reduced-motion preferences disable the animation. SVGs have a complete static fallback.

## Automatic updates

`Refresh profile metrics` runs daily around **06:17 Asia/Ho_Chi_Minh** (23:17 UTC), on relevant pushes to `main`, or manually from the repository's **Actions** tab. The first merge to `main` triggers a refresh. GitHub may delay scheduled runs and can disable scheduled workflows in public repositories after 60 days without repository activity.

The workflow uses Node.js 24, built-in APIs, and the repository's automatically supplied `GITHUB_TOKEN`. No personal access token, npm dependencies, or external metrics-image service is needed. The refresh job needs `contents: write` to commit only the three metrics files. Branch rules must permit the bot's normal push; the workflow never force-pushes or bypasses protection. If a push is rejected, inspect the Actions log and use a PR-based update flow if required by your rules.

Pull requests run tests and a live API render into temporary files with read-only permissions; they do not publish metrics. The former snake workflow has been replaced by this workflow; its existing `output` branch is left intact.

## What the numbers mean

- **Public repos:** all public repositories owned by the profile, including forks.
- **Non-fork repos:** public repositories not marked as forks by GitHub.
- **Stars / forks received:** totals on those non-fork repositories.
- **Language mix:** each non-fork repository contributes one count for its primary GitHub language. Repositories with no language are excluded; smaller categories are grouped as Other. These are not proficiency ratings or percentages of code.

`assets/metrics.json` is the public source snapshot and includes its exact UTC timestamp. No private repository details or contribution totals are requested. Initial assets were generated from public repository metadata retrieved during setup. Subsequent runs paginate the public GitHub user-repositories endpoint. API or validation errors fail the job and keep the last successful assets.

## Local commands

From the repository root, with Node.js 24:

```sh
node --test scripts/render-metrics.test.mjs
node scripts/render-metrics.mjs
```

For an offline render from the existing snapshot:

```sh
node scripts/render-metrics.mjs --input assets/metrics.json
```

If the public API rate limit is exhausted, set `GITHUB_TOKEN` in your local environment; never put a token in a committed file. The workflow already supplies its token.

Edit `README.md` to change the introduction, stack, and project links. Edit the two `assets/banner-*.svg` files together to keep both themes consistent. Generated metrics files should be changed through the script.
