# Ha Xuan Thien Personal Website

Static GitHub Pages site for my research profile, CV download, publications, blogs, and gallery.

The structure borrows the useful parts of mature Jekyll sites without requiring a build step:
each public tab keeps its editable content beside the page, shared UI lives in includes,
and common rendering logic lives in `assets/scripts/site/`.

## Directory Structure

```text
.
├── includes/layout/          # Shared HTML fragments
│   ├── footer.html
│   └── nav.html
├── assets/
│   ├── styles/main.css
│   └── scripts/site/         # Browser-native modules
│       ├── app.js
│       ├── background.js
│       ├── content.js
│       ├── includes.js
│       ├── interactions.js
│       ├── renderers.js
│       └── utils.js
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
├── scripts/local_server.py   # Local server and route checks
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
  caption: "A gallery-only snapshot from MTTN 2024.",
  tags: ["events", "academic", "archive"]
}
```

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
