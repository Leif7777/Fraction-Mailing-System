// Sample inbox data
const sampleEmails = [
  {
    id: 1,
    from: "sarah.johnson@client.com",
    fromName: "Sarah Johnson",
    subject: "URGENT: Contract needs your signature today",
    body: "Hi,\n\nI need you to sign the attached contract ASAP. Our deadline is end of business today and we cannot proceed without your signature. Please let me know once it's done.\n\nThanks,\nSarah",
    date: "2026-02-25T09:15:00",
    read: false,
  },
  {
    id: 2,
    from: "newsletter@techdigest.io",
    fromName: "Tech Digest",
    subject: "Your weekly tech roundup is here 📰",
    body: "This week in tech: AI breakthroughs, new smartphone releases, and more. Click to read the full newsletter. Unsubscribe at any time.",
    date: "2026-02-25T08:00:00",
    read: true,
  },
  {
    id: 3,
    from: "mike.chen@partner.com",
    fromName: "Mike Chen",
    subject: "Question about the Q1 budget proposal",
    body: "Hey,\n\nI reviewed the Q1 budget proposal you sent over. A few things I'd like to clarify:\n\n1. Could you explain the 20% increase in marketing spend?\n2. What's the timeline for the infrastructure upgrades?\n\nPlease respond when you get a chance.\n\nBest,\nMike",
    date: "2026-02-25T10:30:00",
    read: false,
  },
  {
    id: 4,
    from: "no-reply@shopdeals.com",
    fromName: "Shop Deals",
    subject: "🛍️ HUGE SALE: 70% off everything this weekend only!",
    body: "Don't miss out on our biggest sale of the year! Use code SAVE70 at checkout. Limited time offer. Unsubscribe from promotional emails here.",
    date: "2026-02-25T07:45:00",
    read: true,
  },
  {
    id: 5,
    from: "anna.williams@company.com",
    fromName: "Anna Williams",
    subject: "FYI - Office closure on March 3rd",
    body: "Hi team,\n\nJust a heads up that the office will be closed on Monday, March 3rd for scheduled maintenance. Please plan to work from home that day.\n\nFor your information only — no action required.\n\nAnna",
    date: "2026-02-25T11:00:00",
    read: false,
  },
  {
    id: 6,
    from: "david.lee@startup.io",
    fromName: "David Lee",
    subject: "Critical system outage - immediate action required",
    body: "Team,\n\nWe are experiencing a critical outage affecting all production systems. This requires immediate attention from the on-call engineer. Please escalate this emergency immediately.\n\nDavid",
    date: "2026-02-25T12:05:00",
    read: false,
  },
  {
    id: 7,
    from: "recruiter@talentco.com",
    fromName: "TalentCo Recruiter",
    subject: "Exciting career opportunity for you!",
    body: "Hi there,\n\nI came across your profile and think you'd be a great fit for a senior role at one of our clients. Are you open to new opportunities? Click here to learn more or unsubscribe.",
    date: "2026-02-24T16:20:00",
    read: true,
  },
  {
    id: 8,
    from: "jessica.park@client.com",
    fromName: "Jessica Park",
    subject: "Re: Project timeline — can we set up a call?",
    body: "Hi,\n\nFollowing up on my previous email about the project timeline. Could we schedule a quick call this week to align on the deliverables? Please let me know your availability.\n\nThanks,\nJessica",
    date: "2026-02-25T13:45:00",
    read: false,
  },
  {
    id: 9,
    from: "it@company.com",
    fromName: "IT Department",
    subject: "FYI: Scheduled maintenance this Saturday",
    body: "Dear colleagues,\n\nPlease be informed that our servers will undergo scheduled maintenance this Saturday from 2 AM to 6 AM. Services may be intermittently unavailable during this window.\n\nNo action required.\n\nIT Team",
    date: "2026-02-25T09:00:00",
    read: true,
  },
  {
    id: 10,
    from: "boss@company.com",
    fromName: "Alex (Manager)",
    subject: "Need your report ASAP — board meeting tomorrow",
    body: "Hey,\n\nI need the Q4 performance report urgently. The board meeting is tomorrow morning and I need to review it tonight. Please send it over as soon as possible.\n\nAlex",
    date: "2026-02-25T14:30:00",
    read: false,
  },
];

