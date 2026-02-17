// ======= DATA =======
const USERS = {
  "admin@company.com": { role: "IT Admin", name: "Alex Mitchell", password: "password123", avatar: "AM" },
  "hr@company.com": { role: "HR Admin", name: "Sarah Chen", password: "password123", avatar: "SC" },
  "john.doe@company.com": { role: "Employee", name: "John Doe", password: "password123", avatar: "JD" },
};

const DOCUMENTS = [
  { id: 1, title: "Employee Handbook 2025", dept: "HR", type: "Policy", version: "v3.2", date: "2025-01-15", tags: ["onboarding", "policy"], size: "2.4 MB", views: 142, status: "active", requiresAck: true },
  { id: 2, title: "IT Security Guidelines", dept: "IT", type: "Security", version: "v2.1", date: "2025-02-01", tags: ["security", "compliance"], size: "1.8 MB", views: 87, status: "active", requiresAck: true },
  { id: 3, title: "Remote Work Policy", dept: "HR", type: "Policy", version: "v1.5", date: "2025-01-28", tags: ["remote", "policy"], size: "890 KB", views: 211, status: "active", requiresAck: false },
  { id: 4, title: "Data Retention Schedule", dept: "Legal", type: "Compliance", version: "v4.0", date: "2024-12-10", tags: ["compliance", "legal"], size: "3.1 MB", views: 56, status: "active", requiresAck: true },
  { id: 5, title: "Benefits Enrollment Guide", dept: "HR", type: "Guide", version: "v2.3", date: "2025-01-05", tags: ["benefits", "enrollment"], size: "5.2 MB", views: 334, status: "active", requiresAck: false },
  { id: 6, title: "Network Access Procedures", dept: "IT", type: "Procedure", version: "v1.8", date: "2024-11-20", tags: ["network", "security"], size: "1.2 MB", views: 44, status: "archived", requiresAck: false },
  { id: 7, title: "Expense Report Policy", dept: "Finance", type: "Policy", version: "v3.0", date: "2025-01-30", tags: ["finance", "expenses"], size: "670 KB", views: 189, status: "active", requiresAck: false },
  { id: 8, title: "GDPR Compliance Framework", dept: "Legal", type: "Compliance", version: "v2.5", date: "2025-02-08", tags: ["gdpr", "compliance", "legal"], size: "4.7 MB", views: 72, status: "active", requiresAck: true },
];

const deptColors = {
  HR: "#3b82f6",
  IT: "#10b981",
  Legal: "#f59e0b",
  Finance: "#8b5cf6",
};

const typeIcons = {
  Policy: "⬡",
  Security: "⬢",
  Compliance: "⬣",
  Guide: "◈",
  Procedure: "◇",
};

const actionColors = {
  VIEW: "#60a5fa",
  DOWNLOAD: "#34d399",
  UPLOAD: "#a78bfa",
  DELETE: "#f87171",
};

// ======= STATE =======
let screen = "login";
let user = null;

let email = "";
let password = "";
let loginError = "";

let activeNav = "documents";
let search = "";
let filterDept = "All";
let filterType = "All";

let selectedDoc = null;
let acknowledged = new Set();

let uploadModal = false;
let uploadName = "";
let uploadDept = "HR";
let uploadType = "Policy";
let uploadSuccess = false;

let docs = [...DOCUMENTS];
let sidebarCollapsed = false;

// ======= HELPERS =======
function isAdmin() {
  return user && (user.role === "IT Admin" || user.role === "HR Admin");
}

function formatToday() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function filteredDocs() {
  return docs.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchDept = filterDept === "All" || d.dept === filterDept;
    const matchType = filterType === "All" || d.type === filterType;

    return matchSearch && matchDept && matchType && d.status === "active";
  });
}

function stats() {
  return [
    { label: "TOTAL DOCS", value: docs.filter((d) => d.status === "active").length, color: "#3b82f6" },
    { label: "DEPARTMENTS", value: [...new Set(docs.map((d) => d.dept))].length, color: "#10b981" },
    { label: "PENDING ACKS", value: docs.filter((d) => d.requiresAck && !acknowledged.has(d.id)).length, color: "#f59e0b" },
    { label: "ARCHIVED", value: docs.filter((d) => d.status === "archived").length, color: "#6b7280" },
  ];
}

// ======= ACTIONS =======
function handleLogin() {
  const found = USERS[email];
  if (found && found.password === password) {
    user = { ...found, email };
    screen = "app";
    loginError = "";
    activeNav = "documents";
    selectedDoc = null;
    render();
  } else {
    loginError = "Invalid credentials. Please try again.";
    render();
  }
}

function handleLogout() {
  user = null;
  screen = "login";
  email = "";
  password = "";
  loginError = "";
  activeNav = "documents";
  selectedDoc = null;
  render();
}

function handleUpload() {
  if (!uploadName.trim()) return;

  const newDoc = {
    id: docs.length + 1,
    title: uploadName,
    dept: uploadDept,
    type: uploadType,
    version: "v1.0",
    date: new Date().toISOString().split("T")[0],
    tags: [uploadDept.toLowerCase(), uploadType.toLowerCase()],
    size: "1.0 MB",
    views: 0,
    status: "active",
    requiresAck: false,
  };

  docs = [newDoc, ...docs];
  uploadSuccess = true;
  render();

  setTimeout(() => {
    uploadModal = false;
    uploadSuccess = false;
    uploadName = "";
    render();
  }, 1500);
}

// ======= RENDER HELPERS =======
function renderAcksSection() {
  if (activeNav !== "acknowledgments") return "";

  const ackDocs = docs.filter(d => d.requiresAck);

  return `
    <div>
      <div style="margin-bottom:24px;">
        <h1 class="h1">MY ACKNOWLEDGMENTS</h1>
        <div class="sub">COMPLIANCE TRACKING FOR ${user ? user.name.toUpperCase() : ""}</div>
      </div>

      <div class="table">
        ${ackDocs.map(doc => {
          const icon = typeIcons[doc.type] || "◇";
          const dcol = deptColors[doc.dept] || "#6b7280";
          return `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:1px solid var(--border2);">
              <div style="display:flex; align-items:center; gap:14px;">
                <span style="color:${dcol}; font-size:14px;">${icon}</span>
                <div>
                  <div style="color:#d1d5db; font-size:12px; margin-bottom:3px;">${doc.title}</div>
                  <div style="color:var(--muted2); font-size:10px;">${doc.dept} · ${doc.version}</div>
                </div>
              </div>

              ${
                acknowledged.has(doc.id)
                  ? `<div style="color:#4ade80; font-size:10px; letter-spacing:0.1em;">✓ ACKNOWLEDGED</div>`
                  : `<button class="btn-ack" data-ack="${doc.id}" style="padding:7px 14px; font-size:9px;">ACKNOWLEDGE ◇</button>`
              }
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// ======= MAIN RENDER =======
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (screen === "login") {
    app.innerHTML = renderLogin();
  } else {
    app.innerHTML = `
      <div class="app">
        ${renderTopbar()}
        <div class="main-row">
          <div class="sidebar ${sidebarCollapsed ? "collapsed" : ""}" style="width:${sidebarCollapsed ? 52 : 200}px">
            ${renderSidebar()}
          </div>

          <div class="content">
            ${activeNav === "dashboard" ? renderDashboard() : ""}
            ${activeNav === "documents" ? renderDocuments() : ""}
            ${activeNav === "audit" && isAdmin() ? renderAudit() : ""}
            ${renderAcksSection()}
          </div>
        </div>

        ${uploadModal ? renderUploadModal() : ""}
      </div>
    `;
  }

  bindEvents();
}
