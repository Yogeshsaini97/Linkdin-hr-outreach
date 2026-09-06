export async function scanActiveLinkedInTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id || !tab.url?.startsWith("https://www.linkedin.com/")) throw new Error("Open a LinkedIn page, then click Scan LinkedIn.");
  return chrome.tabs.sendMessage(tab.id, { type: "SCAN_LINKEDIN" });
}
