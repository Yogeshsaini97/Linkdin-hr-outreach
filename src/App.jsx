import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header.jsx";
import { LeadTable } from "./components/LeadTable.jsx";
import { prepareGmailBcc } from "./services/gmail.js";
import { scanActiveLinkedInTab } from "./services/messaging.js";
import { defaultResume } from "./config/resumeConfig.js";
import { getResumeMetadata, getSelectedEmails, saveResumeMetadata, saveSelectedEmails } from "./services/storage.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailsFromLead = (lead) => (lead.hrEmail || "").split(/\s*,\s*/).map((email) => email.toLowerCase()).filter((email) => emailPattern.test(email));

export default function App() {
  const [leads, setLeads] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const [resume, setResume] = useState(defaultResume);
  useEffect(() => { getSelectedEmails().then(setSelectedEmails).catch(() => setError("Could not load saved BCC recipients.")); getResumeMetadata().then((saved) => { if (saved) setResume(saved); }).catch(() => setError("Could not load saved resume information.")); }, []);
  const emailCount = useMemo(() => new Set(leads.flatMap(emailsFromLead)).size, [leads]);
  const persist = async (emails) => { const saved = await saveSelectedEmails(emails); setSelectedEmails(saved); };
  const toggleLead = async (emails) => { try { const selected = emails.some((email) => selectedEmails.includes(email)); await persist(selected ? selectedEmails.filter((email) => !emails.includes(email)) : [...selectedEmails, ...emails]); } catch { setError("Could not save BCC recipients."); } };
  const selectAll = async () => { try { await persist(leads.flatMap(emailsFromLead)); } catch { setError("Could not save BCC recipients."); } };
  const clearAll = async () => { try { await persist([]); } catch { setError("Could not save BCC recipients."); } };
  const scan = async () => { setScanning(true); setError(""); try { const response = await scanActiveLinkedInTab(); if (response?.error) throw new Error(response.error); setLeads(response.leads || []); setUpdated(new Date(response.scannedAt).toLocaleTimeString()); } catch (err) { setError(err instanceof Error ? err.message : "Unable to reach LinkedIn."); } finally { setScanning(false); } };
  const prepareEmail = async () => { setPreparing(true); setError(""); try { await prepareGmailBcc(selectedEmails); } catch (err) { setError(err instanceof Error ? err.message : "Unable to prepare Gmail."); } finally { setPreparing(false); } };
  const chooseResume = async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const metadata = { fileName: file.name, fileType: file.type, size: file.size, lastModified: file.lastModified }; await saveResumeMetadata(metadata); setResume(metadata); } catch { setError("Could not save resume information."); } };
  return <main className="min-h-screen bg-white pb-44"><Header leadCount={leads.length} emailCount={emailCount} selectedCount={selectedEmails.length} scanning={scanning} onScan={scan}/>{error && <div role="alert" className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}{updated && <p className="px-5 pt-3 text-xs text-slate-400">Last scanned {updated}</p>}<LeadTable leads={leads} selectedEmails={selectedEmails} onToggle={toggleLead}/><section className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold text-slate-800">BCC recipients: {selectedEmails.length}</p><p className="mt-1 break-all text-xs text-slate-500">Resume to attach: {resume.fileName}</p></div><label className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">Choose resume<input className="hidden" type="file" accept="application/pdf,.pdf" onChange={chooseResume}/></label></div><p className="mt-2 text-xs text-slate-500">Gmail will open a draft. Attach the named PDF in Gmail, review it, and click Send yourself.</p><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={selectAll} disabled={!leads.length} className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 disabled:opacity-40">Select all</button><button onClick={clearAll} disabled={!selectedEmails.length} className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 disabled:opacity-40">Clear all</button><button onClick={prepareEmail} disabled={!selectedEmails.length || preparing} className="rounded-lg bg-blue-700 px-2 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40">{preparing ? "Opening..." : "Prepare Gmail"}</button></div></div></section></main>;
}
