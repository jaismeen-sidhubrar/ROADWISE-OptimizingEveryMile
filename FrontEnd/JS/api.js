const TOKEN_KEY = "roadwiseToken";
const SESSION_KEY = "roadwiseCurrentUser";

const inPagesFolder = location.pathname.includes("/Pages/");
const LANDING_URL = inPagesFolder ? "../index.html" : "index.html";

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function saveSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
}

async function api(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(window.API_BASE_URL + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch (error) {
        throw new Error(
            "Cannot reach the server. Please try again in a moment."
        );
    }

    const data = await response.json().catch(() => ({}));

    // Handle expired or invalid sessions.
    if (response.status === 401 && !path.startsWith("/auth/login")) {
        clearSession();
        window.location.href = LANDING_URL;

        throw new Error(data.message || "Please log in again.");
    }

    if (!response.ok) {
        const details = Array.isArray(data.errors)
            ? " " + data.errors.join(" ")
            : "";

        throw new Error(
            (data.message || "Something went wrong.") + details
        );
    }

    return data;
}

// Fetch all routes across pages of up to 100 records.
async function apiAll(path) {
    const limit = 100;
    let page = 1;
    let all = [];

    while (true) {
        const batch = await api(`${path}?limit=${limit}&page=${page}`);

        all = all.concat(batch);

        if (batch.length < limit) {
            return all;
        }

        page++;
    }
}

// Pages inside /Pages/ require authentication.
if (inPagesFolder) {
    if (!getToken()) {
        window.location.replace(LANDING_URL);
    } else {
        // Refresh the cached user profile and validate the token.
        api("/auth/me")
            .then((user) => {
                localStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify(user)
                );
            })
            .catch(() => {});
    }
}