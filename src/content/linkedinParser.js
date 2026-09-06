// Uses stable LinkedIn roles, elements, data attributes, and URL paths only.
const clean = (value = "") => value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
const unique = (values) => [...new Set(values.filter(Boolean))];
const nodeText = (node) => clean(node?.innerText || node?.textContent || "");
const readableText = (node) => (node?.innerText || node?.textContent || "").replace(/\r/g, "").split(/\n+/).map(clean).filter(Boolean).join("\n");
const fieldEnd = /(?:Location|Experience|Job Type|Employment(?: Type)?|Required Skills|Technical Skills|Skills|Salary|Compensation|Apply|How to Apply|Contact)\s*:/i;
const trimField = (value) => clean((value || "").split(fieldEnd)[0]);

function labelledValue(text, labels) {
  const values = text.split(/\n+/).map(clean).filter(Boolean);
  for (let index = 0; index < values.length; index += 1) for (const label of labels) {
    const match = values[index].match(new RegExp(`^${label}\\s*[:\\-\\u2013\\u2014]?\\s*(.*)$`, "i"));
    if (match) return clean(match[1] || values[index + 1] || "");
  }
  return "";
}
function getPostText(post) {
  const body = post.querySelector('[data-testid="expandable-text-box"]') || post.querySelector('[data-test-id="main-feed-activity-card__commentary"]') || post.querySelector('.update-components-text');
  return readableText(body || post);
}
function parseEmails(post, text) {
  const mailto = [...post.querySelectorAll('a[href^="mailto:"]')].map((link) => link.href.replace(/^mailto:/i, "").split("?")[0].toLowerCase());
  const visible = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return unique([...mailto, ...visible.map((email) => email.toLowerCase())]);
}
function parsePhone(text) {
  const labelled = [...text.matchAll(/(?:WhatsApp|Whats App|Phone|Mobile|Contact|Call)\s*(?:Number)?\s*[:\-]?\s*(\+?\d[\d\s().-]{8,16}\d)/gi)].map((match) => clean(match[1]));
  const generic = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g) || [];
  return unique([...labelled, ...generic].filter((number) => { const digits = number.replace(/\D/g, ""); return digits.length >= 10 && digits.length <= 13; }));
}
function parseProfile(post) {
  const profile = post.querySelector('a[href*="/in/"]');
  const nameElement = profile?.querySelector('[aria-label]') || profile?.querySelector('p') || profile;
  const hrName = clean(nodeText(nameElement).replace(/\s*(Verified Profile|Open to work|1st|2nd|3rd\+?).*$/i, ""));
  const paragraphs = [...post.querySelectorAll('p')].map(nodeText);
  const hrHeadline = paragraphs.find((value) => value && value !== hrName && !/^\s*\u2022?\s*(?:\d+\s*)?(?:1st|2nd|3rd\+?)\s*$/i.test(value) && !/^\d+\s*(m|h|d|w|mo|y)\s*\u2022/i.test(value) && !value.includes("@") && value.length < 180) || "";
  return { hrName, hrHeadline, hrProfile: profile?.href?.split("?")[0] || "" };
}
function parseJobCard(post) {
  const jobLink = post.querySelector('a[href*="/jobs/view/"]');
  if (!jobLink) return { jobRole: "", jobCompany: "", location: "" };
  const values = unique([...jobLink.querySelectorAll('p')].map(nodeText).map((value) => value.replace(/\s*\(Verified job\)$/i, "")).filter(Boolean));
  return { jobRole: values[0] || "", jobCompany: values[1] || "", location: values[2] || "" };
}
function parseSalary(text) {
  const labelled = labelledValue(text, ["Salary", "Pay", "Compensation", "CTC", "Package", "Salary Range"]);
  return trimField(labelled || text.match(/(?:\u20B9|\$|\u20AC|\u00A3)\s?[\d,.]+(?:\s*[-\u2013\u2014]\s*(?:\u20B9|\$|\u20AC|\u00A3)?\s?[\d,.]+)?(?:\s*(?:LPA|Lakh|Lakhs|\/month|\/year|per month|per year))?/i)?.[0]);
}
function parseExperience(text) {
  const labelled = labelledValue(text, ["Experience", "Experience Required", "Required Experience", "Exp", "Years of Experience"]);
  const fallback = text.match(/\b(?:Intern|Fresher)\s*(?:to|-|\u2013|\u2014)\s*\d+\+?\s*(?:Years?|Yrs?)\b|\b\d+\+?\s*(?:to|-|\u2013|\u2014)\s*\d+\+?\s*(?:Years?|Yrs?)\b|\b\d+\+?\s*(?:Years?|Yrs?)\s*(?:of\s+experience)?\b/i)?.[0];
  return trimField(labelled || fallback);
}
function parseLocation(text, cardLocation) {
  const labelled = labelledValue(text, ["Location", "Job Location", "Work Location", "Office Location"]);
  const phrase = text.match(/\b(?:based in|located in|office in|work(?:ing)? from)\s+([^.,\n|]+)/i)?.[1];
  return trimField(labelled || cardLocation || phrase);
}
function parseSkills(text) {
  const labelled = labelledValue(text, ["Required Skills", "Technical Skills", "Tech Stack", "Skills"]);
  if (labelled) return trimField(labelled);
  const values = text.split(/\n+/).map(clean).filter(Boolean);
  const start = values.findIndex((line) => /^(?:[^A-Za-z0-9]*\s*)?(?:Required Skills|Technical Skills|Tech Stack|Skills)\s*:?\s*$/i.test(line));
  if (start < 0) return "";
  const stop = /^(?:Responsibilities|Requirements|Qualifications|Benefits|Education|Experience|Location|Salary|Job Type|Employment|Apply|How to Apply|Contact|About the Role)\s*:?$/i;
  const skills = [];
  for (let index = start + 1; index < values.length; index += 1) { const line = values[index].replace(/^[-*\u2022\u25AA\u25E6]\s*/, ""); if (stop.test(line) || /^(?:email|phone|contact|whatsapp|apply)\s*:/i.test(line)) break; skills.push(line); }
  return unique(skills).join(", ");
}
function parseRole(text) {
  return labelledValue(text, ["Position", "Job Title", "Job Role", "Role", "Hiring For"])
    || clean(text.match(/(?:We're Hiring|We are Hiring|Hiring Alert|Urgently Hiring|Hiring)\s*[\u2014\u2013\-:|]\s*([^|\n]+)/i)?.[1] || "")
    || clean(text.match(/\blooking for\s+(?:a\s+|an\s+)?([A-Za-z][A-Za-z .&/-]{2,80}?)(?:\s+to\s+join|\s+for\s+our|[!.,\n])/i)?.[1] || "")
    || clean(text.match(/\b(?:opportunity|opening)\s+for\s+(?:a\s+|an\s+)?([^\n.|]{3,80})/i)?.[1] || "");
}
function parseCompany(text) {
  return labelledValue(text, ["Company", "Organization", "Organisation"])
    || clean(text.match(/\b([A-Za-z0-9][A-Za-z0-9 .&'-]{1,60}?)\s+is hiring\b/i)?.[1] || "")
    || clean(text.match(/\bhiring\s+(?:at|for)\s+([A-Za-z0-9][A-Za-z0-9 .&'-]{1,60})/i)?.[1]?.split(/[.!?\n|]/)[0] || "")
    || clean(text.match(/\b(?:developer|engineer|designer|manager|consultant|specialist)\s+at\s+([A-Za-z0-9][A-Za-z0-9 .&'-]{1,60})/i)?.[1]?.split(/[.!?\n|]/)[0] || "");
}
function parseDetails(text, card) {
  const modes = [/\bremote\b/i.test(text) && "Remote", /\bhybrid\b/i.test(text) && "Hybrid", /\bon[- ]?site\b/i.test(text) && "On-site"].filter(Boolean).join(", ");
  const types = ["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Freelance"].filter((type) => new RegExp(`\\b${type}\\b`, "i").test(text)).join(", ");
  return { salary: parseSalary(text), experience: parseExperience(text), location: parseLocation(text, card.location), workMode: modes, jobType: trimField(labelledValue(text, ["Job Type", "Employment Type", "Employment"]) || types), requiredSkills: parseSkills(text) };
}
export function parseLinkedInPosts() {
  const seen = new Set();
  return [...document.querySelectorAll('div[role="listitem"]')].map((post, index) => {
    const postText = getPostText(post); const card = parseJobCard(post);
    const posted = nodeText(post.querySelector('time')) || [...post.querySelectorAll('p')].map(nodeText).find((value) => /^\d+\s*(m|h|d|w|mo|y)\s*\u2022/i.test(value)) || "";
    const postUrl = [...post.querySelectorAll('a[href]')].find((link) => /\/(posts|feed\/update)\//.test(link.href))?.href?.split("?")[0] || "";
    return { id: index + 1, datePosted: clean(posted.replace(/\u2022/g, "")), jobCompany: card.jobCompany || parseCompany(postText), jobRole: card.jobRole || parseRole(postText), ...parseDetails(postText, card), ...parseProfile(post), hrEmail: parseEmails(post, postText).join(", "), phoneNumber: parsePhone(postText).join(", "), postUrl, postText };
  }).filter((lead) => {
    // This outreach utility intentionally keeps only posts with an email address.
    if (!lead.hrEmail || lead.postText.length < 30) return false;
    const key = (lead.postUrl || [lead.jobCompany, lead.jobRole, lead.hrEmail, lead.postText.slice(0, 120)].join("|")).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
