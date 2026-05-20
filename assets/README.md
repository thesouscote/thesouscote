# Assets

- `logo/` — place ici ton logo (formats recommandés : `logo.svg`, `logo.png`)
- `icon/` — place ici le favicon (formats : `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` 180x180)

## Utilisation

Une fois tes fichiers déposés, dans `index.html` :

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="assets/icon/favicon.svg" />
<link rel="apple-touch-icon" href="assets/icon/apple-touch-icon.png" />

<!-- Logo dans la nav -->
<a href="#home" class="brand">
  <img src="assets/logo/logo.svg" alt="thesouscote" />
</a>
```
