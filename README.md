# One Reach — corporate multi-service website

## Features
- Public website; visitors do not need to register or log in.
- Ten services shown in a consistent, responsive corporate card layout.
- Clicking a service opens WhatsApp with a prefilled enquiry mentioning the service and configured text.
- Admin dashboard to edit service names/descriptions, upload a service image, edit each WhatsApp enquiry message, and edit About Us content/photo.
- No WhatsApp Business API required; uses the official click-to-chat URL (`wa.me`).

## Deploy on Render
1. Upload the complete project folder to a GitHub repository (keep the folder structure).
2. In Render, create a **Web Service** from that repository. Runtime: Node.
3. Build command: `npm install`; Start command: `npm start`.
4. Add environment variables:
   - `ADMIN_PASSWORD` = a strong, unique password
   - `WHATSAPP_NUMBER` = WhatsApp number with country code, digits only. Default is `919160086793`.
   - `DATA_DIR` = `/var/data` if a persistent disk is attached.
5. Attach a persistent disk mounted at `/var/data` (recommended/required for uploaded photos and edits to survive redeploys/restarts on Render). The included `render.yaml` describes a Starter web service and 1 GB disk; choose a plan that supports disks.
6. Deploy and visit `/admin` to sign in. Public website is at `/`.

## Admin login
Set `ADMIN_PASSWORD` in Render Environment. Do not put your password in source code. If it is not set, the admin login is disabled for safety.

## Important WhatsApp behaviour
This website does not send messages in the background and does not use a WhatsApp API. Clicking a service opens WhatsApp with a prefilled message; the visitor must press **Send** in WhatsApp. The WhatsApp account configured in `WHATSAPP_NUMBER` receives the enquiry after the visitor sends it.

## Initial content
All ten service cards are preloaded. Replace the About Us placeholder with the owner's photo from `/admin` before promoting the site. Check all service descriptions, legal/commercial permissions, and WhatsApp message text before running ads.

## Local preview on Windows
Do not double-click `public/index.html` or `public/admin.html` directly. Their API requests require the Node.js server. Install Node.js LTS, then run `run-local.bat` from the project folder. Keep its terminal window open and browse to `http://localhost:3000`. For admin access, set `ADMIN_PASSWORD` in the same terminal before `npm start`, or configure it in your shell environment. For a permanent public site, deploy to Render as described above.

## Mantru daily wishes ticker
The homepage includes an automatic scrolling greeting ticker with India-first and worldwide calendars. It updates from the India (Asia/Kolkata) date without manual daily editing. The included calendar is a starter list of fixed-date observances and generic daily wishes; movable festival dates and additional verified observances should be maintained in the calendar data rather than guessed. Mantru's supplied photo is included at `public/images/mantru.jpg` and is used in About Us and the founder footer.


## Important: flat GitHub upload layout
This package is prepared for repositories where `index.html`, `app.js`, `styles.css`, `admin.html`, `admin.js`, `admin.css`, and `mantru.jpg` are at the repository root. The server serves the homepage from the root and serves `/admin` from root `admin.html`.


## Update v2
The homepage now prioritizes the 10-service photo grid directly below the greeting ticker instead of a large hero image. Founder photo uses top-aligned contain sizing to avoid cropping the head. Pre-cast wall enquiries explicitly target empty plots and farming land, with updated enquiry text and relevant exterior/land imagery. The plot buying/selling card uses a land image.
