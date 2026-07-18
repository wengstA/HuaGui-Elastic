# Codex Project Context

This workspace continues a mobile ChatGPT thread about a Huagui Elastic B2B product-page demo.

## User Workflow

- The user usually works in Chinese and wants direct implementation, not only suggestions.
- When the user provides screenshots or prior GPT output, extract the practical requirements and continue from the existing files.
- Prefer a locally openable demo and give the exact file path or local URL after changes.
- Verify visual changes when working on product pages, especially image orientation and page layout.

## Deployment Source of Truth and Required Evaluation

- `huagui_product_page_preview/index.html` is a design-only preview. It is **not** the page served by the Vercel deployment, so changes there alone must never be treated as a production-site update.
- The deployed site is `huagui_company_site/`: `vercel.json` rewrites the root and HTML routes to that directory. Make product changes there when the user expects the online site to change.
- Published product content is loaded through `/api/products`. Its local fallback is `huagui_company_site/data/products.json`; if Vercel Blob is configured, the Blob document (`cms/products.json`) takes precedence. A code deployment does not overwrite existing Blob CMS data.
- For any product-page or tag change intended for the live site, update and evaluate all applicable production surfaces: the product data, product-detail rendering, product-list filters, tag-label mappings, and the admin editor's available tags.
- Before handoff, verify the formal product URL (for example, `huagui_company_site/product-detail.html?slug=printed-waistbands`) and the product-list filtering behavior. State separately whether the change still needs a code deployment and, when Blob CMS is enabled, an admin save/publish or Blob-data update.

## Current Product Page Requirements

- Brand/product context: Huagui Elastic, product page for `Printed Waistbands` under men's underwear elastics.
- Keep a clean B2B website style with an orange accent, product imagery, specifications, customization options, and quote CTAs.
- Header branding should use `assets/huagui-logo.png` plus the text `HUAGUI ELASTIC` in the logo wine red `#880830`.
- Top navigation order should stay: `HOME`, `PRODUCTS`, `CUSTOM SOLUTIONS`, `FACTORY`, `EXHIBITIONS`, `ABOUT US`, `CONTACT`.
- Product catalog structure should avoid deep subdirectories. Keep only broad main categories:
  - `Men's Underwear Elastics`
  - `Women's Underwear Elastics`
  - `Bra & Lingerie Elastics`
  - `Activewear Elastics`
- Former subcategories should become filter tags on product/category pages, such as `Jacquard`, `Printed`, `Plain`, `Fold Over`, `Picot`, `Silicone Grip`, and `Bra Strap`.
- Breadcrumbs should stop at the main category. Product types like `Printed Waistbands` should appear as page titles and filter tags, not as nested catalog directories.
- The `Product Display` section has four images:
  - 1: `front-back.jpeg`
  - 2: `front.jpeg`
  - 3: `back.jpeg`
  - 4: `application.jpeg`
- Images 1, 2, and 3 should be displayed rotated 90 degrees counterclockwise from the original vertical shots. Image 4 should remain as-is.
- Do not include the old disclaimer text like `All photos are real products...`.

## Current Files

- Design-preview entry point: `huagui_product_page_preview/index.html`
- Design-preview images: `huagui_product_page_preview/assets/`
- Deployed site source: `huagui_company_site/`
- Local product-data fallback: `huagui_company_site/data/products.json`
