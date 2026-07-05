# Huagui Product Page Preview

This project was imported from a WeChat File Transfer Assistant record of a previous mobile ChatGPT workflow.

Open the local demo:

```text
huagui_product_page_preview/index.html
```

Imported context:

- The page is a Huagui Elastic product detail demo for `Printed Waistbands`.
- The header uses the imported Huagui logo and `HUAGUI ELASTIC` text in the logo wine red.
- The catalog now uses broad main categories plus filter tags instead of nested subdirectories.
- The product display images 1, 2, and 3 have been rotated 90 degrees counterclockwise in this workspace copy.
- The fourth application image remains unchanged.
- The old `All photos are real products...` disclaimer text is not present.

## Lightweight Product Admin

The site now includes a simple product-management page:

```text
/admin
```

Admin workflow:

- Sign in with the configured admin password.
- Create or edit a product as a draft.
- Use `Publish` to make the product visible on the public catalog.
- Use `Unpublish` to move a published product back to draft.
- Use `Delete` to remove a product record.

Images uploaded in the admin page are resized and converted to WebP in the browser before upload. In production, images are stored in Vercel Blob. Product data is stored as:
The gallery `Rotate 90°` action also reprocesses the image into a new WebP file, so the public catalog and product detail page use the same rotated image.

```text
cms/products.json
```

For local development without a Blob token, the admin falls back to:

```text
huagui_company_site/data/products.json
huagui_company_site/uploads/
```

Run locally with Vercel Functions:

```bash
ADMIN_PASSWORD=admin ADMIN_SESSION_SECRET=local-test-secret npx --yes vercel dev --listen 3000
```

Then open:

```text
http://127.0.0.1:3000/admin
```

Required Vercel environment variables:

```text
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Optional:

```text
ADMIN_SESSION_MAX_AGE_SECONDS
BLOB_STORE_ID
BLOB_READ_WRITE_TOKEN
CMS_PRODUCTS_BLOB_PATH
```

For Vercel Blob, the preferred production setup is a project-connected Blob store using OIDC, which injects `BLOB_STORE_ID`. A legacy `BLOB_READ_WRITE_TOKEN` also works if it is present.

The admin login uses an HttpOnly session cookie. By default, a successful login stays active for 12 hours, so refreshing `/admin` can open the workspace without asking for the password again. Use `Logout` to clear it immediately.