// Priority order for sorting (lower number = higher priority)
const PRIORITY_ORDER = {
  Urgent: 1,
  "Needs Reply": 2,
  FYI: 3,
  Ignore: 4,
};

/**
 * Classify an email into one of four labels based on its content.
 * @param {object} email
 * @returns {string} label
 */
function classifyEmail(email) {
  const text = `${email.subject} ${email.body}`.toLowerCase();

  const urgentKeywords = [
    "urgent",
    "asap",
    "immediately",
    "critical",
    "emergency",
    "as soon as possible",
    "right away",
    "immediate action",
  ];
  const needsReplyKeywords = [
    "please respond",
    "let me know",
    "please reply",
    "could you",
    "can you",
    "would you",
    "following up",
    "get back to me",
    "your availability",
    "schedule a",
    "set up a call",
    "question",
    "clarify",
    "please send",
  ];
  const ignoreKeywords = [
    "unsubscribe",
    "sale",
    "offer",
    "deal",
    "discount",
    "promo",
    "newsletter",
    "no-reply",
    "noreply",
    "promotional",
    "click here",
    "limited time",
  ];
  const fyiKeywords = [
    "fyi",
    "for your information",
    "heads up",
    "just a heads",
    "no action required",
    "be informed",
    "please be informed",
    "for information only",
    "for info",
  ];

  if (urgentKeywords.some((kw) => text.includes(kw))) return "Urgent";
  if (ignoreKeywords.some((kw) => text.includes(kw))) return "Ignore";
  if (fyiKeywords.some((kw) => text.includes(kw))) return "FYI";
  if (needsReplyKeywords.some((kw) => text.includes(kw))) return "Needs Reply";

  // Default: if sender address looks like no-reply, mark as Ignore
  if (email.from.includes("no-reply") || email.from.includes("noreply"))
    return "Ignore";

  return "FYI";
}

/**
 * Generate a context-aware draft reply for emails that need a response.
 * @param {object} email
 * @returns {string} draft reply text
 */
function generateDraftReply(email) {
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();

  // Detect context for smarter replies
  if (
    subject.includes("contract") ||
    body.includes("sign") ||
    body.includes("signature")
  ) {
    return `Hi ${email.fromName.split(" ")[0]},\n\nThank you for reaching out. I've received the contract and will review it immediately. I'll have it signed and returned to you shortly.\n\nPlease let me know if there's anything else you need in the meantime.\n\nBest regards`;
  }

  if (
    subject.includes("budget") ||
    body.includes("budget") ||
    body.includes("proposal")
  ) {
    return `Hi ${email.fromName.split(" ")[0]},\n\nThank you for your questions regarding the budget proposal. I'm happy to clarify:\n\n1. The 20% increase in marketing spend reflects our planned expansion into new channels for Q1.\n2. The infrastructure upgrades are scheduled for weeks 3–4 of Q1, pending final approval.\n\nPlease let me know if you have any further questions.\n\nBest regards`;
  }

  if (
    subject.includes("call") ||
    body.includes("schedule a") ||
    body.includes("set up a call") ||
    body.includes("your availability")
  ) {
    return `Hi ${email.fromName.split(" ")[0]},\n\nThank you for following up. I'd be happy to connect — I'm available Tuesday and Thursday afternoons this week. Please feel free to send a calendar invite for whichever works best for you.\n\nLooking forward to speaking with you.\n\nBest regards`;
  }

  if (
    subject.includes("report") ||
    body.includes("report") ||
    body.includes("board meeting")
  ) {
    return `Hi ${email.fromName.split(" ")[0]},\n\nApologies for the delay — I'm finalizing the report now and will have it to you within the hour. Thank you for the heads up about the board meeting.\n\nBest regards`;
  }

  if (body.includes("outage") || subject.includes("outage")) {
    return `Hi ${email.fromName.split(" ")[0]},\n\nI've received your message about the outage and am escalating this immediately. I'll keep you updated as the situation develops.\n\nBest regards`;
  }

  // Generic fallback reply
  return `Hi ${email.fromName.split(" ")[0]},\n\nThank you for your email. I've received your message and will get back to you as soon as possible.\n\nBest regards`;
}

/**
 * Process all emails: classify, prioritize, and sort them.
 * @returns {Array} processed and sorted emails
 */
