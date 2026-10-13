# Pathfinder Console

Management console of [Pathfinder](https://github.com/beiroun/pathfinder) by
[84softworks](https://84softworks.com): the QR codes, their four platform
targets, the rendered image and the per-platform scan statistics. A single-page
application served by nginx, talking to
[`pathfinder-server`](https://github.com/beiroun/pathfinder-server) over `/api`.

---

## Screens

| Screen | What it does |
|---|---|
| Login | sign-in with a login from the server's environment (`PF_ADMIN_USERS` / `PF_VIEWER_USERS`) |
| Dashboard | every code with its public link (click to copy), total scans; search by name or slug; create / edit / delete for administrators, read-only for viewers |
| Code form | name, optional slug (generated when blank, immutable afterwards), the four targets in resolution order iOS → Huawei → Android → Desktop; the desktop link is the fallback and is required |
| Code details | the rendered QR (click to copy the PNG), PNG / SVG download, the public link, scan statistics per platform, all targets, dates |

Roles come from the token: `ADMIN` edits, `VIEWER` reads. Both land on the same
dashboard; write actions are hidden for viewers and refused by the server.

The interface is Russian.

## Stack

| | |
|---|---|
| Language | TypeScript 7, strict |
| UI | React 19.3, plain CSS with design tokens (`src/styles`) |
| API | axios with a bearer interceptor: refresh-and-retry on 401 / 403, one queued refresh for parallel requests |
| Routing | React Router 8.4 (`createBrowserRouter`) |
| Build | Vite 8.3, Node 24 LTS |
| Image | multi-stage Node → nginx 1.30 on `127.0.0.1:8081`: static files plus `location /api` proxied to the server on `127.0.0.1:8080`; published as `ghcr.io/beiroun/pathfinder-console:<version>` on a tagged release |

Conventions: functional components and hooks, the API in `api/`, pages under
`pages/`, no secrets or tokens in logs, comments in English.

## Structure (`src/`)

```
api/          axiosInstance (bearer, refresh queue), api (every call of the server)
context/      AuthContext (session from the token cookies), FeedbackContext (toasts + confirm dialog)
components/   QrFormModal, QrDetailModal, CopyableLink, ConfirmDialog, AlertToaster, AppFooter, icons
pages/        Auth, Dashboard
routes/       createBrowserRouter, created once outside the React tree
styles/       fonts, tokens, base, typography, buttons, forms, cards, feedback, user-card, auth, qr, footer
types/        the API contract of the server
utils/        format helpers, clipboard, blob download, API error text
```

The server envelope `{data, message, error}` is unwrapped in `api.ts`; a
failure's `error.localizedMessage` is what the operator sees in a toast.

## Public assets

- **Icons** - one set for every device: BMP `favicon.ico` (16/32/48), PNG
  16/32/96 (round: dark disc, cyan ring, the QR mark, transparent corners),
  `apple-touch-icon.png` 180 and maskable 192/512 (opaque squares),
  `site.webmanifest`, `og-image.png` 1200×630 for link previews. Generated from
  the geometry of `public/logo.svg` by `make_icons.py` (kept outside this
  repository); bump `?v=` in `index.html` when the art changes.
- **Fonts** - Inter is self-hosted (`public/fonts`, Latin and Cyrillic subsets
  of the variable font): no CDN request, no flash of a system font.
- **Metadata** - `index.html` carries the description, canonical, Open Graph,
  Twitter card and JSON-LD (WebSite + Organization), and keeps
  `noindex, nofollow`: a management console is not a search result. The
  absolute addresses in the canonical and Open Graph tags name the console's
  host - change them together when it lives on another name.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173, /api proxied to http://127.0.0.1:8080
```

A `pathfinder-server` has to run on `127.0.0.1:8080` (`docker compose up --build`
in the server repository starts one with its own PostgreSQL; the logins are the
pairs in its `.env`). `PATHFINDER_DEV_API=http://host:port npm run dev` proxies
to another server.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with the `/api` proxy |
| `npm run build` | `tsc --noEmit` then `vite build` → `dist/` (what the image serves) |
| `npm run typecheck` | type check only |
| `npm run format` | Prettier over `src/` and `index.html` |

## Run

Deployed as an image from the umbrella repository's `docker-compose.yml` on the
same host as the server. nginx listens on `127.0.0.1:8081` behind the
deployment's edge proxy, which owns the public name and the certificate;
`nginx/default.conf` serves the SPA (`try_files … /index.html`), caches hashed
assets for a year and proxies `/api/` to `127.0.0.1:8080` unchanged.

Because the SPA and the API answer on the same name, the browser makes
same-origin calls and no CORS is involved. A console served from a different
name than its API is the exception: build the image with
`--build-arg API_BASE_URL=https://pathfinder.<domain>/api/v1` and allow that
origin on the server (`PF_CORS_ORIGINS`). The value is compiled into the
bundle, so it is a build argument, not a runtime variable.

Image: `docker build -t pathfinder-console:dev .` — `node:24-trixie-slim`
builds, `nginx:1.30-trixie` serves; the build arg `APP_VERSION` (the git tag in
CI) is shown in the footer as the console version next to the server's.

## License

**Business Source License 1.1** — see [`LICENSE`](LICENSE). Non-production use
is free; production use beyond the Additional Use Grant requires a commercial
license from the Licensor. Third-party components keep their own licenses
(`NOTICE` in the umbrella repository). Font: Inter (SIL Open Font License 1.1).
