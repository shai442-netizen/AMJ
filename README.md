# domb-site

A static website draft for AMJ Blinds, served at amjblinds.com (domb.ca forwards here).

## Files

- `index.html` - main landing page
- `styles.css` - styling
- `script.js` - WhatsApp quote form behavior

## Preview locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

- <http://localhost:8080>

## Notes

- The current draft uses public image URLs from the existing AMJ-Blinds site and Elite Window Fashions for mockup purposes.
- Before publishing, confirm you have the right to use every image, or replace them with your own photos/licensed assets.
- The form currently opens WhatsApp with a pre-filled quote request to `604-721-4719`.
- Best next upgrade: connect a real form backend, add real installation photos, and add real testimonials/reviews.

## Domain setup

- `CNAME` is set to `amjblinds.com` — GitHub Pages serves this site directly at that domain.
- `domb.ca` should be configured at the registrar as a forwarding domain to `https://amjblinds.com` (not the other way around).
- Repo Settings → Pages custom domain must also say `amjblinds.com` for this to take effect.
