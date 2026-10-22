# Pathfinder Console – «Pathfinder QR»

Management console of [Pathfinder](https://github.com/beiroun/pathfinder) by
[84softworks](https://84softworks.com): the QR codes, their four platform
targets, the rendered image and the per-platform scan statistics. In the
interface the product is called **Pathfinder QR**. A single-page application
served by nginx, talking to
[`pathfinder-server`](https://github.com/beiroun/pathfinder-server) over `/api`.

---

## Screens

| Screen | Address | What it does |
|---|---|---|
| Login | `/auth` | sign-in with a login from the server's environment (`PF_ADMIN_USERS` / `PF_VIEWER_USERS`) |
| QR codes | `/qr` | every code at once: smart search by name, slug and any link (an exact slug first), sort by any column heading (descending → ascending → default), pages of 25 / 50 / 100 / 200; the search, the sort and the page live in the URL, so a link, F5 and Back keep the selection. A row opens the code's card; «Новый QR-код» for administrators |
| Card | `/qr/<slug>` | the rendered QR (click copies the PNG), scans per platform with the share of all, the public link and the four targets. «Действия»: download PNG / SVG and copy the image for every role; edit and delete (with a confirmation) for administrators |
| Form | `/create-qr`, `/qr/<slug>/edit` | name, slug (create only: `A–Z a–z 0–9 - _`, 3–64, generated when blank, immutable afterwards), the four targets in resolution order iOS → Huawei → Android → Desktop; only `http(s)` links; the desktop link is the fallback and is required. Saving opens the card |
| Errors | any other address | 404 inside the shell; a viewer on a form page reads «Недостаточно прав» on the same address |

Roles come from the token: `ADMIN` (badge ADM) edits, `VIEWER` (badge RD)
reads; the elements of an action a role may not take are not rendered, and the
server refuses it anyway. Timestamps are the server's wall time
(`LocalDateTime` in its `PF_TZ`), shown as they are.

The interface is Russian, light and dark (follows the system until the
operator picks one in the top bar).

## Stack

| | |
|---|---|
| Language | TypeScript 7, strict |
| UI | React 19.3, Mantine 9.7 (theme in `src/theme`), Tabler icons, self-hosted Inter |
| API | axios with a bearer interceptor: refresh-and-retry on 401 / 403, one queued refresh for parallel requests; a small `useApiQuery` hook keeps the old data on screen while a request reloads it |
| Routing | React Router 8.4 (`createBrowserRouter`) |
| Build | Vite 8.3, Node 24 LTS |
| Image | multi-stage Node → nginx 1.30 on `127.0.0.1:8081`: static files plus `location /api` proxied to the server on `127.0.0.1:8080`; published as `ghcr.io/beiroun/pathfinder-console:<version>` on a tagged release |

Conventions: functional components and hooks, the API in `api/`, pages under
`pages/`, no secrets or tokens in logs, comments in English.

## Structure (`src/`)

```
api/          axiosInstance (bearer, refresh queue), api (every call of the server), useApiQuery, queries
context/      AuthContext (session from the token cookies)
theme/        themeMantine (palettes of both schemes, component defaults), tokens, fonts, shell, motion
components/   Layout (top bar + side column), Header, NavigationMenu, ShellFooter (versions), AuthForm,
              PathfinderMark, ThemeModeSwitcher, UserInfo, RouteGuards
ui/           the frame: list/ (filters bar, smart search, pagination, list table), table/ (column widths and
              hiding by priority), motion/, ErrorPage, EntityCardHeader, EntityActionsMenu, ConfirmActionModal,
              PageSection, MetricTile, CopyableId, RoleBadge
hooks/        useUrlFilters (state in the URL), useClientList (search / sort / pages in memory), useDocumentTitle, …
pages/        Auth, QrCodesList, QrCodeCard, QrCodeForm, NotFound, Forbidden
routes/       paths, createBrowserRouter (created once outside the React tree)
types/        the API contract of the server
utils/        smart search, time, role badges, notifications, blob download, API error text
```

The server envelope `{data, message, error}` is unwrapped in `api.ts`; a
failure's `error.localizedMessage` is what the operator sees («Не выполнено»
notification, or the error over the list with «Повторить»).

## Public assets

- **Icons** - one set for every device: BMP `favicon.ico` (16/32/48), PNG
  16/32/96 (round: dark disc, cyan ring, the QR mark, transparent corners),
  `apple-touch-icon.png` 180 and maskable 192/512 (opaque squares),
  `site.webmanifest`, `og-image.png` 1200×630 for link previews. Generated from
  the geometry of `public/logo.svg` by `make_icons.py` (kept outside this
  repository); bump `?v=` in `index.html` when the art changes. The same mark
  is drawn in the interface by `PathfinderMark` (alone in white on the top bar,
  on its dark tile on the login card).
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
