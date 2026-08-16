/* =========================================================
   PROFILE PAGE — LOGIC

   Storage schema (matches index.js on the landing page):

   - "roadwiseUsers"        -> array of { name, email, password }
                                every registered account lives here.

   - "roadwiseCurrentUser"  -> { name, email }
                                the currently logged-in session.

   This page extends the record with a few profile-only fields
   (username, phone, bio, profilePic, joinedDate) that aren't
   collected at signup. Those extra fields are merged onto the
   SAME "roadwiseCurrentUser" object and onto the matching entry
   in "roadwiseUsers", so nothing here conflicts with what
   index.js already reads/writes — it just adds more detail.

   NOTE: If your dashboard folder isn't literally "dashboard/",
   update NAV_HOME_PATH below to match.
========================================================= */

const USERS_KEY = "roadwiseUsers";
const CURRENT_USER_KEY = "roadwiseCurrentUser";

const NAV_HOME_PATH = "./Pages/dashboard.html";
const LANDING_PATH = "../index.html";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB


/* =========================================================
   NAVBAR SCROLL + MOBILE MENU
   (same behavior as index.js, kept local so this page
   doesn't depend on another page's script)
========================================================= */

const navbar = document.getElementById("navbar");

if (navbar) {

    window.addEventListener("scroll", () => {

        navbar.classList.toggle("scrolled", window.scrollY > 40);

    });

}


const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.querySelector(".nav-links");

if (mobileMenu && navLinks) {

    mobileMenu.addEventListener("click", () => {

        navLinks.classList.toggle("mobile-active");

        mobileMenu.textContent =
            navLinks.classList.contains("mobile-active") ? "✕" : "☰";

    });

}


/* =========================================================
   STORAGE HELPERS
========================================================= */

function getUsers() {

    try {

        const raw = localStorage.getItem(USERS_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch (error) {

        console.error("Could not read users from storage:", error);

        return [];

    }

}


function saveUsers(users) {

    try {

        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        return true;

    } catch (error) {

        console.error("Could not save users to storage:", error);

        return false;

    }

}


function getCurrentUser() {

    try {

        const raw = localStorage.getItem(CURRENT_USER_KEY);

        return raw ? JSON.parse(raw) : null;

    } catch (error) {

        console.error("Could not read current user from storage:", error);

        return null;

    }

}


function saveCurrentUser(user) {

    try {

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return true;

    } catch (error) {

        console.error("Could not save current user to storage:", error);

        return false;

    }

}



/* =========================================================
   LOAD THE ACTIVE PROFILE

   currentUser only guarantees {name, email}. Extra fields
   (username, phone, bio, profilePic, joinedDate) may or may
   not be present yet — fall back sensibly when they aren't.
========================================================= */

let sessionUser = getCurrentUser();

if (!sessionUser) {

    window.location.href = "../index.html";

}


function buildWorkingProfile(session) {

    const matchingAccount =
        getUsers().find(
            u => u.email.toLowerCase() === session.email.toLowerCase()
        ) || {};

    return {
        name: session.name || matchingAccount.name || "",
        email: session.email || matchingAccount.email || "",
        password: matchingAccount.password || "",
        username: session.username || "",
        phone: session.phone || "",
        bio: session.bio || "",
        profilePic: session.profilePic || "",
        joinedDate: session.joinedDate || new Date().toISOString()
    };

}


let currentUser = buildWorkingProfile(sessionUser);

// The original email, used to find the matching record in
// "roadwiseUsers" even after the user changes their email.
let originalEmail = currentUser.email;


/* =========================================================
   ELEMENTS
========================================================= */

const form = document.getElementById("profileForm");

const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const bioInput = document.getElementById("bio");
const bioCount = document.getElementById("bioCount");

const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

const avatarInput = document.getElementById("avatarInput");
const avatarImage = document.getElementById("avatarImage");
const avatarInitials = document.getElementById("avatarInitials");
const removeAvatarBtn = document.getElementById("removeAvatarBtn");

const avatarDisplayName = document.getElementById("avatarDisplayName");
const avatarDisplayEmail = document.getElementById("avatarDisplayEmail");
const metaJoined = document.getElementById("metaJoined");

const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const toast = document.getElementById("profileToast");
const toastText = document.getElementById("profileToastText");

const logoutBtn = document.getElementById("logoutBtn");
const footerLogout = document.getElementById("footerLogout");


let pendingAvatarDataUrl = null; // null = no change queued
let avatarRemoved = false;


/* =========================================================
   RENDER USER INTO FORM
========================================================= */

function getInitials(name) {

    if (!name) return "RW";

    const parts = name.trim().split(/\s+/);

    const initials =
        parts.length > 1
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0].slice(0, 2);

    return initials.toUpperCase();

}


function renderAvatar(user) {

    if (user.profilePic) {

        avatarImage.src = user.profilePic;
        avatarImage.style.display = "block";
        avatarInitials.style.display = "none";

    } else {

        avatarImage.style.display = "none";
        avatarImage.src = "";
        avatarInitials.style.display = "block";
        avatarInitials.textContent = getInitials(user.name);

    }

}


function formatJoinedDate(isoString) {

    try {

        return new Date(isoString).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric"
        });

    } catch (error) {

        return "—";

    }

}


