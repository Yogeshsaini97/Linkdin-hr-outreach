chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "OPEN_GMAIL_COMPOSE") return;
  chrome.tabs.create({ url: message.url, active: true })
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ error: error.message || "Could not open Gmail." }));
  return true;
});
