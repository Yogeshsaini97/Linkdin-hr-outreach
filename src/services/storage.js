const SELECTED_EMAILS_KEY = "selectedEmails";
const RESUME_METADATA_KEY = "resumeMetadata";

export async function getSelectedEmails() {
  const result = await chrome.storage.local.get(SELECTED_EMAILS_KEY);
  return Array.isArray(result[SELECTED_EMAILS_KEY]) ? result[SELECTED_EMAILS_KEY] : [];
}

export async function saveSelectedEmails(emails) {
  const uniqueEmails = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))];
  await chrome.storage.local.set({ [SELECTED_EMAILS_KEY]: uniqueEmails });
  return uniqueEmails;
}

export async function getResumeMetadata() {
  const result = await chrome.storage.local.get(RESUME_METADATA_KEY);
  return result[RESUME_METADATA_KEY] || null;
}

export async function saveResumeMetadata(metadata) {
  await chrome.storage.local.set({ [RESUME_METADATA_KEY]: metadata });
  return metadata;
}
