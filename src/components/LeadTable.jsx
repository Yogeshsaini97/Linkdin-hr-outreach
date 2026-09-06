const value = (item) => item || "-";

export function LeadTable({ leads, selectedEmails, onToggle }) {
  if (!leads.length) return <div className="m-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><p className="font-medium text-slate-700">No LinkedIn leads found.</p><p className="mt-1 text-sm text-slate-500">Open LinkedIn and click Scan LinkedIn.</p></div>;
  return <div className="divide-y divide-slate-100">{leads.map((lead, index) => {
    const emails = lead.hrEmail.split(/\s*,\s*/).filter(Boolean);
    const added = emails.some((email) => selectedEmails.includes(email));
    return <article key={`${lead.postUrl}-${index}`} className="px-5 py-4 transition hover:bg-slate-50">
      <div className="flex gap-3"><div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-slate-100 text-center text-sm font-semibold leading-8 text-slate-600">{lead.hrName?.[0]?.toUpperCase() || "?"}</div><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-slate-900">{value(lead.hrName)}</h2><p className="mt-0.5 text-sm text-slate-700">{value(lead.jobCompany)}</p><p className="text-sm text-slate-500">{value(lead.jobRole)}</p><p className="mt-2 break-all text-xs text-emerald-700">{lead.hrEmail}</p></div></div>
      <button onClick={() => onToggle(emails)} className={added ? "mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700" : "mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"}>{added ? "Added to BCC" : "Add email to BCC"}</button>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-600"><div><dt className="text-slate-400">Location</dt><dd>{value(lead.location)}</dd></div><div><dt className="text-slate-400">Work mode</dt><dd>{value(lead.workMode)}</dd></div><div><dt className="text-slate-400">Experience</dt><dd>{value(lead.experience)}</dd></div><div><dt className="text-slate-400">Salary</dt><dd>{value(lead.salary)}</dd></div><div><dt className="text-slate-400">Phone</dt><dd>{value(lead.phoneNumber)}</dd></div><div><dt className="text-slate-400">Job type</dt><dd>{value(lead.jobType)}</dd></div></dl>
      {lead.requiredSkills && <p className="mt-3 text-xs text-slate-500"><span className="font-medium text-slate-600">Skills: </span>{lead.requiredSkills}</p>}
      <div className="mt-3"><p className="mb-1 text-xs font-medium text-slate-600">Post text</p><p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{lead.postText}</p>{lead.postUrl && <a className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline" href={lead.postUrl} target="_blank" rel="noreferrer">Open LinkedIn post</a>}</div>
    </article>;
  })}</div>;
}
