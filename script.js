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

const AUDIT_LOGS = [
  { id: 1, user: "John Doe", action: "VIEW", doc: "Employee Handbook 2025", time: "10:42 AM", ip: "192.168.1.45" },
  { id: 2, user: "Sarah Chen", action: "UPLOAD", doc: "GDPR Compliance Framework", time: "10:15 AM", ip: "192.168.1.12" },
  { id: 3, user: "Alex Mitchell", action: "DELETE", doc: "Network Access Procedures", time: "09:58 AM", ip: "192.168.1.2" },
  { id: 4, user: "John Doe", action: "DOWNLOAD", doc: "Remote Work Policy", time: "09:31 AM", ip: "192.168.1.45" },
  { id: 5, user: "Sarah Chen", action: "VIEW", doc: "Benefits Enrollment Guide", time: "09:14 AM", ip: "192.168.1.12" },
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

// ======= RENDER =======
function render() {
  const app = document.getElementById("app");
  app.innerHTML = screen === "login" ? renderLogin() : renderApp();
  bindEvents();
}
{/* My Acknowledgments */}
{activeNav === "acknowledgments" && (
  <div>
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ color: "#e5e7eb", fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>
        MY ACKNOWLEDGMENTS
      </h1>
      <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: "0.1em" }}>
        Pending and acknowledged documents
      </div>
    </div>

    {/* Acknowledgment Table */}
    <div style={{ background: "#111318", border: "1px solid #1f2937" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", padding: "10px 16px", borderBottom: "1px solid #1f2937" }}>
        {["TITLE / DEPARTMENT", "TYPE", "STATUS", ""].map((h, i) => (
          <div key={i} style={{ color: "#374151", fontSize: 9, letterSpacing: "0.12em" }}>{h}</div>
        ))}
      </div>
      {docs
        .filter(d => d.requiresAck)
        .map(doc => {
          const isAck = acknowledged.has(doc.id);
          return (
            <div key={doc.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 80px 80px",
              padding: "12px 16px",
              borderBottom: "1px solid #161920",
              alignItems: "center",
              background: isAck ? "#111c12" : "transparent",
              transition: "background 0.2s",
              cursor: "pointer"
            }}
              onClick={() => setSelectedDoc(doc)}
              onMouseEnter={e => { if (!isAck) e.currentTarget.style.background = "#131620"; }}
              onMouseLeave={e => { if (!isAck) e.currentTarget.style.background = "transparent"; }}
            >
              <div>
                <div style={{ color: "#d1d5db", fontSize: 12, marginBottom: 3 }}>{doc.title}</div>
                <div style={{ color: deptColors[doc.dept] || "#6b7280", fontSize: 10, letterSpacing: "0.1em" }}>{doc.dept}</div>
              </div>
              <div style={{ color: "#4b5563", fontSize: 10 }}>{doc.type}</div>
              <div style={{ color: isAck ? "#4ade80" : "#f59e0b", fontSize: 10 }}>{isAck ? "ACKNOWLEDGED" : "PENDING"}</div>
              <div>
                {!isAck && (
                  <button onClick={e => { e.stopPropagation(); setAcknowledged(prev => new Set([...prev, doc.id])); }}
                    style={{ background: "#1a2a12", border: "1px solid #4ade80", color: "#4ade80", padding: "4px 12px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>
                    ◇ ACK
                  </button>
                )}
              </div>
            </div>
          );
        })}
      {docs.filter(d => d.requiresAck).length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", color: "#374151", fontSize: 12, letterSpacing: "0.1em" }}>
          NO DOCUMENTS REQUIRING ACKNOWLEDGMENT
        </div>
      )}
    </div>

    {/* Selected Doc Detail */}
    {selectedDoc && selectedDoc.requiresAck && (
      <div style={{ marginTop: 16, background: "#111318", border: "1px solid #1f2937", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ color: "#e5e7eb", fontSize: 14, marginBottom: 4 }}>{selectedDoc.title}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: deptColors[selectedDoc.dept], fontSize: 10, padding: "2px 8px", border: `1px solid ${deptColors[selectedDoc.dept]}40`, background: `${deptColors[selectedDoc.dept]}10` }}>{selectedDoc.dept}</span>
              <span style={{ color: "#4b5563", fontSize: 10, padding: "2px 8px", border: "1px solid #1f2937" }}>{selectedDoc.type}</span>
            </div>
          </div>
          <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {!acknowledged.has(selectedDoc.id) && (
          <button onClick={() => setAcknowledged(prev => new Set([...prev, selectedDoc.id]))}
            style={{ background: "#1a2a12", border: "1px solid #4ade80", color: "#4ade80", padding: "8px 16px", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>
            ◇ ACKNOWLEDGE
          </button>
        )}
        {acknowledged.has(selectedDoc.id) && <span style={{ color: "#4ade80", fontSize: 10, padding: "8px 0", letterSpacing: "0.1em" }}>✓ ACKNOWLEDGED</span>}
      </div>
    )}
  </div>
)}


// ======= TEMPLATES =======
function renderLogin() {
  return `
    <div class="login-wrap">
      <div class="grid-bg"></div>
      <div class="radial-1"></div>
      <div class="radial-2"></div>

      <div class="login-inner">
        <div class="logo">
          <div class="logo-row">
            <div class="logo-box">◈</div>
            <span class="logo-title">INTRANET</span>
            <span class="logo-badge">PORTAL</span>
          </div>
          <p class="logo-sub">Secure Document Management System</p>
        </div>

        <div class="card">
          <div class="field">
            <div class="label">EMAIL ADDRESS</div>
            <input id="email" class="input" type="email" placeholder="user@company.com" value="${escapeHtml(email)}"/>
          </div>

          <div class="field">
            <div class="label">PASSWORD</div>
            <input id="password" class="input" type="password" placeholder="••••••••••" value="${escapeHtml(password)}"/>
          </div>

          ${loginError ? `<div class="error">${escapeHtml(loginError)}</div>` : ""}

          <button id="btnLogin" class="btn-primary">AUTHENTICATE →</button>
        </div>

        <div class="demo">
          <div class="demo-title">DEMO ACCOUNTS</div>

          ${demoRow("IT ADMIN", "admin@company.com", "#10b981")}
          ${demoRow("HR ADMIN", "hr@company.com", "#f59e0b")}
          ${demoRow("EMPLOYEE", "john.doe@company.com", "#60a5fa")}
        </div>
      </div>
    </div>
  `;
}

function demoRow(label, mail, color) {
  return `
    <div class="demo-row" data-demo="${mail}">
      <span class="demo-label" style="color:${color}">${label}</span>
      <span class="demo-email">${mail}</span>
    </div>
  `;
}

function renderApp() {
  const collapsedW = sidebarCollapsed ? 52 : 200;

  return `
    <div class="app">
      ${renderTopbar()}
      <div class="main-row">
        <div class="sidebar ${sidebarCollapsed ? "collapsed" : ""}" style="width:${collapsedW}px">
          ${renderSidebar()}
        </div>

        <div class="content">
          ${activeNav === "dashboard" ? renderDashboard() : ""}
          ${activeNav === "documents" ? renderDocuments() : ""}
          ${activeNav === "audit" && isAdmin() ? renderAudit() : ""}
          ${activeNav === "acknowledgments" ? renderAcks() : ""}
        </div>
      </div>

      ${uploadModal ? renderUploadModal() : ""}
    </div>
  `;
}

function renderTopbar() {
  return `
    <div class="topbar">
      <div class="brand">
        <button id="btnSidebar" class="icon-btn">☰</button>
        <div class="brand-box">◈</div>
        <span class="brand-name">INTRANET</span>
        <span class="brand-tag">PORTAL</span>
      </div>

      <div class="user-area">
        <div class="user-meta">
          <div class="user-name">${escapeHtml(user.name)}</div>
          <div class="user-role">${escapeHtml(user.role.toUpperCase())}</div>
        </div>

        <div class="avatar">${escapeHtml(user.avatar)}</div>
        <button id="btnLogout" class="btn-ghost">LOGOUT</button>
      </div>
    </div>
  `;
}

function renderSidebar() {
  const items = [
    { id: "documents", icon: "◈", label: "DOCUMENTS" },
    { id: "dashboard", icon: "▦", label: "DASHBOARD" },
    ...(isAdmin() ? [{ id: "audit", icon: "◎", label: "AUDIT LOGS" }] : []),
    { id: "acknowledgments", icon: "◇", label: "MY ACKS" },
  ];

  return `
    <div class="sidebar-inner">
      ${items
        .map(
          (item) => `
          <button class="navbtn ${activeNav === item.id ? "active" : ""}" data-nav="${item.id}">
            <span class="navicon">${item.icon}</span>
            ${sidebarCollapsed ? "" : item.label}
          </button>
        `
        )
        .join("")}
    </div>

    ${
      sidebarCollapsed
        ? ""
        : `
        <div style="padding:0 16px; position:absolute; bottom:16px; width:168px;">
          <div class="secure-box">
            <div class="secure-title">⬢ SECURE SESSION</div>
            <div class="secure-sub">JWT · 30 min expiry<br/>RBAC Enforced</div>
          </div>
        </div>
      `
    }
  `;
}

function renderDashboard() {
  const s = stats();

  return `
    <div>
      <div style="margin-bottom:24px;">
        <h1 class="h1">SYSTEM DASHBOARD</h1>
        <div class="sub">Overview · ${formatToday()}</div>
      </div>

      <div class="grid4">
        ${s
          .map(
            (x) => `
          <div class="stat" style="border-top:3px solid ${x.color}">
            <div class="stat-value" style="color:${x.color}">${x.value}</div>
            <div class="stat-label">${x.label}</div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="grid2">
        <div class="panel">
          <div class="panel-title">DOCUMENTS BY DEPARTMENT</div>

          ${Object.entries(deptColors)
            .map(([dept, color]) => {
              const count = docs.filter((d) => d.dept === dept && d.status === "active").length;
              const width = Math.min(100, count * 30);
              return `
                <div style="margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:#9ca3af; font-size:11px;">${dept}</span>
                    <span style="color:var(--muted); font-size:11px;">${count}</span>
                  </div>
                  <div style="background:var(--border); height:3px;">
                    <div style="background:${color}; height:100%; width:${width}%; transition:width .5s;"></div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>

        <div class="panel">
          <div class="panel-title">RECENT ACTIVITY</div>

          ${AUDIT_LOGS.slice(0, 4)
            .map((log) => {
              const col = actionColors[log.action] || "#9ca3af";
              return `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--border);">
                  <span style="color:${col}; font-size:9px; letter-spacing:0.1em; min-width:60px; padding:2px 6px; background:${col}15; border:1px solid ${col}40;">
                    ${log.action}
                  </span>
                  <div style="flex:1;">
                    <div style="color:#9ca3af; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px;">
                      ${escapeHtml(log.doc)}
                    </div>
                    <div style="color:var(--muted); font-size:10px;">${escapeHtml(log.user)}</div>
                  </div>
                  <span style="color:var(--muted2); font-size:10px;">${escapeHtml(log.time)}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderDocuments() {
  const list = filteredDocs();

  return `
    <div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
        <div>
          <h1 class="h1">DOCUMENT LIBRARY</h1>
          <div class="sub">${list.length} DOCUMENTS</div>
        </div>

        ${
          isAdmin()
            ? `<button id="btnOpenUpload" class="btn-upload" style="flex:unset; padding:9px 18px;">+ UPLOAD DOCUMENT</button>`
            : ""
        }
      </div>

      <div class="filters">
        <input id="search" class="search" placeholder="Search documents or tags..." value="${escapeHtml(search)}" />

        <select id="filterDept" class="select">
          ${["All", ...Object.keys(deptColors)]
            .map((d) => `<option ${filterDept === d ? "selected" : ""}>${d}</option>`)
            .join("")}
        </select>

        <select id="filterType" class="select">
          ${["All", "Policy", "Security", "Compliance", "Guide", "Procedure"]
            .map((t) => `<option ${filterType === t ? "selected" : ""}>${t}</option>`)
            .join("")}
        </select>
      </div>

      <div class="table">
        <div class="thead">
          ${["", "TITLE / DEPARTMENT", "TYPE", "VERSION", "SIZE", "VIEWS", "DATE", ""]
            .map((h) => `<div class="th">${h}</div>`)
            .join("")}
        </div>

        ${list
          .map((doc) => {
            const icon = typeIcons[doc.type] || "◇";
            const dcol = deptColors[doc.dept] || "#6b7280";
            const selected = selectedDoc && selectedDoc.id === doc.id;

            return `
              <div class="trow ${selected ? "selected" : ""}" data-doc="${doc.id}">
                <div style="color:${dcol}; font-size:16px;">${icon}</div>

                <div>
                  <div class="doc-title">
                    ${escapeHtml(doc.title)}
                    ${
                      doc.requiresAck && !acknowledged.has(doc.id)
                        ? `<span style="color:var(--amber); font-size:9px; margin-left:8px; letter-spacing:0.1em;">● ACK REQ.</span>`
                        : ""
                    }
                  </div>
                  <div class="doc-dept" style="color:${dcol};">${doc.dept}</div>
                </div>

                <div class="small">${doc.type}</div>
                <div class="version">${doc.version}</div>
                <div class="small">${doc.size}</div>
                <div class="small">${doc.views}</div>
                <div class="small">${doc.date}</div>

                <div class="row-actions">
                  <button class="btn-mini" data-view="${doc.id}">VIEW</button>
                  ${
                    isAdmin()
                      ? `<button class="btn-mini-danger" data-archive="${doc.id}">⬡</button>`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .join("")}

        ${
          list.length === 0
            ? `<div style="padding:40px; text-align:center; color:var(--muted2); font-size:12px; letter-spacing:0.1em;">NO DOCUMENTS FOUND</div>`
            : ""
        }
      </div>

      ${selectedDoc ? renderDocDetail(selectedDoc) : ""}
    </div>
  `;
}

function renderDocDetail(doc) {
  const dcol = deptColors[doc.dept] || "#6b7280";

  return `
    <div class="doc-detail">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px;">
        <div>
          <div style="color:var(--text); font-size:14px; margin-bottom:4px;">${escapeHtml(doc.title)}</div>
          <div class="badges">
            <span class="badge" style="color:${dcol}; border:1px solid ${dcol}40; background:${dcol}10;">${doc.dept}</span>
            <span class="badge">${doc.type}</span>
            <span class="badge" style="color:var(--blue); border:1px solid #1e3a5f;">${doc.version}</span>
          </div>
        </div>
        <button class="icon-btn" id="btnCloseDoc">✕</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:16px;">
        ${infoCell("LAST UPDATED", doc.date)}
        ${infoCell("FILE SIZE", doc.size)}
        ${infoCell("TOTAL VIEWS", doc.views)}
      </div>

      <div style="margin-bottom:16px;">
        <div style="color:var(--muted2); font-size:9px; letter-spacing:0.12em; margin-bottom:8px;">TAGS</div>
        <div class="tags">
          ${doc.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-action" id="btnViewPdf">⬡ VIEW PDF</button>
        <button class="btn-action" id="btnDownload">↓ DOWNLOAD</button>

        ${
          doc.requiresAck && !acknowledged.has(doc.id)
            ? `<button class="btn-ack" id="btnAck">◇ ACKNOWLEDGE</button>`
            : ""
        }

        ${acknowledged.has(doc.id) ? `<span class="ack-ok">✓ ACKNOWLEDGED</span>` : ""}
      </div>
    </div>
  `;
}

function infoCell(k, v) {
  return `
    <div>
      <div style="color:var(--muted2); font-size:9px; letter-spacing:0.12em; margin-bottom:4px;">${k}</div>
      <div style="color:#9ca3af; font-size:13px;">${escapeHtml(String(v))}</div>
    </div>
  `;
}

function renderAudit() {
  return `
    <div>
      <div style="margin-bottom:24px;">
        <h1 class="h1">AUDIT LOGS</h1>
        <div class="sub">COMPLIANCE TRACKING · TODAY</div>
      </div>

      <div class="table">
        <div style="display:grid; grid-template-columns:80px 120px 1fr 80px 130px; padding:10px 16px; border-bottom:1px solid var(--border);">
          ${["ACTION", "USER", "DOCUMENT", "TIME", "IP ADDRESS"].map((h) => `<div class="th">${h}</div>`).join("")}
        </div>

        ${AUDIT_LOGS.map((log) => {
          const col = actionColors[log.action] || "#9ca3af";
          return `
            <div style="display:grid; grid-template-columns:80px 120px 1fr 80px 130px; padding:12px 16px; border-bottom:1px solid var(--border2); align-items:center;">
              <span style="color:${col}; font-size:9px; letter-spacing:0.1em; padding:2px 6px; background:${col}15; border:1px solid ${col}30; display:inline-block;">
                ${log.action}
              </span>
              <div style="color:#9ca3af; font-size:11px;">${escapeHtml(log.user)}</div>
              <div style="color:var(--muted); font-size:11px;">${escapeHtml(log.doc)}</div>
              <div style="color:var(--muted2); font-size:10px;">${escapeHtml(log.time)}</div>
              <div style="color:var(--muted2); font-size:10px; font-family:monospace;">${escapeHtml(log.ip)}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderAcks() {
  const ackDocs = docs.filter((d) => d.requiresAck);

  return `
    <div>
      <div style="margin-bottom:24px;">
        <h1 class="h1">MY ACKNOWLEDGMENTS</h1>
        <div class="sub">COMPLIANCE TRACKING FOR ${escapeHtml(user.name.toUpperCase())}</div>
      </div>

      <div class="table">
        ${ackDocs
          .map((doc) => {
            const icon = typeIcons[doc.type] || "◇";
            const dcol = deptColors[doc.dept] || "#6b7280";

            return `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:1px solid var(--border2);">
                <div style="display:flex; align-items:center; gap:14px;">
                  <span style="color:${dcol}; font-size:14px;">${icon}</span>
                  <div>
                    <div style="color:#d1d5db; font-size:12px; margin-bottom:3px;">${escapeHtml(doc.title)}</div>
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
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderUploadModal() {
  return `
    <div class="modal">
      <div class="modal-card">
        <div class="modal-top">
          <div class="modal-title">UPLOAD DOCUMENT</div>
          <button id="btnCloseUpload" class="icon-btn">✕</button>
        </div>

        ${
          uploadSuccess
            ? `
              <div class="success">
                <div class="success-check">✓</div>
                <div class="success-text">DOCUMENT UPLOADED SUCCESSFULLY</div>
              </div>
            `
            : `
              <div class="field" style="margin-bottom:16px;">
                <div class="label">DOCUMENT TITLE</div>
                <input id="uploadName" class="input" placeholder="e.g. Company Travel Policy" value="${escapeHtml(uploadName)}"/>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                <div>
                  <div class="label">DEPARTMENT</div>
                  <select id="uploadDept" class="select" style="width:100%;">
                    ${Object.keys(deptColors)
                      .map((d) => `<option ${uploadDept === d ? "selected" : ""}>${d}</option>`)
                      .join("")}
                  </select>
                </div>

                <div>
                  <div class="label">DOCUMENT TYPE</div>
                  <select id="uploadType" class="select" style="width:100%;">
                    ${["Policy", "Security", "Compliance", "Guide", "Procedure"]
                      .map((t) => `<option ${uploadType === t ? "selected" : ""}>${t}</option>`)
                      .join("")}
                  </select>
                </div>
              </div>

              <div class="dropzone">
                <div class="drop-main">⬡ DROP PDF HERE OR CLICK TO SELECT</div>
                <div class="drop-sub">PDF files only · Max 50MB</div>
              </div>

              <div class="btn-row">
                <button id="btnCancelUpload" class="btn-cancel">CANCEL</button>
                <button id="btnDoUpload" class="btn-upload">UPLOAD DOCUMENT →</button>
              </div>
            `
        }
      </div>
    </div>
  `;
}

// ======= EVENTS =======
function bindEvents() {
  // LOGIN
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", handleLogin);

    document.getElementById("email").addEventListener("input", (e) => (email = e.target.value));
    document.getElementById("password").addEventListener("input", (e) => (password = e.target.value));

    document.getElementById("email").addEventListener("keydown", (e) => e.key === "Enter" && handleLogin());
    document.getElementById("password").addEventListener("keydown", (e) => e.key === "Enter" && handleLogin());

    document.querySelectorAll("[data-demo]").forEach((row) => {
      row.addEventListener("click", () => {
        email = row.dataset.demo;
        password = "password123";
        render();
      });
    });
  }

  // APP
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) btnLogout.addEventListener("click", handleLogout);

  const btnSidebar = document.getElementById("btnSidebar");
  if (btnSidebar) btnSidebar.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    render();
  });

  // NAV
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeNav = btn.dataset.nav;
      selectedDoc = null;
      render();
    });
  });

  // DOCUMENTS FILTERS
  const searchInput = document.getElementById("search");
  if (searchInput) searchInput.addEventListener("input", (e) => {
    search = e.target.value;
    render();
  });

  const deptSel = document.getElementById("filterDept");
  if (deptSel) deptSel.addEventListener("change", (e) => {
    filterDept = e.target.value;
    render();
  });

  const typeSel = document.getElementById("filterType");
  if (typeSel) typeSel.addEventListener("change", (e) => {
    filterType = e.target.value;
    render();
  });

  // SELECT DOC
  document.querySelectorAll("[data-doc]").forEach((row) => {
    row.addEventListener("click", () => {
      const id = Number(row.dataset.doc);
      selectedDoc = docs.find((d) => d.id === id) || null;
      render();
    });
  });

  // VIEW BUTTONS
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      alert("Opening read-only PDF viewer...");
    });
  });

  // ARCHIVE BUTTONS
  document.querySelectorAll("[data-archive]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.archive);
      docs = docs.map((d) => (d.id === id ? { ...d, status: "archived" } : d));
      if (selectedDoc && selectedDoc.id === id) selectedDoc = null;
      render();
    });
  });

  // DOC DETAIL
  const btnCloseDoc = document.getElementById("btnCloseDoc");
  if (btnCloseDoc) btnCloseDoc.addEventListener("click", () => {
    selectedDoc = null;
    render();
  });

  const btnAck = document.getElementById("btnAck");
  if (btnAck && selectedDoc) btnAck.addEventListener("click", () => {
    acknowledged.add(selectedDoc.id);
    render();
  });

  const btnViewPdf = document.getElementById("btnViewPdf");
  if (btnViewPdf) btnViewPdf.addEventListener("click", () => alert("Opening PDF..."));

  const btnDownload = document.getElementById("btnDownload");
  if (btnDownload) btnDownload.addEventListener("click", () => alert("Downloading file..."));

  // ACK PAGE BUTTONS
  document.querySelectorAll("[data-ack]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.ack);
      acknowledged.add(id);
      render();
    });
  });

  // UPLOAD MODAL
  const btnOpenUpload = document.getElementById("btnOpenUpload");
  if (btnOpenUpload) btnOpenUpload.addEventListener("click", () => {
    uploadModal = true;
    uploadSuccess = false;
    render();
  });

  const btnCloseUpload = document.getElementById("btnCloseUpload");
  if (btnCloseUpload) btnCloseUpload.addEventListener("click", () => {
    uploadModal = false;
    render();
  });

  const btnCancelUpload = document.getElementById("btnCancelUpload");
  if (btnCancelUpload) btnCancelUpload.addEventListener("click", () => {
    uploadModal = false;
    render();
  });

  const uploadNameInput = document.getElementById("uploadName");
  if (uploadNameInput) uploadNameInput.addEventListener("input", (e) => {
    uploadName = e.target.value;
  });

  const uploadDeptSel = document.getElementById("uploadDept");
  if (uploadDeptSel) uploadDeptSel.addEventListener("change", (e) => {
    uploadDept = e.target.value;
  });

  const uploadTypeSel = document.getElementById("uploadType");
  if (uploadTypeSel) uploadTypeSel.addEventListener("change", (e) => {
    uploadType = e.target.value;
  });

  const btnDoUpload = document.getElementById("btnDoUpload");
  if (btnDoUpload) btnDoUpload.addEventListener("click", handleUpload);
}

// ======= SAFE HTML =======
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======= START =======
render();
