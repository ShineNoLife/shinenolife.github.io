# Ha Xuan Thien Personal Website

Static GitHub Pages site for my research profile, CV download, publications, blogs, and gallery.

The structure borrows the useful parts of mature Jekyll sites without requiring a build step:
each public tab keeps its editable content beside the page, shared UI lives in includes,
and common rendering logic lives in `assets/scripts/site/`.

## Directory Structure

```text
.
├── .github/workflows/
│   └── pages.yml             # GitHub Pages deployment with analytics injection
├── includes/layout/          # Shared HTML fragments
│   ├── footer.html
│   └── nav.html
├── assets/
│   ├── styles/main.css
│   └── scripts/site/         # Browser-native modules
│       ├── analytics.js
│       ├── app.js
│       ├── background.js
│       ├── content.js
│       ├── includes.js
│       ├── interactions.js
│       ├── renderers.js
│       └── utils.js
├── analytics/
│   └── config.js             # Optional Google Analytics 4 settings
├── home/
│   ├── index.html            # Research profile tab, served at /home/
│   ├── content.js            # Profile, research cards, publications
│   ├── files/
│   │   └── CV.pdf
│   └── images/
│       └── profile.jpg
├── blogs/
│   ├── index.html            # Blog index, served at /blogs/
│   ├── content.js            # Blog listing metadata
│   └── competitive-programming-journey/
│       ├── index.html        # Blog article, served at /blogs/competitive-programming-journey/
│       └── images/           # Images used only by this article
├── gallery/
│   ├── index.html            # Gallery tab, served at /gallery/
│   ├── content.js            # Gallery-only images and tags
│   └── images/
│       └── mttn_2024.jpg
├── scripts/
│   └── local_server.py       # Local server and route checks
├── .gitignore
└── index.html                # Required static-host entrypoint, redirects / to /home/
```

## Editing Content

- Update `home/content.js` for name, intro, social links, and publication metadata.
- Replace `home/files/CV.pdf` when you want to update the downloadable CV.
- Update `blogs/content.js` for the blog listing.
- Edit each blog article in its own folder, for example `blogs/competitive-programming-journey/index.html`.
- Update `gallery/content.js` for gallery-only images. Each gallery item can include `tags`,
  and the gallery page will build filter buttons from those tags.

Blog-post images live beside that blog post. Gallery images live under `gallery/images/`.
Keep those folders separate so the blog and gallery tabs stay independent.

Page routes are folder-backed. To add a new public page, create a folder with an `index.html`
inside it, then link to the folder path, for example `/new-page/`. To add a new blog article,
create `blogs/my-post/index.html`, put article images in `blogs/my-post/images/`, and add the
listing metadata in `blogs/content.js`.

Example gallery item:

```js
{
  title: "MTTN 2024",
  src: "/gallery/images/mttn_2024.jpg",
  width: 1620,
  height: 1080,
  caption: "A gallery-only snapshot from MTTN 2024.",
  tags: ["events", "academic", "archive"]
}
```

## Image Delivery

Keep one original image beside the content that uses it. The site relies on native browser image
features instead of generated variants or an external image pipeline:

```html
<img
  src="/path/to/photo.jpg"
  alt="..."
  width="1600"
  height="1000"
  loading="lazy"
  decoding="async"
>
```

For JavaScript-rendered images, add `src`, `width`, and `height` in the content file; the shared
renderer adds `loading` and `decoding` automatically. Use `loading="eager"` and
`fetchpriority="high"` only for above-the-fold images such as the profile portrait or article cover.

Because GitHub Pages is static hosting, native browser loading does not shrink the original file.
Before committing a very large photo, export a reasonably sized original, usually around 1600-2400px
wide for web display.

## Analytics

The site can report visitor statistics to Google Analytics 4 while still being hosted on GitHub
Pages. The shared `assets/scripts/site/app.js` module loads `analytics.js` on every page, and
`analytics.js` injects Google's `gtag.js` script only when analytics is enabled. The committed
`analytics/config.js` file stays disabled by default; the deployment workflow writes the live
analytics config into the GitHub Pages artifact.

To enable it:

1. In Google Analytics, create a GA4 property and add a Web data stream for:

```text
https://shinenolife.github.io
```

2. Copy the Measurement ID from that web stream. It should look like:

```text
G-XXXXXXXXXX
```

3. Add it as a GitHub repository secret:

```text
GA4_MEASUREMENT_ID
```

4. In GitHub, set Pages to deploy from GitHub Actions:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

The workflow in `.github/workflows/pages.yml` copies the static site into `_site`, injects the
GA4 Measurement ID from the repository secret, and deploys the artifact to GitHub Pages.

When you move to a custom domain later, add the domain to `productionHosts` and create or update
the matching GA4 web stream. Keep `trackLocalhost` as `false` unless you intentionally want local
preview visits in the dashboard.

## Local Preview

Use the local helper script. It starts a no-cache static server and checks that the main routes,
assets, CV, includes, folder-backed page structure, and blog/gallery image separation are valid.

```bash
python3 scripts/local_server.py
```

Then open the URL printed by the script, usually:

```text
http://127.0.0.1:8001/home/
```

To test an already-running server:

```bash
python3 scripts/local_server.py --test-only --port 8001
```
