// ===== Shared helpers for every page =====
(function () {
  const cfg = window.ALO_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-PROJECT-ID");
  window.ALO_READY = configured;
  window.sb = configured && window.supabase
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;
})();

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function toast(text) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2800);
}

function showFormMsg(el, text, type) {
  el.textContent = text;
  el.className = "form-msg show " + (type || "error");
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

async function getSessionUser() {
  if (!window.sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session ? data.session.user : null;
}

async function getMyProfile(userId) {
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data;
}

async function signOut() {
  if (window.sb) await sb.auth.signOut();
  window.location.href = "index.html";
}

// Quick exit: leaves the site and replaces this page in the tab's history
function quickExit() {
  window.location.replace("https://www.google.com/search?q=weather+dhaka");
}

document.addEventListener("keydown", e => { if (e.key === "Escape" && e.shiftKey) quickExit(); });

// Mobile nav + account link
document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
    }));
  }
  document.querySelectorAll("[data-quick-exit]").forEach(b => b.addEventListener("click", quickExit));

  const accountLink = document.querySelector("[data-account-link]");
  if (accountLink && window.sb) {
    const user = await getSessionUser();
    if (user) {
      const profile = await getMyProfile(user.id);
      if (profile && profile.is_admin) { accountLink.textContent = "Admin panel"; accountLink.href = "admin.html"; }
      else { accountLink.textContent = "My dashboard"; accountLink.href = "dashboard.html"; }
    }
  }
});
