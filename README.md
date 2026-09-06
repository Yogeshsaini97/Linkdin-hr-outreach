# LinkedIn HR Outreach

A Manifest V3 Chrome extension that scans LinkedIn job posts and displays locally extracted HR/job leads in Chrome's Side Panel. This first milestone covers scanning and review only; no data leaves the browser.

## Run and load

```powershell
npm install
npm run build
```

In Chrome, open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and select this project's `dist` directory. Open a LinkedIn page, click the extension icon to open its side panel, then click **Scan LinkedIn**.

## Architecture

- `src/content/linkedinParser.js` — DOM parsing using stable HTML roles, tags, data attributes, and URL paths
- `src/content/content.js` — content-script message handler
- `src/services/messaging.js` — side-panel/content-script bridge
- `src/components/` — responsive React side-panel components
- `src/config/emailTemplate.js` — editable Gmail subject and body configuration
- `src/config/resumeConfig.js` — default resume metadata; the side panel can store a different selected PDF name locally

## Current scope and limitations

This milestone reads only posts currently loaded in the LinkedIn page. It keeps only posts containing an extracted email address, so the lead list is ready for outreach. It avoids LinkedIn's unstable generated CSS classes and uses `role="listitem"`, `data-testid="expandable-text-box"`, `time`, `p`, profile links (`/in/`), and job-card links (`/jobs/view/`) instead. Selection persistence, templates, Gmail preparation, and resume settings are deliberately reserved for the later milestones described in the original plan.
