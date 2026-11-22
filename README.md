# UnfollowTrack

A browser-based tool for comparing follower relationships from your own Instagram data export.

UnfollowTrack helps you check which accounts you follow do not appear in the same export's followers list, and compare follower snapshots over time. It is an independent project and is not affiliated with, endorsed by, or sponsored by Instagram or Meta.

## Privacy and data handling

- The app reads ZIP and JSON exports in the browser. It does not ask for an Instagram password, verification code, cookie, token, or account access.
- The application does not send export contents, usernames, or analysis results to an application backend.
- Results remain in browser memory for the current session unless you choose **Save snapshot**. Saved snapshots are stored in IndexedDB on that browser and device.
- The selected theme is stored in browser `localStorage`.
- Delete saved snapshots in the app's History page, or clear this site's data in your browser settings.
- A hosting provider may process ordinary technical request data when you visit a deployed copy. That is separate from the export contents, which this app processes locally.

Review the source and the privacy notices of any hosting provider before deploying your own copy. If analytics, external scripts, a backend, or other data collection is added later, update the privacy notice before release.

## Ethical use

- Use exports from your own account, or data you are authorized to handle.
- Do not use results to harass, threaten, shame, or expose another person.
- A missing account does not establish why it is missing. Renames, deactivation, blocking, and incomplete exports can affect comparisons.
- UnfollowTrack does not automate Instagram actions, scrape Instagram, or access Instagram accounts.
- Instagram is a trademark of Meta Platforms, Inc. Product names are used only to describe the supported export format.

## Get started

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js in your terminal. Create a production static export with:

```bash
npm run build
```

The static site output is written to `out/`.

## Deploy to Netlify

This repository is configured for a static Netlify deploy. In Netlify, choose **Add new project → Import an existing project**, connect GitHub, and select `mdkhadafii/Unfollow-Track-IG`. Keep `main` as the production branch and publish the project. Netlify reads `netlify.toml` for the build settings:

- Build command: `npm run build`
- Publish directory: `out`
- Node.js: 22

After the first deploy, share the site's `*.netlify.app` address. If Netlify created the project with private visibility, change its visibility to public so visitors outside your team can open it. New commits pushed to `main` will trigger another deploy.

Each visitor's files and saved snapshots stay in that visitor's browser. The app has no shared account system or cloud storage, so data does not follow someone to another browser or device.

## Export data from Instagram

In Instagram's Accounts Center, export **Followers and Following** as **JSON**. Download the archive to your device, then import its ZIP file into UnfollowTrack. You can also choose the relevant followers and following JSON files separately.

A single export shows the relationships at the time represented by that export; it cannot establish the exact time or reason an account disappeared. To compare changes, use two exports from the same account and check that both are complete.

## Repository hygiene

Do not commit Instagram exports, screenshots containing personal information, credentials, `.env` files, logs, `node_modules`, or build output. The repository ignore rules exclude common local and generated files. Never put real user exports or credentials in issues, pull requests, or public sample data.

## License

No license is included yet. A license should be selected by the project owner before granting others permission to reuse or distribute this code.
