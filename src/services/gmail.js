import { emailTemplate } from "../config/emailTemplate.js";

export async function prepareGmailBcc(recipients) {
  if (!recipients.length) throw new Error("Select at least one recruiter email first.");
  const params = new URLSearchParams({ view: "cm", fs: "1", bcc: recipients.join(","), su: emailTemplate.subject, body: emailTemplate.body });
  const response = await chrome.runtime.sendMessage({ type: "OPEN_GMAIL_COMPOSE", url: `https://mail.google.com/mail/?${params.toString()}` });
  if (response?.error) throw new Error(response.error);
}
