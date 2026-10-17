# SensWear presentations

One static site for SensWear talks and workshops. Each presentation lives in its own folder with an `index.html` entry point and its assets.

| Presentation | Folder | Intended public URL |
| --- | --- | --- |
| Wearables in sync | `NO1/` | https://presentations.sens-wear.com/NO1/ |
| From raw signals to wearable AI | `WS1/` | https://presentations.sens-wear.com/WS1/ |

The root `index.html` is the presentation directory. The decks bundle Reveal.js, fonts, and images, so publishing needs no dependency installation or build step. Keep the bundled third-party license files with their assets.

## Publish with GitHub Pages

1. Push these files to the `main` branch of [Sens-Wear/presentations](https://github.com/Sens-Wear/presentations), with `index.html`, `.nojekyll`, and `CNAME` at the repository root.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**, choose **main** and **/ (root)**, then save.
4. Set **Custom domain** to `presentations.sens-wear.com`. The root `CNAME` file must contain only that hostname.
5. Configure the DNS record below, allow GitHub's DNS check and certificate provisioning to complete, then enable **Enforce HTTPS** when available.

The `.nojekyll` file tells GitHub Pages to serve the files as a static site. No Actions workflow is required. These instructions describe the deployment configuration; the presence of these files does not confirm that deployment or DNS has been configured.

## Cloudflare DNS

In the Cloudflare zone for `sens-wear.com`, create or update this record:

| Type | Name | Target | Proxy status |
| --- | --- | --- | --- |
| CNAME | `presentations` | `sens-wear.github.io` | **DNS only** (gray cloud) |

Use the hostname as the target, without a protocol, path, or `/presentations` suffix. Resolve any conflicting records for the same subdomain. GitHub's custom-domain setting associates this hostname with this repository; DNS points to the account's GitHub Pages host.

After setup, check the root URL and both presentation URLs above. Links use a trailing slash so each deck's relative assets resolve inside its own folder.

## Preview locally

From the repository root, run:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

On Windows, `py -m http.server 8000 --bind 127.0.0.1` is an alternative if the Python launcher is installed.

Open http://127.0.0.1:8000/ and test both presentations. Stop the server with **Ctrl+C**. This server is for local preview only; GitHub Pages serves the published site.

## Update a presentation

Edit the files in its existing folder, keep relative asset paths intact, and preview locally. Then review and publish the changes:

```sh
git status
git diff
git add NO1 WS1 index.html README.md
git commit -m "Update SensWear presentations"
git push origin main
```

Stage only the files you intend to publish. Once Pages is configured, pushes to `main` trigger a new deployment. Check the repository's Pages deployment status before sharing updated links.

## Add another presentation

1. Create a clearly named folder such as `WS2/` at the repository root.
2. Put the new deck's `index.html`, scripts, styles, assets, and licenses inside that folder. Use relative paths such as `assets/photo.jpg` rather than `/assets/photo.jpg`.
3. Add a card linking to `./WS2/` in the root `index.html` and add its URL to this README.
4. Preview the new folder locally, then commit and push it along with the updated directory.

Its URL will be `https://presentations.sens-wear.com/WS2/`. Folder and file names are case-sensitive on the published site; keep the spelling and capitalization consistent.

GitHub Pages serves public static files. Published HTML includes embedded speaker notes, and downloadable source files are readable by visitors. Keep private recordings, credentials, and personal machine paths out of the repository.

Official setup reference: [GitHub Pages custom subdomains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain).
