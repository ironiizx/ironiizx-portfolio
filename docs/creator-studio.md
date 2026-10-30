# Creator Studio / Epic formats

Open `/studio/index.html`. The portfolio navigation and hero link to this page.

## Studio 11 Layout Generator

Generate pack provides a source/title/logo-choice flow and five coordinated outputs. The private Thumbnail Insights host performs landscape regeneration, portrait recomposition from that regenerated landscape, and logo reconstruction/generation. Uploaded PNG logos skip the third paid call. Original and generated images remain separate until review/apply.

The pipeline stores stage progress in IndexedDB and uses owner-scoped, input-bound request identities plus receipts to recover interrupted work without automatic paid retries. This public host never enters that pipeline or calls the private API: it displays the prepaid-generation boundary and retains the free Manual editor.

Shared portable files now also include `layout.mjs`, `layout.css` and `pack-core.mjs`. Keep all six files synchronized. Core 1.0.0 project JSON remains compatible. The separate latest-pack browser record has its own version.

Validation adds seven pipeline tests (nine portfolio tests total). Browser QA used a clearly marked simulated provider for three-step generation, five previews, review/apply and reload recovery. No real paid image generation was made. Desktop and 390px mobile were checked.

## Studio 10 interface

The workspace now uses a compact source/adaptation panel, a format preview and collapsible controls. Before / after preserves original artwork, Undo image edit restores up to three applied image changes, and the 160px view checks small-size readability. Export review groups the five files and their confirmation steps in one dialog.

The private Thumbnail Insights host also offers AI recomposition for landscape and portrait. Those paid operations remain unavailable in this public host.

## Available now

The browser-only editor prepares landscape artwork and composite files (1920×1080), portrait artwork and composite files (1440×1920), and a transparent PNG logo (1440×608). It supports independent framing, uploaded transparent logos, a free typographic logo, downloadable project JSON, individual images, a ZIP package and a commission brief. Projects can move between this portfolio and Thumbnail Insights.

Files remain in browser memory until explicitly downloaded. No images are uploaded and there are no API charges for this editor. The full package requires confirmation of text-free artwork and review of the portrait crop. Resizing does not remove text or reconstruct a scene. Always review assets before submitting to Epic.

## Shared source

`public/tools/epic-studio/{core.mjs,studio.mjs,studio.css}` is the portable Studio Core 1.0.0 snapshot also used by Thumbnail Insights. The component uses Shadow DOM to avoid collisions with portfolio styles. This host uses English, a black/blue theme with yellow action accents, and `mode="public"`. Studio 10 updates the shared UI while retaining the compatible Core 1.0.0 project format.

Keep these three files and the project version synchronized when updating both repositories; there is no live third-party dependency or automatic cross-repository deployment. Future incompatible project changes must increment the project version and provide migration.

## Paid generation boundary

AI buttons are descriptive placeholders that explain prepaid checkout is not connected. Public mode never calls `/api/adapt`. No API key, AI proxy, payment integration, style-training pipeline or generated-concept service has been added to the portfolio. Do not change the host to owner mode or expose the private studio endpoint as a shortcut.

Before enabling paid generation here, add server authentication, prepaid orders, atomic credit reservation, verified payment webhooks, job ownership, duplicate protection and an operation budget. Public AI needs its own authenticated paid backend; the private Thumbnail Insights session is not shared with this site.

## Validation

- `node --check public/tools/epic-studio/studio.mjs`
- `node --test tests/creator-studio.test.mjs`
- Shared editor browser QA: landscape/portrait proportions and export workflow; main app tests also cover private generation limits, duplicate requests and storage ownership using simulated provider responses.
- Desktop and 390px mobile views were inspected, including before/after, undo, the 160px view and the public prepaid gate. The browser produced the ZIP download link but the cloud browser did not return a downloaded file; full download validation remains pending.
- No real paid generation request was made during this change.

The existing Express server serves these static files without additional dependencies. Review this change through the Vercel preview associated with the draft PR before merging into `main`.


### Studio 12

Shared creator UI updated to the immersive artwork preview, compact title/action dock, settings on demand, progress notifications and stage recovery. New packs preserve landscape pixels outside selected title regions, adapt portrait from the original reference, and compose logo-on/art-only pairs from the same base. New artwork.mjs and cleanup-editor.mjs modules provide bounded mask selection and local patch compositing. Clean-art uploads and uploaded PNG logos skip unnecessary operations. High/Standard quality selection is shown before consent. Old saved packs remain readable.

The public host still does not call private image endpoints: prepaid checkout and its own authenticated generation service remain prerequisites. Its layout simulation repeats the uploaded artwork, without depending on private reference thumbnails. No SETTY attachments or credentials are included. Original portfolio branding is unchanged.


### Studio 13 — Smart portrait

Adds a separate Smart portrait tab: original-specific analysis, visible composition plan, then a portrait generated from the original plus that stored plan. All original text is retained by default, including gameplay counters. Optional title/logo removal retains gameplay labels. Original artwork stays unchanged. The existing Publishing pack and Advanced editor remain available.

The shared modules `portrait-core.mjs`, `portrait.mjs`, `portrait.css` and updated `layout.mjs` are synchronized with Thumbnail Insights. Stage persistence and receipt lookup prevent automatic paid retries. Export is a 1440×1920 JPEG; native provider dimensions are disclosed. A process JSON download includes the plan, image-edit prompt and known costs. The project JSON remains Core 1.0.0; portrait state has a separate IndexedDB record.

This public host stops before either `/api/portrait-plan` or `/api/adapt`. No paid API, authentication, secret or checkout integration is added here. Its own prepaid authenticated backend is still required. Browser QA confirmed zero API calls after clicking Analyze & plan in public mode and no horizontal overflow in a 390px frame. A separate clearly marked owner fixture simulated analysis, generation, export and recovery; no actual provider request was made.

Validation adds four portrait workflow tests. The private host separately tests strict plan validation, source and owner binding, quotas, failures and idempotency. Merge and production Vercel publication remain pending review of draft PR #2.
