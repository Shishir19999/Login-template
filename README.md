# Login Templates

Two login page designs with a complete demo authentication flow, published as a static site.

**Live demo:** https://shishir19999.github.io/Login-template/

| Page | Path |
| --- | --- |
| Gallery (start here) | `index.html` |
| Simple login - centred glass card | `login/login.html` |
| Login with navigation - nav bar, floating labels, features section | `border login/login.html` |

## Features

- Sign in, register, forgot password and a signed-in state in both designs (one shared script, `assets/js/auth-ui.js`)
- Register form with a live password strength meter (`role="progressbar"`) and confirm-password check
- Show / hide password toggle, remember me (remembers the e-mail address), sign out
- Inline validation with messages next to each field, success and error toasts
- Social login buttons (Google, GitHub, Facebook) are visual only and show a notice
- Short lock-out after 5 failed sign-in attempts
- Light and dark theme: follows the system setting and remembers your choice
- Parallax: layered background, floating lights and scroll-reveal cards. Uses only `transform` and `opacity`
  (IntersectionObserver + requestAnimationFrame), is fully disabled for `prefers-reduced-motion`, and the
  scroll / pointer parallax is off on small screens, data-saver and low-power devices. Form fields never move.
- Accessible: skip link, real labels, visible focus rings, ARIA live regions, keyboard friendly
- Responsive from 320px, favicon, titles, meta and Open Graph tags, `404.html`
- Background images are served as AVIF / WebP with JPEG fallbacks through `<picture>`

## Demo logins

| E-mail | Password |
| --- | --- |
| `demo@example.com` | `Demo@1234` |

You can also register a new account. Accounts are stored in this browser only (`localStorage`) and passwords are
kept as SHA-256 hashes (WebCrypto). The seeded demo user exists only as a hash in the source. This is a front-end
demo, not real security.

## How to run

Open `index.html` in a browser, or serve the folder with any static server:

```
npx serve .
python -m http.server 8080
```

All links and assets are relative, so the site also works from a sub-path such as `/Login-template/`.
No CDN or network access is needed.

## Publish on GitHub Pages

Settings -> Pages -> deploy from the `main` branch, root folder. `404.html` uses the `/Login-template/` base path;
update it if the repository is renamed.

## Structure

```
index.html            gallery
404.html
assets/               base.css, auth.css, gallery.css, ui.js, parallax.js, auth-ui.js, images
login/                simple design (login.html, style.css, background images)
border login/         navigation design (login.html, style.css, background images)
```

`login/back.jpg` is actually an AVIF file saved with a .jpg name; it is kept as is and the pages use the
`back-900.*` copies instead.
