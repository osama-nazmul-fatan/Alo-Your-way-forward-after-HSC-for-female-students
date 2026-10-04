// ===== Admin panel: users, interests, chat =====
(async function () {
  if (!window.ALO_READY) { window.location.href = "auth.html"; return; }
  const me = await getSessionUser();
  if (!me) { window.location.href = "auth.html"; return; }
  const myProfile = await getMyProfile(me.id);
  if (!myProfile || !myProfile.is_admin) { window.location.href = "dashboard.html"; return; }
  document.getElementById("signout").addEventListener("click", e => { e.preventDefault(); signOut(); });

  const $ = id => document.getElementById(id);
  let users = [], interests = [], unread = {};   // unread[userId] = count
  let activeId = null;
  const seen = new Set();
  const statuses = [["new", "New"], ["contacted", "Contacted"], ["applied", "Applied"], ["enrolled", "Enrolled"]];

  // Program filter options
  $("u-program").innerHTML += ALO_PROGRAMS.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join("");

  async function loadAll() {
    const [u, i, m] = await Promise.all([
      sb.from("profiles").select("*").eq("is_admin", false).order("created_at", { ascending: false }),
      sb.from("interests").select("*"),
      sb.from("messages").select("user_id, sender_id").eq("is_read", false)
    ]);
    if (u.error) { $("user-rows").innerHTML = `<tr><td colspan="5">Couldn't load users: ${escapeHtml(u.error.message)}</td></tr>`; return; }
    users = u.data; interests = i.data || [];
    unread = {};
    (m.data || []).forEach(r => { if (r.sender_id === r.user_id) unread[r.user_id] = (unread[r.user_id] || 0) + 1; });
    renderStats(); renderUsers(); renderByProgram();
    if (activeId) renderDetailInfo();
  }

  function renderStats() {
    const weekAgo = Date.now() - 7 * 864e5;
    $("st-users").textContent = users.length;
    $("st-interests").textContent = interests.length;
    $("st-unread").textContent = Object.values(unread).reduce((a, b) => a + b, 0);
    $("st-new").textContent = users.filter(u => new Date(u.created_at).getTime() > weekAgo).length;
  }

  function filteredUsers() {
    const q = $("u-search").value.trim().toLowerCase();
    const prog = $("u-program").value;
    const onlyUnread = $("u-unread").checked;
    return users.filter(u => {
      if (q && !`${u.full_name} ${u.phone} ${u.district} ${u.email}`.toLowerCase().includes(q)) return false;
      if (prog && !interests.some(i => i.user_id === u.id && i.program_id === prog)) return false;
      if (onlyUnread && !unread[u.id]) return false;
      return true;
    });
  }

  function renderUsers() {
    const rows = filteredUsers();
    if (!rows.length) { $("user-rows").innerHTML = `<tr><td colspan="5" class="muted">No users match. Clear the search or filters.</td></tr>`; return; }
    $("user-rows").innerHTML = rows.map(u => {
      const count = interests.filter(i => i.user_id === u.id).length;
      const badge = unread[u.id] ? ` <span class="badge" title="Unread messages">${unread[u.id]}</span>` : "";
      return `<tr class="user-row ${u.id === activeId ? "active" : ""}" data-id="${u.id}" tabindex="0">
        <td><strong>${escapeHtml(u.full_name || "No name")}</strong>${badge}<br><span class="small muted">${escapeHtml(u.phone || u.email || "")}</span></td>
        <td>${escapeHtml(u.district || "–")}</td>
        <td>${u.gpa ?? "–"}</td>
        <td>${count}</td>
        <td class="small">${new Date(u.created_at).toLocaleDateString()}</td></tr>`;
    }).join("");
  }

  function renderByProgram() {
    const rows = ALO_PROGRAMS.map(p => {
      const ids = interests.filter(i => i.program_id === p.id).map(i => i.user_id);
      const names = ids.map(id => (users.find(u => u.id === id) || {}).full_name).filter(Boolean);
      return { p, count: ids.length, names };
    }).filter(r => r.count).sort((a, b) => b.count - a.count);
    $("program-rows").innerHTML = rows.length ? rows.map(r =>
      `<tr><td><strong>${escapeHtml(r.p.title)}</strong></td><td>${escapeHtml(ALO_CATEGORIES[r.p.cat])}</td><td>${r.count}</td><td class="small">${escapeHtml(r.names.join(", "))}</td></tr>`).join("")
      : `<tr><td colspan="4" class="muted">No programs saved yet.</td></tr>`;
  }

  ["u-search", "u-program", "u-unread"].forEach(id => $(id).addEventListener("input", renderUsers));
  $("user-rows").addEventListener("click", e => { const r = e.target.closest(".user-row"); if (r) openUser(r.dataset.id); });
  $("user-rows").addEventListener("keydown", e => { const r = e.target.closest(".user-row"); if (r && e.key === "Enter") openUser(r.dataset.id); });

  // ---- Detail panel ----
  function renderDetailInfo() {
    const u = users.find(x => x.id === activeId);
    if (!u) return;
    $("detail-title").textContent = u.full_name || "No name";
    const yes = v => v ? "Yes" : "No";
    const info = [["Email", u.email], ["Mobile", u.phone], ["District", u.district], ["HSC year", u.hsc_year], ["HSC group", u.hsc_group],
      ["GPA", u.gpa], ["Needs income soon", yes(u.needs_income)], ["Has a computer", yes(u.has_computer)], ["Joined", new Date(u.created_at).toLocaleDateString()]];
    $("detail-info").innerHTML = info.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v ?? "–")}</dd>`).join("");
    const mine = interests.filter(i => i.user_id === u.id);
    $("detail-interests").innerHTML = mine.length ? mine.map(i => {
      const p = findProgram(i.program_id);
      const opts = statuses.map(([v, l]) => `<option value="${v}" ${v === i.status ? "selected" : ""}>${l}</option>`).join("");
      return `<tr><td>${escapeHtml(p ? p.title : i.program_id)}</td><td><select class="status-select" data-interest="${i.id}" aria-label="Status">${opts}</select></td></tr>`;
    }).join("") : `<tr><td colspan="2" class="muted">No programs saved yet.</td></tr>`;
  }

  $("detail-interests").addEventListener("change", async e => {
    const s = e.target.closest("[data-interest]");
    if (!s) return;
    const { error } = await sb.from("interests").update({ status: s.value }).eq("id", s.dataset.interest);
    if (error) return toast("Couldn't update status: " + error.message);
    const row = interests.find(i => String(i.id) === s.dataset.interest); if (row) row.status = s.value;
    toast("Status updated.");
  });

  function addMessage(m) {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    const fromUser = m.sender_id === m.user_id;
    const div = document.createElement("div");
    div.className = "msg " + (fromUser ? "them" : "me");
    const u = users.find(x => x.id === m.user_id);
    div.innerHTML = `${escapeHtml(m.body)}<time>${fromUser ? escapeHtml((u && u.full_name) || "User") : "Counsellor"} · ${formatTime(m.created_at)}</time>`;
    $("chat-log").appendChild(div);
    $("chat-log").scrollTop = $("chat-log").scrollHeight;
  }

  async function openUser(id) {
    activeId = id;
    $("detail-empty").hidden = true;
    $("detail-body").hidden = false;
    renderDetailInfo(); renderUsers();
    $("chat-log").innerHTML = ""; seen.clear();
    const { data } = await sb.from("messages").select("*").eq("user_id", id).order("created_at");
    if (!data || !data.length) $("chat-log").innerHTML = `<p class="small muted" style="margin:auto;text-align:center">No messages yet. You can start the conversation.</p>`;
    else data.forEach(addMessage);
    if (unread[id]) {
      await sb.from("messages").update({ is_read: true }).eq("user_id", id).eq("sender_id", id).eq("is_read", false);
      delete unread[id]; renderStats(); renderUsers();
    }
    if (window.innerWidth < 980) $("detail").scrollIntoView({ behavior: "smooth" });
  }

  $("chat-form").addEventListener("submit", async e => {
    e.preventDefault();
    const input = $("chat-input"), body = input.value.trim();
    if (!body || !activeId) return;
    input.value = "";
    const { data, error } = await sb.from("messages").insert({ user_id: activeId, sender_id: me.id, body }).select().single();
    if (error) { input.value = body; return toast("Message not sent: " + error.message); }
    const intro = $("chat-log").querySelector("p"); if (intro) intro.remove();
    addMessage(data);
  });

  // ---- Live updates for all conversations ----
  sb.channel("admin-chat")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async payload => {
      const m = payload.new;
      if (m.user_id === activeId) {
        const intro = $("chat-log").querySelector("p"); if (intro) intro.remove();
        addMessage(m);
        if (m.sender_id === m.user_id) await sb.from("messages").update({ is_read: true }).eq("id", m.id);
      } else if (m.sender_id === m.user_id) {
        unread[m.user_id] = (unread[m.user_id] || 0) + 1;
        if (!users.some(u => u.id === m.user_id)) await loadAll();
        renderStats(); renderUsers();
        const u = users.find(x => x.id === m.user_id);
        toast(`New message from ${(u && u.full_name) || "a user"}.`);
      }
    })
    .subscribe();

  // ---- CSV export ----
  $("export").addEventListener("click", () => {
    const head = ["Name", "Email", "Mobile", "District", "HSC year", "HSC group", "GPA", "Needs income", "Has computer", "Saved programs", "Joined"];
    const rows = users.map(u => [u.full_name, u.email, u.phone, u.district, u.hsc_year, u.hsc_group, u.gpa, u.needs_income ? "Yes" : "No", u.has_computer ? "Yes" : "No",
      interests.filter(i => i.user_id === u.id).map(i => (findProgram(i.program_id) || {}).title || i.program_id).join("; "),
      new Date(u.created_at).toISOString().slice(0, 10)]);
    const csv = [head, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    a.download = `alo-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  });

  loadAll();
})();
