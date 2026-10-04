// ===== Landing page: program explorer + pathway finder =====
(function () {
  const programs = window.ALO_PROGRAMS;
  const cats = window.ALO_CATEGORIES;
  const state = { cat: "all", q: "", free: false, phone: false, earn: false, finderIds: null };
  let savedIds = new Set();
  let currentUser = null;

  const listEl = document.getElementById("program-list");
  const tabsEl = document.getElementById("tabs");
  const subEl = document.getElementById("explore-sub");
  const resetBtn = document.getElementById("flt-reset");
  const defaultSub = subEl.textContent;

  // ---- Tabs ----
  const tabDefs = [["all", "All"], ...Object.entries(cats)];
  tabsEl.innerHTML = tabDefs.map(([key, label]) =>
    `<button class="tab" role="tab" data-cat="${key}" aria-selected="${key === "all"}">${label}</button>`).join("");
  tabsEl.addEventListener("click", e => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    tabsEl.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t === btn));
    render();
  });

  // ---- Filters ----
  document.getElementById("search").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); render(); });
  document.getElementById("flt-free").addEventListener("change", e => { state.free = e.target.checked; render(); });
  document.getElementById("flt-phone").addEventListener("change", e => { state.phone = e.target.checked; render(); });
  document.getElementById("flt-earn").addEventListener("change", e => { state.earn = e.target.checked; render(); });
  resetBtn.addEventListener("click", () => {
    state.finderIds = null; resetBtn.hidden = true; subEl.textContent = defaultSub; render();
  });

  function visible(p) {
    if (state.finderIds && !state.finderIds.includes(p.id)) return false;
    if (state.cat !== "all" && p.cat !== state.cat) return false;
    if (state.free && !(p.cost === "free" || p.cost === "stipend")) return false;
    if (state.phone && !(p.device === "phone" || p.device === "none" || p.device === "provided")) return false;
    if (state.earn && !p.earnSoon) return false;
    if (state.q) {
      const hay = (p.title + " " + p.provider + " " + p.summary).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  }

  function tagsFor(p) {
    const t = [`<span class="tag">${escapeHtml(cats[p.cat])}</span>`];
    if (p.cost === "free" || p.cost === "stipend") t.push(`<span class="tag tag-green">${escapeHtml(p.costText)}</span>`);
    else t.push(`<span class="tag">${escapeHtml(p.costText)}</span>`);
    t.push(`<span class="tag">${escapeHtml(p.duration)}</span>`);
    if (p.device === "phone") t.push(`<span class="tag tag-pink">Phone is enough</span>`);
    if (p.device === "provided") t.push(`<span class="tag tag-pink">Device provided</span>`);
    if (p.earnSoon) t.push(`<span class="tag tag-pink">Earn sooner</span>`);
    return t.join("");
  }

  function render() {
    let items = programs.filter(visible);
    if (state.finderIds) items.sort((a, b) => state.finderIds.indexOf(a.id) - state.finderIds.indexOf(b.id));
    if (!items.length) {
      listEl.innerHTML = `<div class="empty"><p><strong>No programs match these filters.</strong></p><p class="muted" style="margin:0 auto">Turn off a filter or try a shorter search word.</p></div>`;
      return;
    }
    listEl.innerHTML = items.map(p => {
      const saved = savedIds.has(p.id);
      return `<article class="program">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="provider">${escapeHtml(p.provider)}</p>
        <div class="tags">${tagsFor(p)}</div>
        <p class="summary">${escapeHtml(p.summary)}</p>
        <p class="small muted" style="margin:0">${escapeHtml(p.mode)}${p.minGpa ? ` · Usual minimum GPA ${p.minGpa}` : ""}</p>
        <div class="program-actions">
          <button class="btn ${saved ? "btn-soft" : "btn-primary"} btn-sm" data-save="${p.id}" ${saved ? "disabled" : ""}>${saved ? "Saved" : "I'm interested"}</button>
          ${p.link ? `<a class="btn btn-outline btn-sm" href="${p.link}" target="_blank" rel="noopener">Official site</a>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  // ---- Save interest ----
  listEl.addEventListener("click", async e => {
    const btn = e.target.closest("[data-save]");
    if (!btn) return;
    const id = btn.dataset.save;
    if (!window.ALO_READY) { toast("Saving needs the database set up. See README."); return; }
    if (!currentUser) {
      localStorage.setItem("alo_pending_interest", id);
      window.location.href = "auth.html?next=dashboard";
      return;
    }
    btn.disabled = true;
    const { error } = await sb.from("interests").insert({ user_id: currentUser.id, program_id: id });
    if (error && !String(error.message).includes("duplicate")) { btn.disabled = false; toast("Couldn't save. Check your connection and try again."); return; }
    savedIds.add(id);
    toast("Saved. A counsellor can now help you with this program.");
    render();
  });

  // ---- Pathway finder ----
  document.getElementById("finder").addEventListener("submit", e => {
    e.preventDefault();
    const gpa = parseFloat(document.getElementById("f-gpa").value);
    const group = document.getElementById("f-group").value;
    const needIncome = document.querySelector('input[name="income"]:checked').value === "yes";
    const phoneOnly = document.querySelector('input[name="device"]:checked').value === "phone";
    const canMove = document.querySelector('input[name="move"]:checked').value === "yes";

    const scored = programs.filter(p => {
      if (p.minGpa && !isNaN(gpa) && gpa < p.minGpa) return false;
      if (!p.groups.includes("any") && !p.groups.includes(group)) return false;
      if (phoneOnly && p.device === "laptop") return false;
      return true;
    }).map(p => {
      let s = 0;
      if (p.cost === "free" || p.cost === "stipend") s += 3;
      if (p.cost === "low") s += 2;
      if (needIncome && p.earnSoon) s += 4;
      if (!needIncome && (p.cat === "university" || p.cat === "scholarship")) s += 3;
      if (!canMove && p.relocate) s -= 4;
      if (!canMove && !p.relocate) s += 1;
      if (p.minGpa && !isNaN(gpa) && gpa >= p.minGpa) s += 1;
      return { id: p.id, s };
    }).sort((a, b) => b.s - a.s).slice(0, 9);

    state.finderIds = scored.map(x => x.id);
    state.cat = "all";
    tabsEl.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.cat === "all"));
    resetBtn.hidden = false;
    subEl.textContent = `Your ${scored.length} best matches, most suitable first. Save the ones you like so a counsellor can help.`;
    render();
    document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
  });

  // ---- Load saved interests for signed-in users ----
  (async function init() {
    render();
    if (!window.ALO_READY) return;
    currentUser = await getSessionUser();
    if (!currentUser) return;
    const { data } = await sb.from("interests").select("program_id").eq("user_id", currentUser.id);
    savedIds = new Set((data || []).map(r => r.program_id));
    render();
  })();
})();
