# Creator Studio / Epic formats

Open `/studio/index.html`. The portfolio navigation and hero link to this page.

## Available now

The browser-only editor prepares landscape artwork and composite files (1920×1080), portrait artwork and composite files (1440×1920), and a transparent PNG logo (1440×608). It supports independent framing, uploaded transparent logos, a free typographic logo, downloadable project JSON, individual images, a ZIP package and a commission brief. Projects can move between this portfolio and Thumbnail Insights.

Files remain in browser memory until explicitly downloaded. No images are uploaded and there are no API charges for this editor. The full package requires confirmation of text-free artwork and review of the portrait crop. Resizing does not remove text or reconstruct a scene. Always review assets before submitting to Epic.

## Shared source

`public/tools/epic-studio/{core.mjs,studio.mjs,studio.css}` is the portable Studio Core 1.0.0 snapshot also used by Thumbnail Insights. The component uses Shadow DOM to avoid collisions with portfolio styles. This host uses English, an orange theme, and `mode="public"`.

Keep these three files and the project version synchronized when updating both repositories; there is no live third-party dependency or automatic cross-repository deployment. Future incompatible project changes must increment the project version and provide migration.

## Paid generation boundary

AI buttons are descriptive placeholders that explain prepaid checkout is not connected. Public mode never calls `/api/adapt`. No API key, AI proxy, payment integration, style-training pipeline or generated-concept service has been added to the portfolio. Do not change the host to owner mode or expose the private studio endpoint as a shortcut.

Before enabling paid generation here, add server authentication, prepaid orders, atomic credit reservation, verified payment webhooks, job ownership, duplicate protection and an operation budget. Public AI needs its own authenticated paid backend; the private Thumbnail Insights session is not shared with this site.

## Validation

- `node --check public/tools/epic-studio/studio.mjs`
- `node --test tests/creator-studio.test.mjs`
- Shared editor browser QA: landscape/portrait proportions and export workflow; main app tests also cover private generation limits, duplicate requests and storage ownership using simulated provider responses.
- Desktop and 390px mobile views were inspected. The browser produced the ZIP download link but the cloud browser did not return a downloaded file; full download validation remains pending.
- No real paid generation request was made during this change.

The existing Express server serves these static files without additional dependencies. Review this change through the Vercel preview associated with the draft PR before merging into `main`.
