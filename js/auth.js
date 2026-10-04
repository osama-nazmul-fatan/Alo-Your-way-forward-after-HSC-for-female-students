// ===== Sign in / create account =====
(function () {
  const msg = document.getElementById("msg");
  const forms = { signin: document.getElementById("signin-form"), signup: document.getElementById("signup-form"), reset: document.getElementById("reset-form") };
  const tabs = document.getElementById("auth-tabs");

  function setMode(mode) {
    Object.entries(forms).forEach(([k, f]) => { f.hidden = k !== mode; });
    tabs.hidden = mode === "reset";
    tabs.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.mode === mode));
    msg.className = "form-msg";
  }
  tabs.addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) setMode(t.dataset.mode); });
  if (new URLSearchParams(location.search).get("mode") === "signup") setMode("signup");

  if (!window.ALO_READY) {
    document.getElementById("setup-notice").hidden = false;
    document.querySelectorAll("form button").forEach(b => b.disabled = true);
    return;
  }

  async function goToApp(user) {
    const profile = await getMyProfile(user.id);
    window.location.href = profile && profile.is_admin ? "admin.html" : "dashboard.html";
  }

  // Already signed in?
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") setMode("reset");
  });
  getSessionUser().then(u => { if (u && !location.hash.includes("type=recovery")) goToApp(u); });

  forms.signin.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("si-email").value.trim();
    const password = document.getElementById("si-pass").value;
    if (!email || !password) return showFormMsg(msg, "Enter your email and password.");
    const btn = e.submitter; btn.disabled = true;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false;
    if (error) return showFormMsg(msg, error.message.includes("confirm") ? "Confirm your email first: open the link we sent you." : "Email or password is incorrect.");
    goToApp(data.user);
  });

  forms.signup.addEventListener("submit", async e => {
    e.preventDefault();
    const full_name = document.getElementById("su-name").value.trim();
    const email = document.getElementById("su-email").value.trim();
    const phone = document.getElementById("su-phone").value.trim();
    const district = document.getElementById("su-district").value.trim();
    const password = document.getElementById("su-pass").value;
    if (!full_name || !email) return showFormMsg(msg, "Enter your name and email.");
    if (password.length < 8) return showFormMsg(msg, "Use a password with at least 8 characters.");
    const btn = e.submitter; btn.disabled = true;
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name, phone, district }, emailRedirectTo: location.origin + "/dashboard.html" }
    });
    btn.disabled = false;
    if (error) return showFormMsg(msg, error.message);
    if (data.session) return goToApp(data.user);
    showFormMsg(msg, "Account created. Check your email and open the confirmation link to sign in.", "ok");
    forms.signup.reset();
  });

  document.getElementById("forgot").addEventListener("click", async e => {
    e.preventDefault();
    const email = document.getElementById("si-email").value.trim();
    if (!email) return showFormMsg(msg, "Type your email above first, then press this link again.");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/auth.html" });
    if (error) return showFormMsg(msg, error.message);
    showFormMsg(msg, "We sent a password reset link to " + email + ".", "ok");
  });

  forms.reset.addEventListener("submit", async e => {
    e.preventDefault();
    const password = document.getElementById("rp-pass").value;
    if (password.length < 8) return showFormMsg(msg, "Use a password with at least 8 characters.");
    const { data, error } = await sb.auth.updateUser({ password });
    if (error) return showFormMsg(msg, error.message);
    goToApp(data.user);
  });
})();
