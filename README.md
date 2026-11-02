# Call Bluff! public privacy and support site

This is a self-contained, buildless bilingual site for the App Store privacy and support URLs. It uses plain HTML, CSS, and JavaScript; it makes no network requests, loads no third-party assets, sets no analytics cookies, and works from a GitHub Pages project path.

## Required configuration

Before publishing, edit the single `supportEmail` value in `site-config.js`. That value supplies every displayed address and `mailto:` link on all pages. No other file needs an email replacement.

Run the release check after setting the real public support address:

```sh
node tools/validate.mjs --release
```

Development validation allows the clearly marked example address:

```sh
node tools/validate.mjs
```

## Pages

- `index.html` — bilingual entry page.
- `privacy.html` — complete English/Hebrew privacy policy.
- `support.html` — requirements, troubleshooting, FAQ, and contact.
- `site-config.js` — the only owner-specific configuration point.
- `assets/` — local presentation and language behavior; no external dependencies.

The language switch stores only the visitor's language preference in browser-local storage. A `?lang=en` or `?lang=he` query can select a language directly. Content remains readable in English when JavaScript is unavailable.

## GitHub Pages deployment

For the simplest deployment, use this folder as the root of a small public repository:

1. Set the real support email and run the release validator.
2. Copy the contents of `public-site/` to the repository root.
3. In the repository's Pages settings, deploy from the `main` branch and `/ (root)`.
4. Wait for the HTTPS Pages URL, then open all three pages in English and Hebrew on a narrow and wide viewport.

No build step or Jekyll theme is required; `.nojekyll` is included. If the site remains inside a larger repository, use a Pages workflow that uploads `AppStore/public-site` as the static artifact instead.

## App Store Connect URLs

After deployment, use:

- Privacy Policy URL: `https://<pages-host>/<path>/privacy.html`
- Support URL: `https://<pages-host>/<path>/support.html`

The pages automatically choose Hebrew for a Hebrew browser. Add `?lang=en` or `?lang=he` only when a fixed-language URL is useful.

## Release accuracy checklist

The current text distinguishes the live version 1.0 (no ads) from version 1.1 and later, which use Google AdMob while keeping gameplay offline-first. It documents the SDK data and tracking declaration, the lack of a developer account or developer analytics, and the lack of cloud save or in-app purchase. Keep the policy, support answers, App Store privacy answers, and shipped binary aligned. Re-run the validator after every edit.

Do not publish until the product owner has approved the public support address and confirmed that the shipped binary matches these statements.
