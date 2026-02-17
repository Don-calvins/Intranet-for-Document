import { useState, useEffect } from "react";

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

export default function IntranetPortal() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeNav, setActiveNav] = useState("documents");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadDept, setUploadDept] = useState("HR");
  const [uploadType, setUploadType] = useState("Policy");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [docs, setDocs] = useState(DOCUMENTS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAdmin = user?.role === "IT Admin" || user?.role === "HR Admin";

  const handleLogin = () => {
    const found = USERS[email];
    if (found && found.password === password) {
      setUser({ ...found, email });
      setScreen("app");
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("login");
    setEmail("");
    setPassword("");
    setActiveNav("documents");
  };

  const filteredDocs = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept === "All" || d.dept === filterDept;
    const matchType = filterType === "All" || d.type === filterType;
    return matchSearch && matchDept && matchType && d.status === "active";
  });

  const handleUpload = () => {
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
    setDocs(prev => [newDoc, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadModal(false);
      setUploadSuccess(false);
      setUploadName("");
    }, 1500);
  };

  // Login Screen
  if (screen === "login") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0b0d", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New', monospace", position: "relative", overflow: "hidden"
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />

        <div style={{ position: "relative", width: 420, zIndex: 1 }}>
          {/* Logo */}
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, background: "#1e3a5f", border: "2px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                ◈
              </div>
              <span style={{ color: "#e5e7eb", fontSize: 20, letterSpacing: "0.15em", fontWeight: "bold", textTransform: "uppercase" }}>INTRANET</span>
              <span style={{ color: "#3b82f6", fontSize: 10, letterSpacing: "0.2em", padding: "2px 6px", border: "1px solid #3b82f6", textTransform: "uppercase" }}>PORTAL</span>
            </div>
            <p style={{ color: "#4b5563", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Secure Document Management System</p>
          </div>

          {/* Login Card */}
          <div style={{ background: "#111318", border: "1px solid #1f2937", padding: "36px 40px" }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>EMAIL ADDRESS</div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="user@company.com"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", background: "#0a0b0d", border: "1px solid #1f2937", borderLeft: "3px solid #3b82f6",
                  color: "#e5e7eb", padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>PASSWORD</div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", background: "#0a0b0d", border: "1px solid #1f2937", borderLeft: "3px solid #3b82f6",
                  color: "#e5e7eb", padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            {loginError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 20, padding: "8px 12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>{loginError}</div>}
            <button onClick={handleLogin} style={{
              width: "100%", background: "#1e3a5f", border: "1px solid #3b82f6", color: "#93c5fd",
              padding: "12px", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
            }} onMouseEnter={e => e.target.style.background = "#2563eb"} onMouseLeave={e => e.target.style.background = "#1e3a5f"}>
              AUTHENTICATE →
            </button>
          </div>

          {/* Demo Accounts */}
          <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid #1f2937" }}>
            <div style={{ color: "#4b5563", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>DEMO ACCOUNTS</div>
            {[
              { label: "IT ADMIN", email: "admin@company.com", color: "#10b981" },
              { label: "HR ADMIN", email: "hr@company.com", color: "#f59e0b" },
              { label: "EMPLOYEE", email: "john.doe@company.com", color: "#60a5fa" },
            ].map(acc => (
              <div key={acc.email} onClick={() => { setEmail(acc.email); setPassword("password123"); }}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer", padding: "5px 8px" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ color: acc.color, fontSize: 10, letterSpacing: "0.12em", minWidth: 70 }}>{acc.label}</span>
                <span style={{ color: "#4b5563", fontSize: 10 }}>{acc.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // App Screen
  const stats = [
    { label: "TOTAL DOCS", value: docs.filter(d => d.status === "active").length, color: "#3b82f6" },
    { label: "DEPARTMENTS", value: [...new Set(docs.map(d => d.dept))].length, color: "#10b981" },
    { label: "PENDING ACKS", value: docs.filter(d => d.requiresAck && !acknowledged.has(d.id)).length, color: "#f59e0b" },
    { label: "ARCHIVED", value: docs.filter(d => d.status === "archived").length, color: "#6b7280" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0b0d", fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div style={{ background: "#111318", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", padding: "0 20px", height: 52, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <button onClick={() => setSidebarCollapsed(c => !c)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>☰</button>
          <div style={{ width: 24, height: 24, background: "#1e3a5f", border: "1px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>◈</div>
          <span style={{ color: "#e5e7eb", fontSize: 14, letterSpacing: "0.12em", fontWeight: "bold" }}>INTRANET</span>
          <span style={{ color: "#3b82f6", fontSize: 9, padding: "1px 5px", border: "1px solid #3b82f6", letterSpacing: "0.1em" }}>PORTAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#e5e7eb", fontSize: 12 }}>{user.name}</div>
            <div style={{ color: "#4b5563", fontSize: 10, letterSpacing: "0.1em" }}>{user.role.toUpperCase()}</div>
          </div>
          <div style={{ width: 32, height: 32, background: "#1e3a5f", border: "1px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#93c5fd", fontSize: 11, fontWeight: "bold" }}>
            {user.avatar}
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "1px solid #1f2937", color: "#4b5563", padding: "5px 12px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}
            onMouseEnter={e => e.target.style.color = "#e5e7eb"} onMouseLeave={e => e.target.style.color = "#4b5563"}>
            LOGOUT
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: sidebarCollapsed ? 52 : 200, background: "#0d0f14", borderRight: "1px solid #1f2937", flexShrink: 0, transition: "width 0.2s", overflow: "hidden" }}>
          <div style={{ padding: sidebarCollapsed ? "16px 8px" : "16px" }}>
            {[
              { id: "documents", icon: "◈", label: "DOCUMENTS" },
              { id: "dashboard", icon: "▦", label: "DASHBOARD" },
              ...(isAdmin ? [{ id: "audit", icon: "◎", label: "AUDIT LOGS" }] : []),
              { id: "acknowledgments", icon: "◇", label: "MY ACKS" },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", marginBottom: 2,
                background: activeNav === item.id ? "#1e2d42" : "none", border: activeNav === item.id ? "1px solid #2a3f5f" : "1px solid transparent",
                color: activeNav === item.id ? "#93c5fd" : "#4b5563", cursor: "pointer", fontFamily: "inherit",
                fontSize: 10, letterSpacing: "0.12em", textAlign: "left", whiteSpace: "nowrap"
              }}>
                <span style={{ fontSize: 14, minWidth: 18 }}>{item.icon}</span>
                {!sidebarCollapsed && item.label}
              </button>
            ))}
          </div>
          {!sidebarCollapsed && (
            <div style={{ padding: "0 16px", marginTop: "auto", paddingBottom: 16, position: "absolute", bottom: 0, width: 168 }}>
              <div style={{ padding: "10px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ color: "#10b981", fontSize: 10, letterSpacing: "0.1em", marginBottom: 4 }}>⬢ SECURE SESSION</div>
                <div style={{ color: "#4b5563", fontSize: 9, lineHeight: 1.5 }}>JWT · 30 min expiry<br />RBAC Enforced</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Dashboard */}
          {activeNav === "dashboard" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: "#e5e7eb", fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>SYSTEM DASHBOARD</h1>
                <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: "0.1em" }}>Overview · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {stats.map(s => (
                  <div key={s.label} style={{ background: "#111318", border: "1px solid #1f2937", padding: "16px 20px", borderTop: `3px solid ${s.color}` }}>
                    <div style={{ color: s.color, fontSize: 28, fontWeight: "bold", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: "#4b5563", fontSize: 10, letterSpacing: "0.12em", marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Dept Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#111318", border: "1px solid #1f2937", padding: "20px" }}>
                  <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>DOCUMENTS BY DEPARTMENT</div>
                  {Object.entries(deptColors).map(([dept, color]) => {
                    const count = docs.filter(d => d.dept === dept && d.status === "active").length;
                    const pct = Math.round((count / filteredDocs.length || 0) * 100);
                    return (
                      <div key={dept} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#9ca3af", fontSize: 11 }}>{dept}</span>
                          <span style={{ color: "#4b5563", fontSize: 11 }}>{count}</span>
                        </div>
                        <div style={{ background: "#1f2937", height: 3 }}>
                          <div style={{ background: color, height: "100%", width: `${count * 30}%`, maxWidth: "100%", transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: "#111318", border: "1px solid #1f2937", padding: "20px" }}>
                  <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>RECENT ACTIVITY</div>
                  {AUDIT_LOGS.slice(0, 4).map(log => (
                    <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1f2937" }}>
                      <span style={{ color: actionColors[log.action], fontSize: 9, letterSpacing: "0.1em", minWidth: 60, padding: "2px 6px", background: `${actionColors[log.action]}15`, border: `1px solid ${actionColors[log.action]}40` }}>{log.action}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#9ca3af", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{log.doc}</div>
                        <div style={{ color: "#4b5563", fontSize: 10 }}>{log.user}</div>
                      </div>
                      <span style={{ color: "#374151", fontSize: 10 }}>{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeNav === "documents" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ color: "#e5e7eb", fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>DOCUMENT LIBRARY</h1>
                  <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: "0.1em" }}>{filteredDocs.length} DOCUMENTS</div>
                </div>
                {isAdmin && (
                  <button onClick={() => setUploadModal(true)} style={{
                    background: "#1e3a5f", border: "1px solid #3b82f6", color: "#93c5fd",
                    padding: "9px 18px", fontSize: 10, letterSpacing: "0.12em", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase"
                  }}>
                    + UPLOAD DOCUMENT
                  </button>
                )}
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents or tags..."
                  style={{ flex: 1, background: "#111318", border: "1px solid #1f2937", borderLeft: "3px solid #3b82f6", color: "#e5e7eb", padding: "8px 14px", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ background: "#111318", border: "1px solid #1f2937", color: "#9ca3af", padding: "8px 14px", fontSize: 11, fontFamily: "inherit", outline: "none" }}>
                  <option>All</option>
                  {Object.keys(deptColors).map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: "#111318", border: "1px solid #1f2937", color: "#9ca3af", padding: "8px 14px", fontSize: 11, fontFamily: "inherit", outline: "none" }}>
                  <option>All</option>
                  {["Policy", "Security", "Compliance", "Guide", "Procedure"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Doc Table */}
              <div style={{ background: "#111318", border: "1px solid #1f2937" }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 70px 80px 100px 80px", padding: "10px 16px", borderBottom: "1px solid #1f2937" }}>
                  {["", "TITLE / DEPARTMENT", "TYPE", "VERSION", "SIZE", "VIEWS", "DATE", ""].map((h, i) => (
                    <div key={i} style={{ color: "#374151", fontSize: 9, letterSpacing: "0.12em" }}>{h}</div>
                  ))}
                </div>
                {filteredDocs.map((doc, idx) => (
                  <div key={doc.id} onClick={() => setSelectedDoc(doc)} style={{
                    display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 70px 80px 100px 80px",
                    padding: "12px 16px", borderBottom: "1px solid #161920", cursor: "pointer", alignItems: "center",
                    background: selectedDoc?.id === doc.id ? "#161d2b" : "transparent",
                    transition: "background 0.1s"
                  }}
                    onMouseEnter={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = "#131620"; }}
                    onMouseLeave={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ color: deptColors[doc.dept] || "#6b7280", fontSize: 16 }}>{typeIcons[doc.type] || "◇"}</div>
                    <div>
                      <div style={{ color: "#d1d5db", fontSize: 12, marginBottom: 3 }}>
                        {doc.title}
                        {doc.requiresAck && !acknowledged.has(doc.id) && <span style={{ color: "#f59e0b", fontSize: 9, marginLeft: 8, letterSpacing: "0.1em" }}>● ACK REQ.</span>}
                      </div>
                      <div style={{ color: deptColors[doc.dept] || "#6b7280", fontSize: 10, letterSpacing: "0.1em" }}>{doc.dept}</div>
                    </div>
                    <div style={{ color: "#4b5563", fontSize: 10, letterSpacing: "0.08em" }}>{doc.type}</div>
                    <div style={{ color: "#3b82f6", fontSize: 10, letterSpacing: "0.1em" }}>{doc.version}</div>
                    <div style={{ color: "#374151", fontSize: 10 }}>{doc.size}</div>
                    <div style={{ color: "#374151", fontSize: 10 }}>{doc.views}</div>
                    <div style={{ color: "#374151", fontSize: 10 }}>{doc.date}</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={e => { e.stopPropagation(); alert("Opening read-only PDF viewer..."); }} style={{ background: "none", border: "1px solid #1f2937", color: "#4b5563", padding: "3px 8px", fontSize: 9, cursor: "pointer", fontFamily: "inherit" }}>VIEW</button>
                      {isAdmin && <button onClick={e => { e.stopPropagation(); setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "archived" } : d)); }} style={{ background: "none", border: "1px solid #2a1515", color: "#6b3030", padding: "3px 6px", fontSize: 9, cursor: "pointer", fontFamily: "inherit" }}>⬡</button>}
                    </div>
                  </div>
                ))}
                {filteredDocs.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: "#374151", fontSize: 12, letterSpacing: "0.1em" }}>NO DOCUMENTS FOUND</div>
                )}
              </div>

              {/* Doc Detail Panel */}
              {selectedDoc && (
                <div style={{ marginTop: 16, background: "#111318", border: "1px solid #1f2937", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ color: "#e5e7eb", fontSize: 14, marginBottom: 4 }}>{selectedDoc.title}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ color: deptColors[selectedDoc.dept], fontSize: 10, padding: "2px 8px", border: `1px solid ${deptColors[selectedDoc.dept]}40`, background: `${deptColors[selectedDoc.dept]}10` }}>{selectedDoc.dept}</span>
                        <span style={{ color: "#4b5563", fontSize: 10, padding: "2px 8px", border: "1px solid #1f2937" }}>{selectedDoc.type}</span>
                        <span style={{ color: "#3b82f6", fontSize: 10, padding: "2px 8px", border: "1px solid #1e3a5f" }}>{selectedDoc.version}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>✕</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {[["LAST UPDATED", selectedDoc.date], ["FILE SIZE", selectedDoc.size], ["TOTAL VIEWS", selectedDoc.views]].map(([k, v]) => (
                      <div key={k}><div style={{ color: "#374151", fontSize: 9, letterSpacing: "0.12em", marginBottom: 4 }}>{k}</div><div style={{ color: "#9ca3af", fontSize: 13 }}>{v}</div></div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: "#374151", fontSize: 9, letterSpacing: "0.12em", marginBottom: 8 }}>TAGS</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {selectedDoc.tags.map(t => <span key={t} style={{ color: "#4b5563", fontSize: 10, padding: "2px 8px", border: "1px solid #1f2937", letterSpacing: "0.08em" }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "#0a1628", border: "1px solid #1e3a5f", color: "#60a5fa", padding: "8px 16px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}>⬡ VIEW PDF</button>
                    <button style={{ background: "#0a1628", border: "1px solid #1e3a5f", color: "#60a5fa", padding: "8px 16px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}>↓ DOWNLOAD</button>
                    {selectedDoc.requiresAck && !acknowledged.has(selectedDoc.id) && (
                      <button onClick={() => setAcknowledged(prev => new Set([...prev, selectedDoc.id]))}
                        style={{ background: "#1a2a12", border: "1px solid #4ade80", color: "#4ade80", padding: "8px 16px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}>
                        ◇ ACKNOWLEDGE
                      </button>
                    )}
                    {acknowledged.has(selectedDoc.id) && <span style={{ color: "#4ade80", fontSize: 10, padding: "8px 0", letterSpacing: "0.1em" }}>✓ ACKNOWLEDGED</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs */}
          {activeNav === "audit" && isAdmin && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: "#e5e7eb", fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>AUDIT LOGS</h1>
                <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: "0.1em" }}>COMPLIANCE TRACKING · TODAY</div>
              </div>
              <div style={{ background: "#111318", border: "1px solid #1f2937" }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 120px 1fr 80px 130px", padding: "10px 16px", borderBottom: "1px solid #1f2937" }}>
                  {["ACTION", "USER", "DOCUMENT", "TIME", "IP ADDRESS"].map(h => <div key={h} style={{ color: "#374151", fontSize: 9, letterSpacing: "0.12em" }}>{h}</div>)}
                </div>
                {AUDIT_LOGS.map(log => (
                  <div key={log.id} style={{ display: "grid", gridTemplateColumns: "80px 120px 1fr 80px 130px", padding: "12px 16px", borderBottom: "1px solid #161920", alignItems: "center" }}>
                    <span style={{ color: actionColors[log.action], fontSize: 9, letterSpacing: "0.1em", padding: "2px 6px", background: `${actionColors[log.action]}15`, border: `1px solid ${actionColors[log.action]}30`, display: "inline-block" }}>{log.action}</span>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>{log.user}</div>
                    <div style={{ color: "#4b5563", fontSize: 11 }}>{log.doc}</div>
                    <div style={{ color: "#374151", fontSize: 10 }}>{log.time}</div>
                    <div style={{ color: "#374151", fontSize: 10, fontFamily: "monospace" }}>{log.ip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acknowledgments */}
          {activeNav === "acknowledgments" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ color: "#e5e7eb", fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 4px" }}>MY ACKNOWLEDGMENTS</h1>
                <div style={{ color: "#4b5563", fontSize: 11, letterSpacing: "0.1em" }}>COMPLIANCE TRACKING FOR {user.name.toUpperCase()}</div>
              </div>
              <div style={{ background: "#111318", border: "1px solid #1f2937" }}>
                {docs.filter(d => d.requiresAck).map(doc => (
                  <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #161920" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ color: deptColors[doc.dept] || "#6b7280", fontSize: 14 }}>{typeIcons[doc.type] || "◇"}</span>
                      <div>
                        <div style={{ color: "#d1d5db", fontSize: 12, marginBottom: 3 }}>{doc.title}</div>
                        <div style={{ color: "#374151", fontSize: 10 }}>{doc.dept} · {doc.version}</div>
                      </div>
                    </div>
                    {acknowledged.has(doc.id) ? (
                      <div style={{ color: "#4ade80", fontSize: 10, letterSpacing: "0.1em" }}>✓ ACKNOWLEDGED</div>
                    ) : (
                      <button onClick={() => setAcknowledged(prev => new Set([...prev, doc.id]))}
                        style={{ background: "#1a2a12", border: "1px solid #4ade80", color: "#4ade80", padding: "7px 14px", fontSize: 9, letterSpacing: "0.12em", cursor: "pointer", fontFamily: "inherit" }}>
                        ACKNOWLEDGE ◇
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111318", border: "1px solid #1f2937", width: 460, padding: "28px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ color: "#e5e7eb", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase" }}>UPLOAD DOCUMENT</div>
              <button onClick={() => setUploadModal(false)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {uploadSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ color: "#4ade80", fontSize: 24, marginBottom: 8 }}>✓</div>
                <div style={{ color: "#4ade80", fontSize: 12, letterSpacing: "0.12em" }}>DOCUMENT UPLOADED SUCCESSFULLY</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>DOCUMENT TITLE</div>
                  <input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="e.g. Company Travel Policy"
                    style={{ width: "100%", background: "#0a0b0d", border: "1px solid #1f2937", borderLeft: "3px solid #3b82f6", color: "#e5e7eb", padding: "9px 13px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>DEPARTMENT</div>
                    <select value={uploadDept} onChange={e => setUploadDept(e.target.value)} style={{ width: "100%", background: "#0a0b0d", border: "1px solid #1f2937", color: "#9ca3af", padding: "9px 13px", fontSize: 11, fontFamily: "inherit", outline: "none" }}>
                      {Object.keys(deptColors).map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.12em", marginBottom: 8 }}>DOCUMENT TYPE</div>
                    <select value={uploadType} onChange={e => setUploadType(e.target.value)} style={{ width: "100%", background: "#0a0b0d", border: "1px solid #1f2937", color: "#9ca3af", padding: "9px 13px", fontSize: 11, fontFamily: "inherit", outline: "none" }}>
                      {["Policy", "Security", "Compliance", "Guide", "Procedure"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 20, padding: "16px", background: "#0d0f14", border: "1px dashed #1f2937", textAlign: "center" }}>
                  <div style={{ color: "#374151", fontSize: 11, letterSpacing: "0.1em" }}>⬡ DROP PDF HERE OR CLICK TO SELECT</div>
                  <div style={{ color: "#1f2937", fontSize: 10, marginTop: 4 }}>PDF files only · Max 50MB</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setUploadModal(false)} style={{ flex: 1, background: "none", border: "1px solid #1f2937", color: "#4b5563", padding: "10px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}>CANCEL</button>
                  <button onClick={handleUpload} style={{ flex: 2, background: "#1e3a5f", border: "1px solid #3b82f6", color: "#93c5fd", padding: "10px", fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit" }}>UPLOAD DOCUMENT →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
