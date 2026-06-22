# Halo — Google Play store files

Assets and copy for publishing the local-only Halo app (`mobile_no_backend`)
to Google Play.

## Files here

| File | What it's for | Play requirement |
|------|---------------|------------------|
| `icon-512.png` | High-res app icon | 512×512 PNG, 32-bit |
| `feature-graphic-1024x500.png` | Feature graphic (banner) | 1024×500 PNG/JPG |
| `short-description.txt` | Short description (70 chars) | max 80 chars |
| `full-description.txt` | Full description | max 4000 chars |
| `privacy-policy.md` | Privacy policy text to host | URL required in listing |

## Still needed (you provide)

- **Screenshots:** at least 2 phone screenshots (Play accepts 16:9 / 9:16,
  min 320px side). Capture from a real device or emulator:
  - Run the app, open each screen (Home, Statistics), take a screenshot.
  - Or in an Android emulator use the camera button in the toolbar.
- **Privacy policy URL:** host `privacy-policy.md` somewhere public and paste
  the link in the listing. Easiest: GitHub Pages, or a Gist rendered page.

## Publishing checklist (Play Console)

1. Pay $25, create developer account, pass identity verification.
2. Build the release bundle:
   `cd mobile_no_backend && npx eas-cli build -p android --profile production` (produces an `.aab`).
3. Create app in Play Console (name: **Halo**, free).
4. Store listing: paste short + full description, upload `icon-512.png`,
   `feature-graphic-1024x500.png`, and screenshots.
5. Data safety: **No data collected / No data shared** (everything is local).
6. Add the privacy policy URL.
7. Content rating questionnaire, target audience, ads = none,
   app access = all functionality available without restrictions.
8. Upload the `.aab` to Internal testing → test → promote to Production.
9. Note: new personal developer accounts may need a closed test
   (~12 testers, 14 days) before Production is unlocked — check Play Console.

## Notes

- Brand colors: ink `#4a3f72`, accent `#9a8ad8`, ring gradient
  `#e7c6ff → #bbd0ff`, background `#f4f0fb`.
- The app collects no data and requires no account, which keeps the Data
  Safety form and review simple.