function renderForm(user) {

    fullNameInput.value = user.name || "";
    usernameInput.value = user.username || "";
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";
    bioInput.value = user.bio || "";

    bioCount.textContent = String((user.bio || "").length);

    avatarDisplayName.textContent = user.name || "Your Name";
    avatarDisplayEmail.textContent = user.email || "you@example.com";

    metaJoined.textContent = formatJoinedDate(user.joinedDate);

    renderAvatar(user);

}


renderForm(currentUser);


/* =========================================================
   BIO CHARACTER COUNT
========================================================= */

bioInput.addEventListener("input", () => {

    bioCount.textContent = String(bioInput.value.length);

});


/* =========================================================
   AVATAR UPLOAD
========================================================= */

avatarInput.addEventListener("change", () => {

    const file = avatarInput.files && avatarInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        showToast("Please choose an image file.", true);

        avatarInput.value = "";

        return;

    }

    if (file.size > MAX_AVATAR_BYTES) {

        showToast("Image is too large. Please choose one under 2MB.", true);

        avatarInput.value = "";

        return;

    }

    const reader = new FileReader();

    reader.onload = () => {

        pendingAvatarDataUrl = reader.result;
        avatarRemoved = false;

        avatarImage.src = pendingAvatarDataUrl;
        avatarImage.style.display = "block";
        avatarInitials.style.display = "none";

    };

    reader.onerror = () => {

        showToast("Could not read that image, please try again.", true);

    };

    reader.readAsDataURL(file);

});


removeAvatarBtn.addEventListener("click", () => {

    pendingAvatarDataUrl = null;
    avatarRemoved = true;

    avatarInput.value = "";

    avatarImage.style.display = "none";
    avatarImage.src = "";
    avatarInitials.style.display = "block";
    avatarInitials.textContent = getInitials(fullNameInput.value);

});


/* =========================================================
   VALIDATION HELPERS
========================================================= */

function setFieldError(groupId, hasError) {

    const group = document.getElementById(groupId);

    if (!group) return;

    group.classList.toggle("has-error", hasError);

}


function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

}


function emailTakenByAnotherAccount(email) {

    return getUsers().some(
        u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.email.toLowerCase() !== originalEmail.toLowerCase()
    );

}


function validateForm() {

    let isValid = true;


    // Full name

    const nameOk = fullNameInput.value.trim().length > 0;

    setFieldError("group-fullName", !nameOk);

    if (!nameOk) isValid = false;


    // Username

    const usernameValue = usernameInput.value.trim();

    const usernameOk = usernameValue.length === 0 || usernameValue.length >= 3;

    setFieldError("group-username", !usernameOk);

    if (!usernameOk) isValid = false;


    // Email

    const emailValue = emailInput.value.trim();

    const emailFormatOk = isValidEmail(emailValue);

    const emailAvailable =
        emailFormatOk && !emailTakenByAnotherAccount(emailValue);

    setFieldError("group-email", !emailAvailable);

    if (!emailAvailable) isValid = false;


    // Password change (only validated if the user is
    // actually trying to change it)

    const wantsPasswordChange =
        newPasswordInput.value.length > 0 ||
        confirmPasswordInput.value.length > 0 ||
        currentPasswordInput.value.length > 0;

    if (wantsPasswordChange) {

        const currentOk =
            !currentUser.password ||
            currentPasswordInput.value === currentUser.password;

        setFieldError("group-currentPassword", !currentOk);

        if (!currentOk) isValid = false;


        const newOk = newPasswordInput.value.length >= 6;

        setFieldError("group-newPassword", !newOk);

        if (!newOk) isValid = false;


        const matchOk =
            newPasswordInput.value === confirmPasswordInput.value;

        setFieldError(
            "group-confirmPassword",
            !matchOk || (!newOk && confirmPasswordInput.value.length > 0)
        );

        if (!matchOk) isValid = false;

    } else {

        setFieldError("group-currentPassword", false);
        setFieldError("group-newPassword", false);
        setFieldError("group-confirmPassword", false);

    }

    return isValid;

}


/* Clear a field's error state as soon as the user edits it */

[
    ["fullName", "group-fullName"],
    ["username", "group-username"],
    ["email", "group-email"],
    ["currentPassword", "group-currentPassword"],
    ["newPassword", "group-newPassword"],
    ["confirmPassword", "group-confirmPassword"]

].forEach(([inputId, groupId]) => {

    const el = document.getElementById(inputId);

    if (el) {

        el.addEventListener("input", () => setFieldError(groupId, false));

    }

});


