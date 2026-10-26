const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const routeSelect = document.getElementById("chatRouteSelect");

// Escape anything that came from the server before putting it in innerHTML.
function esc(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
}

function scrollDown() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(kind, html) {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${kind}`;
    msg.innerHTML = `<div class="chat-bubble">${html}</div>`;
    chatMessages.appendChild(msg);
    scrollDown();
    return msg;
}

function placeCard(place, index) {
    const image = place.image
        ? `<img class="place-img" src="${esc(place.image)}" alt="${esc(place.name)}" loading="lazy"
               onerror="this.outerHTML='<div class=&quot;place-img placeholder&quot;>📍</div>'">`
        : `<div class="place-img placeholder">📍</div>`;

    return `
        <article class="place-card">
            ${image}
            <div class="place-body">
                <span class="place-order">STOP ${index + 1} • ~${esc(place.kmFromStart)} KM FROM START</span>
                <h4>${esc(place.name)}</h4>
                ${place.description ? `<span class="place-desc">${esc(place.description)}</span>` : ""}
                ${place.summary ? `<p class="place-summary">${esc(place.summary)}</p>` : ""}
                <p class="place-address">📍 ${esc(place.address)}</p>
                <div class="place-actions">
                    <a href="${esc(place.mapsUrl)}" target="_blank" rel="noopener">Open in Maps</a>
                    <a href="${esc(place.wikipediaUrl)}" target="_blank" rel="noopener">Read more</a>
                </div>
            </div>
        </article>`;
}

async function loadSavedRoutes() {
    try {
        const routes = await apiAll("/routes");
        if (!routes.length) {
            routeSelect.innerHTML = `<option value="">No saved routes yet</option>`;
            addMessage("error", `You have no saved routes. <a href="route-planner.html">Find and save a route</a> first.`);
            return;
        }
        routeSelect.innerHTML =
            `<option value="">Select a saved route…</option>` +
            routes
                .map((r) => `<option value="${esc(r.id || r._id)}">${esc(r.name || "Untitled route")}</option>`)
                .join("");

        // Allow deep link: route-chat.html?route=<id>
        const wanted = new URLSearchParams(location.search).get("route");
        if (wanted) routeSelect.value = wanted;
    } catch (err) {
        routeSelect.innerHTML = `<option value="">Could not load routes</option>`;
        addMessage("error", esc(err.message));
    }
}

async function ask(question) {
    const routeId = routeSelect.value;
    if (!routeId) {
        addMessage("error", "Please select one of your saved routes first.");
        return;
    }
    if (!question.trim()) return;

    addMessage("user", esc(question));
    const typing = addMessage(
        "bot",
        `<span class="typing"><span></span><span></span><span></span></span> Looking along your route…`
    );
    chatSend.disabled = true;

    try {
        const data = await api("/chatbot/places", {
            method: "POST",
            body: { routeId, message: question }
        });
        typing.remove();

        const msg = addMessage("bot", esc(data.reply));
        if (data.places && data.places.length) {
            const list = document.createElement("div");
            list.className = "place-list";
            list.innerHTML = data.places.map(placeCard).join("");
            msg.appendChild(list);
            scrollDown();
        }
    } catch (err) {
        typing.remove();
        addMessage("error", esc(err.message));
    } finally {
        chatSend.disabled = false;
    }
}

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = chatInput.value;
    chatInput.value = "";
    ask(q);
});

document.getElementById("chatChips").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-q]");
    if (btn) ask(btn.dataset.q);
});

loadSavedRoutes();