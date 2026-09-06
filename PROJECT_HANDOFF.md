# LinkedIn HR Outreach — Project Handoff

## Current status

Milestone 1 and the initial outreach workflow are implemented as a Chrome Manifest V3 extension using React, JavaScript, Vite, Tailwind, Chrome Side Panel, and `chrome.storage.local`.

Build command:

```powershell
npm run build
```

Load the generated `dist` directory from `chrome://extensions` with Developer mode enabled.

## Implemented behavior

- Scans LinkedIn pages using a content script.
- Extracts only job-post leads containing one or more email addresses.
- Uses stable HTML signals where possible: `div[role="listitem"]`, `data-testid="expandable-text-box"`, `time`, profile links (`/in/`), and job links (`/jobs/view/`).
- Deduplicates leads by post URL, with a content fallback.
- Displays all lead data and full post text directly in each list card (no expandable details section).
- Each lead has an **Add email to BCC** toggle.
- BCC addresses are deduplicated and persist in `chrome.storage.local`.
- **Select all**, **Clear all**, and a selected-recipient count are available.
- **Prepare Gmail** opens a Gmail compose draft with selected emails in BCC plus the configured subject/body.
- Gmail's final Send action is always manual.

## Important files

- `src/content/linkedinParser.js` — LinkedIn parsing and email-only lead filtering.
- `src/components/LeadTable.jsx` — lead list and BCC controls.
- `src/App.jsx` — selection state, storage, sticky Gmail action area, resume picker metadata.
- `src/services/storage.js` — selected recipients and resume metadata persistence.
- `src/services/gmail.js` — Gmail compose URL generation and background handoff.
- `src/background.js` — opens Gmail compose in a new tab.
- `src/config/emailTemplate.js` — editable default email subject and body.
- `src/config/resumeConfig.js` — editable default resume filename metadata.
- `public/manifest.json` — MV3 permissions and content-script configuration.

## Email configuration

The current template targets MERN Stack Developer / Senior MERN Stack Developer roles and is defined in `src/config/emailTemplate.js`.

## Resume handling limitation

The default resume is `Yogesh saini_Tech_lead_MERN_2026_.pdf`. The side panel lets the user choose a different local PDF and persists only its metadata/name.

The extension does **not** and must not automatically attach a local file to Gmail. Browser security prevents safe, reliable local-file attachment through a Gmail compose URL; Gmail DOM automation is intentionally not used. The user must attach the selected PDF manually in Gmail before sending.

Gmail attachment failure observed on 2026-09-06 was Gmail's own `POST https://mail.google.com/_/upload` returning HTTP 500, not an extension upload action.

## Likely V2 work

- In-panel editable email templates with variable support and preview.
- Better per-lead matching and filtering.
- Saved multiple templates/resume metadata profiles.
- CSV export and outreach history.
- Optional supported Google OAuth/Gmail API architecture, if the user explicitly authorizes it. Do not implement automatic sending without explicit approval.