/* =========================================================
   SAVE / SUBMIT
   Writes to BOTH storage keys so login (which reads
   "roadwiseUsers") and the session (which reads
   "roadwiseCurrentUser") stay in sync.
========================================================= */

form.addEventListener("submit", (event) => {

    event.preventDefault();

    if (!validateForm()) {

        showToast("Please fix the highlighted fields.", true);

        return;

    }

    const wantsPasswordChange = newPasswordInput.value.length > 0;

    const updatedUser = {
        ...currentUser,
        name: fullNameInput.value.trim(),
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        bio: bioInput.value.trim()
    };

    if (avatarRemoved) {

        updatedUser.profilePic = "";

    } else if (pendingAvatarDataUrl) {

        updatedUser.profilePic = pendingAvatarDataUrl;

    }

    if (wantsPasswordChange) {

        updatedUser.password = newPasswordInput.value;

    }


    /* --- Update the account record in "roadwiseUsers" --- */

    const users = getUsers();

    const accountIndex = users.findIndex(
        u => u.email.toLowerCase() === originalEmail.toLowerCase()
    );

    const accountRecord = {
        name: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        username: updatedUser.username,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        joinedDate: updatedUser.joinedDate
    };

    if (accountIndex >= 0) {

        users[accountIndex] = accountRecord;

    } else {

        users.push(accountRecord);

    }

    const usersSaved = saveUsers(users);


    /* --- Update the active session in "roadwiseCurrentUser" --- */

    const sessionSaved = saveCurrentUser({
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        joinedDate: updatedUser.joinedDate
    });

    if (!usersSaved || !sessionSaved) {

        showToast("Something went wrong while saving. Please try again.", true);

        return;

    }

    currentUser = updatedUser;
    originalEmail = updatedUser.email;

    pendingAvatarDataUrl = null;
    avatarRemoved = false;

    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";

    renderForm(currentUser);

    showToast("Profile updated successfully.");

});


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message, isError = false) {

    if (!toast) return;

    toastText.textContent = message;

    toast.classList.toggle("toast-error", isError);

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3200);

}


/* =========================================================
   DELETE ACCOUNT
   Removes the account from "roadwiseUsers" and clears the
   active session, then returns to the landing page.
========================================================= */

function openDeleteModal(event) {

    if (event) event.preventDefault();

    deleteModal.classList.add("active");

    document.body.classList.add("modal-open");

}


function closeDeleteModal() {

    deleteModal.classList.remove("active");

    document.body.classList.remove("modal-open");

}


if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener("click", openDeleteModal);

}

if (cancelDeleteBtn) {

    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

}

if (deleteModal) {

    deleteModal.addEventListener("click", (event) => {

        if (event.target === deleteModal) closeDeleteModal();

    });

}

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") closeDeleteModal();

});

if (confirmDeleteBtn) {

    confirmDeleteBtn.addEventListener("click", () => {

        const users = getUsers().filter(
            u => u.email.toLowerCase() !== originalEmail.toLowerCase()
        );

        saveUsers(users);

        localStorage.removeItem(CURRENT_USER_KEY);

        window.location.href = LANDING_PATH;

    });

}


/* =========================================================
   LOGOUT
   Matches the #logoutBtn / #footerLogout pattern used on
   the dashboard page.

   NOTE: previously this file declared `logoutBtn` and
   `footerLogout` a SECOND time down here with `const`,
   which is a duplicate-declaration SyntaxError in the same
   scope. That error stopped the ENTIRE script from running
   (not just logout) — which is why nothing on this page
   worked. Fixed by reusing the elements already grabbed in
   the ELEMENTS section above instead of redeclaring them.
========================================================= */

function logoutUser(event) {

    event.preventDefault();

    // Remove logged-in user
    localStorage.removeItem(CURRENT_USER_KEY);

    // Go back to landing page
    window.location.href = LANDING_PATH;

}


if (logoutBtn) {

    logoutBtn.addEventListener("click", logoutUser);

}


if (footerLogout) {

    footerLogout.addEventListener("click", logoutUser);

}


/* =========================================================
   LIVE SYNC FROM OTHER TABS/PAGES

   The browser fires a native "storage" event on every OTHER
   open tab/page whenever localStorage changes (it never fires
   in the tab that made the change). This lets Profile pick up
   edits made from Dashboard — or another Profile tab — without
   requiring a reload.
========================================================= */

window.addEventListener("storage", (event) => {

    if (!sessionUser) return;

    if (event.key === USERS_KEY || event.key === CURRENT_USER_KEY) {

        const latestSession = getCurrentUser() || sessionUser;

        sessionUser = latestSession;

        const refreshed = buildWorkingProfile(sessionUser);

        currentUser = refreshed;
        originalEmail = refreshed.email;

        // Don't stomp on an avatar/photo change the user is
        // actively mid-edit on in THIS tab.
        if (!pendingAvatarDataUrl && !avatarRemoved) {

            renderForm(currentUser);

        }

    }

});