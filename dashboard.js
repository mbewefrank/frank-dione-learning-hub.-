const cfg = window.FDLH_CONFIG;

const supabase = window.supabase.createClient(
  cfg.SUPABASE_URL,
  cfg.SUPABASE_PUBLISHABLE_KEY
);

const toastEl = document.getElementById("toast");

function toast(message, type = "") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;

  setTimeout(() => {
    toastEl.className = "toast";
  }, 3200);
}

async function requireUser() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error || !data.user) {
    location.href = "index.html#login";
    return null;
  }

  return data.user;
}

async function loadProfile(user) {
  const { data, error } =
    await supabase
      .from("profiles")
      .select(
        "full_name,student_number,institution,plan"
      )
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    console.error(error);

    toast(
      "Could not load profile. Check the Supabase SQL setup.",
      "error"
    );

    return;
  }

  document.getElementById("fullName").value =
    data?.full_name ||
    user.user_metadata?.full_name ||
    "";

  document.getElementById("studentNumber").value =
    data?.student_number || "";

  document.getElementById("institution").value =
    data?.institution || "";

  document.getElementById("planChip").textContent =
    data?.plan || "free";

  const name =
    data?.full_name ||
    user.user_metadata?.full_name ||
    "Student";

  document.getElementById("welcome").textContent =
    `Welcome, ${name.split(" ")[0]}`;

  document.getElementById("emailText").textContent =
    user.email || "";
}

async function saveProfile(event, user) {
  event.preventDefault();

  const payload = {
    id: user.id,

    full_name:
      document
        .getElementById("fullName")
        .value
        .trim(),

    student_number:
      document
        .getElementById("studentNumber")
        .value
        .trim(),

    institution:
      document
        .getElementById("institution")
        .value
        .trim()
  };

  const { error } =
    await supabase
      .from("profiles")
      .upsert(payload);

  if (error) {
    toast(error.message, "error");
    return;
  }

  toast(
    "Profile saved.",
    "success"
  );
}

async function loadDocuments() {
  const box =
    document.getElementById("documents");

  const { data, error } =
    await supabase
      .from("documents")
      .select(
        "id,title,description,course,access_level,storage_path"
      )
      .eq("published", true)
      .order("created_at", {
        ascending: false
      });

  if (error) {
    box.innerHTML = `
      <div class="empty">
        Could not load resources.
        Run supabase-schema.sql in your
        Supabase SQL Editor.
      </div>
    `;

    return;
  }

  if (!data?.length) {
    box.innerHTML = `
      <div class="empty">
        No resources have been published yet.
      </div>
    `;

    return;
  }

  box.innerHTML = data
    .map(doc => `
      <article class="document-item">

        <div>

          <span class="doc-course">
            ${escapeHtml(
              doc.course || "General"
            )}
          </span>

          <h3>
            ${escapeHtml(doc.title)}
          </h3>

          <p>
            ${escapeHtml(
              doc.description ||
              "Learning resource"
            )}
          </p>

        </div>

        <button
          class="btn btn-primary open-doc"
          data-id="${doc.id}"
        >
          Open
        </button>

      </article>
    `)
    .join("");

  box
    .querySelectorAll(".open-doc")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => openDocument(button.dataset.id)
      );

    });
}

async function openDocument(id) {

  const { data: doc, error } =
    await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !doc) {
    toast(
      "Resource not found.",
      "error"
    );

    return;
  }

  if (doc.access_level === "premium") {

    const { data: userData } =
      await supabase.auth.getUser();

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("plan")
        .eq("id", userData.user.id)
        .maybeSingle();

    if (profile?.plan !== "premium") {

      toast(
        "This is a premium resource. A payment/subscription workflow must be connected first.",
        "error"
      );

      return;
    }
  }

  const { data, error: signError } =
    await supabase
      .storage
      .from("learning-documents")
      .createSignedUrl(
        doc.storage_path,
        300
      );

  if (
    signError ||
    !data?.signedUrl
  ) {

    toast(
      "Could not open this document. Check storage policies and the file path.",
      "error"
    );

    return;
  }

  document.getElementById(
    "viewerTitle"
  ).textContent = doc.title;

  document.getElementById(
    "documentFrame"
  ).src = data.signedUrl;

  document
    .getElementById("viewer")
    .setAttribute(
      "aria-hidden",
      "false"
    );
}

document
  .getElementById("closeViewer")
  .addEventListener(
    "click",
    closeViewer
  );

function closeViewer() {

  document.getElementById(
    "documentFrame"
  ).src = "about:blank";

  document
    .getElementById("viewer")
    .setAttribute(
      "aria-hidden",
      "true"
    );
}

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    async () => {

      await supabase.auth.signOut();

      location.href =
        "index.html";
    }
  );

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );
}

(async function init() {

  const user =
    await requireUser();

  if (!user) {
    return;
  }

  await loadProfile(user);

  document
    .getElementById("profileForm")
    .addEventListener(
      "submit",
      event => saveProfile(event, user)
    );

  await loadDocuments();

})();