function processEmails() {
  return sampleEmails
    .map((email) => ({
      ...email,
      label: classifyEmail(email),
      draft: null, // populated on demand
    }))
    .sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.label] - PRIORITY_ORDER[b.label];
      if (priorityDiff !== 0) return priorityDiff;
      // Within the same priority, sort newest first
      return new Date(b.date) - new Date(a.date);
    });
}

// ─── UI rendering ────────────────────────────────────────────────────────────

let emails = processEmails();
let activeFilter = "All";
let selectedEmailId = null;

const LABEL_COLORS = {
  Urgent: "label-urgent",
  "Needs Reply": "label-needs-reply",
  FYI: "label-fyi",
  Ignore: "label-ignore",
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getFilteredEmails() {
  if (activeFilter === "All") return emails;
  return emails.filter((e) => e.label === activeFilter);
}

function renderEmailList() {
  const list = document.getElementById("email-list");
  const filtered = getFilteredEmails();

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">No emails in this category.</div>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (email) => `
    <div class="email-item ${email.read ? "read" : "unread"} ${selectedEmailId === email.id ? "selected" : ""}"
         onclick="selectEmail(${email.id})">
      <div class="email-item-header">
        <span class="email-from">${escapeHtml(email.fromName)}</span>
        <span class="email-date">${formatDate(email.date)}</span>
      </div>
      <div class="email-subject">${escapeHtml(email.subject)}</div>
      <div class="email-preview">${escapeHtml(email.body.substring(0, 80))}…</div>
      <span class="label ${LABEL_COLORS[email.label]}">${email.label}</span>
    </div>
  `
    )
    .join("");
}

function renderEmailDetail(email) {
  const detail = document.getElementById("email-detail");

  const draftSection =
    email.label === "Needs Reply" || email.label === "Urgent"
      ? `
    <div class="draft-section">
      <div class="draft-header">
        <span>✉️ Draft Reply</span>
        <button class="btn-copy" onclick="copyDraft(${email.id})">Copy</button>
      </div>
      <textarea class="draft-textarea" id="draft-${email.id}">${escapeHtml(generateDraftReply(email))}</textarea>
    </div>
  `
      : "";

  detail.innerHTML = `
    <div class="detail-header">
      <h2 class="detail-subject">${escapeHtml(email.subject)}</h2>
      <span class="label ${LABEL_COLORS[email.label]}">${email.label}</span>
    </div>
    <div class="detail-meta">
      <div><strong>From:</strong> ${escapeHtml(email.fromName)} &lt;${escapeHtml(email.from)}&gt;</div>
      <div><strong>Date:</strong> ${new Date(email.date).toLocaleString()}</div>
    </div>
    <div class="detail-body">${escapeHtml(email.body).replace(/\n/g, "<br>")}</div>
    ${draftSection}
  `;
}

function renderSidebar() {
  const counts = { All: emails.length };
  emails.forEach((e) => {
    counts[e.label] = (counts[e.label] || 0) + 1;
  });

  const filters = ["All", "Urgent", "Needs Reply", "FYI", "Ignore"];
  const sidebar = document.getElementById("sidebar-filters");
  sidebar.innerHTML = filters
    .map(
      (f) => `
    <div class="sidebar-item ${activeFilter === f ? "active" : ""}" onclick="setFilter('${f}')">
      <span>${f}</span>
      <span class="count-badge">${counts[f] || 0}</span>
    </div>
  `
    )
    .join("");
}

function selectEmail(id) {
  selectedEmailId = id;
  const email = emails.find((e) => e.id === id);
  email.read = true;
  renderEmailList();
  renderEmailDetail(email);
}

function setFilter(filter) {
  activeFilter = filter;
  selectedEmailId = null;
  document.getElementById("email-detail").innerHTML = `
    <div class="placeholder">Select an email to read it.</div>
  `;
  renderSidebar();
  renderEmailList();
}

function copyDraft(emailId) {
  const textarea = document.getElementById(`draft-${emailId}`);
  navigator.clipboard
    .writeText(textarea.value)
    .then(() => {
      const btn = textarea.previousElementSibling.querySelector(".btn-copy");
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    })
    .catch(() => {
      textarea.select();
      document.execCommand("copy");
    });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Initialise ──────────────────────────────────────────────────────────────

function init() {
  renderSidebar();
  renderEmailList();

  // Auto-select the first (highest-priority) email
  if (emails.length > 0) {
    selectEmail(emails[0].id);
  }
}

document.addEventListener("DOMContentLoaded", init);
