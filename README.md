# Login template

Two glass-style login page templates (HTML + CSS, boxicons via CDN).

- `login/` - simple centred login form with a background image
- `border login/` - same form plus a transparent top navigation bar

Both pages have basic client-side validation (required username, password of at least 6 characters). It is a front-end demo only: nothing is sent or stored.
Layouts adapt to phones/tablets with `@media` rules. Open `login.html` in a browser (boxicons and Google Fonts need internet).

Libraries: boxicons 2.1.4 (latest stable on npm) loaded from unpkg with an SRI hash and `crossorigin`.

Note: `border login/back.jpg` (about 340 KB) and `login/back.jpg` (about 75 KB) are different images.
