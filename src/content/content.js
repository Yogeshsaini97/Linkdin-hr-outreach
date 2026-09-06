import { parseLinkedInPosts } from "./linkedinParser.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "SCAN_LINKEDIN") return;
  try { sendResponse({ leads: parseLinkedInPosts(), scannedAt: new Date().toISOString() }); }
  catch (error) { sendResponse({ error: error instanceof Error ? error.message : "Could not scan this page." }); }
  return true;
});
