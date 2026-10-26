/* =========================================================
   FIND HOME
   Needs api.js (api, clearSession) and Leaflet (L).
========================================================= */

const DEFAULT_MILEAGE = 15;

const homeIntro = document.getElementById("homeIntro");
const locateBtn = document.getElementById("locateBtn");
const homeStatusBox = document.getElementById("homeStatus");
const homeStatsBox = document.getElementById("homeStats");
const homeVehicleSelect = document.getElementById("homeVehicle");
const homeFuelPriceInput = document.getElementById("homeFuelPrice");

let homeUser = null;
let currentPos = null;
let homeMap = null;
let routeLayer = null;
let lastRoute = null;

/* ---------- helpers ---------- */

function showHomeStatus(message, type = "info") {
    homeStatusBox.textContent = message;
    homeStatusBox.className = "home-status " + type;
}

function haversineKm(a, b) {
    const R = 6371;
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

function formatTime(minutes) {
    if (minutes == null) return "—";
    const m = Math.round(minutes);
    if (m < 60) return m + " min";
    return Math.floor(m / 60) + " h " + (m % 60) + " min";
}