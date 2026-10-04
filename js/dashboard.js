// ===== User dashboard: saved programs, profile, counsellor chat =====
(async function () {
  if (!window.ALO_READY) { window.location.href = "auth.html"; return; }
  const user = await getSessionUser();
  if (!user) { window.location.href = "auth.html"; return; }
  const profile = await getMyProfile(user.id);
  if (profile && profile.is_admin) { window.location.href = "admin.html"; return; }

  document.getElementById("signout").addEventListener("click", e => { e.preventDefault(); signOut(); });
  if (profile && profile.full_name) document.getElementById("hello").textContent = "Hello, " + profile.full_name.split(" ")[0];

  // ---- Save an interest chosen before signing in ----
  const pending = localStorage.getItem("alo_pending_interest");
  if (pending) {
    localStorage.removeItem("alo_pending_interest");
    await sb.from("interests").insert({ user_id: user.id, program_id: pending });
  }

  // ---- Saved programs ----
  const statusText = { new: "Saved", contacted: "Counsellor in touch", applied: "Applied", enrolled: "Enrolled" };
  const savedList = document.getElementById("saved-list");
  async function loadSaved() {
    const { data, error } = await sb.from("interests").select("id, program_id, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) { savedList.innerHTML = `<li class="muted">Couldn't load your programs. Refresh the page to try again.</li>`; return; }
    if (!data.length) {
      savedList.innerHTML = `<li><span class="muted">You haven't saved any programs yet.</span><a class="btn btn-soft btn-sm" href="index.html#explore">Browse programs</a></li>`;
      return;
    }
    savedList.innerHTML = data.map(r => {
      const p = findProgram(r.program_id);
      const title = p ? p.title : r.program_id;
      return `<li><div><strong>${escapeHtml(title)}</strong><br><span class="small muted">${escapeHtml(statusText[r.status] || r.status)}</span></div>
        <button class="btn btn-outline btn-sm" data-remove="${r.id}">Remove</button></li>`;
    }).join("");
  }
  savedList.addEventListener("click", async e => {
    const b = e.target.closest("[data-remove]");
    if (!b) return;
    b.disabled = true;
    await sb.from("interests").delete().eq("id", b.dataset.remove);
    toast("Removed from your list.");
    loadSaved();
  });
  loadSaved();

  // ---- Profile ----
  const f = id => document.getElementById(id);
  if (profile) {
    f("p-name").value = profile.full_name || "";
    f("p-phone").value = profile.phone || "";
    f("p-district").value = profile.district || "";
    f("p-year").value = profile.hsc_year || "";
    f("p-group").value = profile.hsc_group || "";
    f("p-gpa").value = profile.gpa || "";
    f("p-income").checked = !!profile.needs_income;
    f("p-computer").checked = !!profile.has_computer;
  }
  f("profile-form").addEventListener("submit", async e => {
    e.preventDefault();
    const gpa = f("p-gpa").value ? parseFloat(f("p-gpa").value) : null;
    if (gpa !== null && (gpa < 1 || gpa > 5)) return showFormMsg(f("profile-msg"), "GPA must be between 1.00 and 5.00.");
    const { error } = await sb.from("profiles").update({
      full_name: f("p-name").value.trim(),
      phone: f("p-phone").value.trim(),
      district: f("p-district").value.trim(),
      hsc_year: f("p-year").value ? parseInt(f("p-year").value, 10) : null,
      hsc_group: f("p-group").value || null,
      gpa,
      needs_income: f("p-income").checked,
      has_computer: f("p-computer").checked
    }).eq("id", user.id);
    if (error) return showFormMsg(f("profile-msg"), "Couldn't save your details: " + error.message);
    showFormMsg(f("profile-msg"), "Your details are saved.", "ok");
  });

  // ---- Chat ----
  const log = f("chat-log");
  const seen = new Set();
  function addMessage(m) {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    const mine = m.sender_id === user.id;
    const div = document.createElement("div");
    div.className = "msg " + (mine ? "me" : "them");
    div.innerHTML = `${escapeHtml(m.body)}<time>${mine ? "You" : "Counsellor"} · ${formatTime(m.created_at)}</time>`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
  async function markRead() {
    await sb.from("messages").update({ is_read: true }).eq("user_id", user.id).neq("sender_id", user.id).eq("is_read", false);
  }
  const { data: history } = await sb.from("messages").select("*").eq("user_id", user.id).order("created_at");
  if (!history || !history.length) {
    log.innerHTML = `<p class="small muted" style="margin:auto;text-align:center">Send your first question. For example: "I got GPA 4.2 in humanities. Which free options can I apply for?"</p>`;
  } else {
    history.forEach(addMessage);
    markRead();
  }

  sb.channel("my-chat")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `user_id=eq.${user.id}` }, payload => {
      const intro = log.querySelector("p"); if (intro) intro.remove();
      addMessage(payload.new);
      if (payload.new.sender_id !== user.id) { markRead(); toast("New reply from your counsellor."); }
    })
    .subscribe();

  f("chat-form").addEventListener("submit", async e => {
    e.preventDefault();
    const input = f("chat-input");
    const body = input.value.trim();
    if (!body) return;
    input.value = "";
    const { data, error } = await sb.from("messages").insert({ user_id: user.id, sender_id: user.id, body }).select().single();
    if (error) { input.value = body; toast("Message not sent. Check your connection and try again."); return; }
    const intro = log.querySelector("p"); if (intro) intro.remove();
    addMessage(data);
  });
})();
