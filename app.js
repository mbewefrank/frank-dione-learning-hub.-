const cfg = window.FDLH_CONFIG;

const supabase = window.supabase.createClient(
  cfg.SUPABASE_URL,
  cfg.SUPABASE_PUBLISHABLE_KEY
);

const modal = document.getElementById("authModal");
const authContent = document.getElementById("authContent");
const toastEl = document.getElementById("toast");

document.getElementById("year").textContent =
  new Date().getFullYear();


/* =========================
   TOAST
========================= */

function toast(message, type = "") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;

  setTimeout(() => {
    toastEl.className = "toast";
  }, 3200);
}


/* =========================
   AUTH MODAL
========================= */

function openAuth(mode = "login") {

  modal.setAttribute("aria-hidden", "false");

  if (mode === "register") {
    authContent.innerHTML = registerForm();
  } else {
    authContent.innerHTML = loginForm();
  }

  bindAuthForms();
}


function closeAuth() {
  modal.setAttribute("aria-hidden", "true");
}


document
  .querySelectorAll("[data-close]")
  .forEach(element => {
    element.addEventListener("click", closeAuth);
  });


/* =========================
   NAVIGATION
========================= */

document
  .getElementById("loginNav")
  .addEventListener("click", event => {

    event.preventDefault();

    openAuth("login");
  });


document
  .getElementById("registerNav")
  .addEventListener("click", event => {

    event.preventDefault();

    openAuth("register");
  });


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


/* =========================
   LOGIN FORM
========================= */

function loginForm() {

  return `
    <div class="auth-head">

      <span class="eyebrow">
        WELCOME BACK
      </span>

      <h2>
        Log in
      </h2>

      <p>
        Access your learning dashboard.
      </p>

    </div>


    <form id="loginForm" class="auth-form">

      <label>
        Email

        <input
          name="email"
          type="email"
          autocomplete="email"
          required
        >

      </label>


      <label>
        Password

        <input
          name="password"
          type="password"
          autocomplete="current-password"
          minlength="6"
          required
        >

      </label>


      <button
        class="btn btn-primary full"
        type="submit"
      >
        Log in
      </button>

    </form>


    <p class="switch">

      New here?

      <button id="switchRegister">
        Create an account
      </button>

    </p>
  `;
}


/* =========================
   REGISTER FORM
========================= */

function registerForm() {

  return `
    <div class="auth-head">

      <span class="eyebrow">
        JOIN THE HUB
      </span>

      <h2>
        Create account
      </h2>

      <p>
        Start with a free student account.
      </p>

    </div>


    <form id="registerForm" class="auth-form">

      <label>
        Full name

        <input
          name="fullName"
          type="text"
          maxlength="100"
          required
        >

      </label>


      <label>
        Email

        <input
          name="email"
          type="email"
          autocomplete="email"
          required
        >

      </label>


      <label>
        Password

        <input
          name="password"
          type="password"
          autocomplete="new-password"
          minlength="6"
          required
        >

      </label>


      <label>
        Confirm password

        <input
          name="confirm"
          type="password"
          autocomplete="new-password"
          minlength="6"
          required
        >

      </label>


      <button
        class="btn btn-primary full"
        type="submit"
      >
        Create account
      </button>

    </form>


    <p class="switch">

      Already registered?

      <button id="switchLogin">
        Log in
      </button>

    </p>
  `;
}


/* =========================
   FORM BINDING
========================= */

function bindAuthForms() {

  const registerButton =
    document.getElementById("switchRegister");

  const loginButton =
    document.getElementById("switchLogin");

  const login =
    document.getElementById("loginForm");

  const register =
    document.getElementById("registerForm");


  if (registerButton) {

    registerButton.addEventListener(
      "click",
      () => openAuth("register")
    );

  }


  if (loginButton) {

    loginButton.addEventListener(
      "click",
      () => openAuth("login")
    );

  }


  if (login) {

    login.addEventListener(
      "submit",
      loginUser
    );

  }


  if (register) {

    register.addEventListener(
      "submit",
      registerUser
    );

  }
}


/* =========================
   LOGIN
========================= */

async function loginUser(event) {

  event.preventDefault();

  const formData =
    new FormData(event.currentTarget);

  const email =
    formData.get("email");

  const password =
    formData.get("password");


  const { error } =
    await supabase.auth.signInWithPassword({

      email: email,

      password: password

    });


  if (error) {

    toast(
      error.message,
      "error"
    );

    return;
  }


  location.href =
    "dashboard.html";
}


/* =========================
   REGISTER
========================= */

async function registerUser(event) {

  event.preventDefault();

  const formData =
    new FormData(event.currentTarget);


  const fullName =
    formData.get("fullName");

  const email =
    formData.get("email");

  const password =
    formData.get("password");

  const confirm =
    formData.get("confirm");


  if (password !== confirm) {

    toast(
      "Passwords do not match.",
      "error"
    );

    return;
  }


  const { data, error } =
    await supabase.auth.signUp({

      email: email,

      password: password,

      options: {

        data: {
          full_name: fullName
        }

      }

    });


  if (error) {

    toast(
      error.message,
      "error"
    );

    return;
  }


  if (data.session) {

    location.href =
      "dashboard.html";

  } else {

    toast(
      "Account created. Check your email if email confirmation is enabled.",
      "success"
    );

    openAuth("login");
  }
}


/* =========================
   EXISTING SESSION
========================= */

(async function init() {

  const { data } =
    await supabase.auth.getSession();


  if (!data.session) {
    return;
  }


  const loginNav =
    document.getElementById("loginNav");

  const registerNav =
    document.getElementById("registerNav");


  loginNav.textContent =
    "Dashboard";

  loginNav.href =
    "dashboard.html";


  registerNav.textContent =
    "My account";

  registerNav.href =
    "dashboard.html";

})();
