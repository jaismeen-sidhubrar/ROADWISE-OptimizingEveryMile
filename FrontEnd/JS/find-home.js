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