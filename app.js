const cfg = window.FDLH_CONFIG;

const supabase = window.supabase.createClient(
  cfg.SUPABASE_URL,
  cfg.SUPABASE_PUBLISHABLE_KEY
);

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("authModal");
  const authContent = document.getElementById("authContent");
  const toastEl = document.getElementById("toast");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function toast(message, type = "") {
    if (!toastEl) {
      alert(message);
      return;
    }

    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;

    setTimeout(() => {
      toastEl.className = "toast";
    }, 3200);
  }

  function openAuth(mode = "login") {
    if (!modal || !authContent) {
      alert("Authentication window could not be opened.");
      return;
    }

    modal.setAttribute("aria-hidden", "false");

    authContent.innerHTML =
      mode === "register"
        ? registerForm()
        : loginForm();

    bindAuthForms();
  }

  function closeAuth() {
    if (modal) {
      modal.setAttribute("aria-hidden", "true");
    }
  }

  function loginForm() {
    return `
      <div class="auth-head">
        <span class="eyebrow">WELCOME BACK</span>
        <h2>Log in</h2>
        <p>Access your learning dashboard.</p>
      </div>

      <form id="loginForm" class="auth-form">
        <label>
          Email
          <input name="email" type="email" required>
        </label>

        <label>
          Password
          <input name="password" type="password" required>
        </label>

        <button class="btn btn-primary full" type="submit">
          Log in
        </button>
      </form>

      <p class="switch">
        New here?
        <button type="button" id="switchRegister">
          Create an account
        </button>
      </p>
    `;
  }

  function registerForm() {
    return `
      <div class="auth-head">
        <span class="eyebrow">JOIN THE HUB</span>
        <h2>Create account</h2>
        <p>Start with a free student account.</p>
      </div>

      <form id="registerForm" class="auth-form">
        <label>
          Full name
          <input name="fullName" type="text" maxlength="100" required>
        </label>

        <label>
          Email
          <input name="email" type="email" required>
        </label>

        <label>
          Password
          <input name="password" type="password" minlength="6" required>
        </label>

        <label>
          Confirm password
          <input name="confirm" type="password" minlength="6" required>
        </label>

        <button class="btn btn-primary full" type="submit">
          Create account
        </button>
      </form>

      <p class="switch">
        Already registered?
        <button type="button" id="switchLogin">
          Log in
        </button>
      </p>
    `;
  }

  function bindAuthForms() {
    const switchRegister =
      document.getElementById("switchRegister");

    const switchLogin =
      document.getElementById("switchLogin");

    const login =
      document.getElementById("loginForm");

    const register =
      document.getElementById("registerForm");

    if (switchRegister) {
      switchRegister.addEventListener("click", () => {
        openAuth("register");
      });
    }

    if (switchLogin) {
      switchLogin.addEventListener("click", () => {
        openAuth("login");
      });
    }

    if (login) {
      login.addEventListener("submit", loginUser);
    }

    if (register) {
      register.addEventListener("submit", registerUser);
    }
  }

  async function loginUser(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      toast(error.message, "error");
      return;
    }

    window.location.href = "dashboard.html";
  }

  async function registerUser(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm = formData.get("confirm");

    if (password !== confirm) {
      toast("Passwords do not match.", "error");
      return;
    }

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

    if (error) {
      toast(error.message, "error");
      return;
    }

    if (data.session) {
      window.location.href = "dashboard.html";
    } else {
      toast(
        "Account created. Check your email for confirmation.",
        "success"
      );

      openAuth("login");
    }
  }

  // Close buttons
  document
    .querySelectorAll("[data-close]")
    .forEach(element => {
      element.addEventListener("click", closeAuth);
    });

  // Login navigation
  const loginNav =
    document.getElementById("loginNav");

  if (loginNav) {
    loginNav.addEventListener("click", event => {
      event.preventDefault();
      openAuth("login");
    });
  }

  // Create account navigation
  const registerNav =
    document.getElementById("registerNav");

  if (registerNav) {
    registerNav.addEventListener("click", event => {
      event.preventDefault();
      openAuth("register");
    });
  }

  // Hero buttons
  document
    .querySelectorAll('a[href="#login"]')
    .forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        openAuth("login");
      });
    });

  document
    .querySelectorAll('a[href="#register"]')
    .forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        openAuth("register");
      });
    });

  // Check existing session
  (async function init() {
    const { data } =
      await supabase.auth.getSession();

    if (!data.session) {
      return;
    }

    if (loginNav) {
      loginNav.textContent = "Dashboard";
      loginNav.href = "dashboard.html";

      // Prevent the old login handler from opening the modal
      loginNav.onclick = null;
    }

    if (registerNav) {
      registerNav.textContent = "My account";
      registerNav.href = "dashboard.html";

      registerNav.onclick = null;
    }
  })();
});
