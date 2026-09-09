# How to turn the editor on

The panel is at:

https://gweek.netlify.app/admin/

It will only **save** after the site is connected to GitHub. Drag-and-drop alone cannot keep edits.

## One-time setup (computer)

1. Create a free GitHub account if you do not have one.
2. New repository, name `jm-website`. Private is fine.
3. Upload **everything inside** the `jm-website` folder so `index.html` is at the root of the repo. Include the `admin` and `data` folders.
4. Netlify → the **gweek** site → **Site configuration** → **Build & deploy** → **Import from Git** / link the GitHub repo  
   (If the site was only a drag-and-drop, use **Add new site → Import from Git** and then you can delete the old drop-site, or transfer the domain name `gweek` onto the Git site.)
5. Build settings: publish directory empty or `.`  Branch: `main`.
6. **Integrations → Identity** → Enable Identity.
7. Identity → **Registration** → Invite only.
8. Identity → **Services** → **Git Gateway** → Enable.
9. Identity → **Invite users** — your email and John’s.

## Each time you edit

1. Open https://gweek.netlify.app/admin/
2. Accept the invite email the first time. Set a password.
3. Catalogue → change a title, note, price, or upload a picture.
4. **Publish**.
5. Wait one or two minutes. Refresh the public site.

## What you can do in the panel

- Rename the collection (`Gweek 2027`).
- Add a piece (new ID, title, note, price, image).
- Change copy on an existing pot.
- Replace an image (upload a prepared 1920×1080 JPEG).

What you cannot do there: change the black design, the splash film, or Courses layout. That is still the folder and a conversation here.

## If Publish is grey or login loops

Git Gateway is off, or the site is still a drag-and-drop with no GitHub. Repeat steps 4–8.
