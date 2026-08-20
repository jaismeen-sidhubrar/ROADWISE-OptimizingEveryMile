/* =========================================================
   ROADWISE ROUTE PLANNER
========================================================= */


/* =========================================================
   CURRENT USER
========================================================= */

const currentUserData =
    localStorage.getItem("roadwiseCurrentUser");


if (!currentUserData) {

    window.location.href =
        "../index.html";

}


let currentUser = null;


try {

    currentUser =
        JSON.parse(currentUserData);

} catch (error) {

    localStorage.removeItem(
        "roadwiseCurrentUser"
    );

    window.location.href =
        "../index.html";

}



/* =========================================================
   DOM ELEMENTS
========================================================= */

const navbar =
    document.getElementById("navbar");

const mobileMenu =
    document.getElementById("mobileMenu");

const navLinks =
    document.querySelector(".nav-links");


const addressContainer =
    document.getElementById(
        "addressContainer"
    );


const addAddressBtn =
    document.getElementById(
        "addAddressBtn"
    );


const findRouteBtn =
    document.getElementById(
        "findRouteBtn"
    );


const loadingSection =
    document.getElementById(
        "loadingSection"
    );


const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );


const mapSection =
    document.getElementById(
        "mapSection"
    );


const resultSection =
    document.getElementById(
        "resultSection"
    );


const routeOrder =
    document.getElementById(
        "routeOrder"
    );


const legDetails =
    document.getElementById(
        "legDetails"
    );


const saveRouteBtn =
    document.getElementById(
        "saveRouteBtn"
    );

const pageMessage =
    document.getElementById("pageMessage");



function showMessage(message, type = "error") {

    if (!pageMessage) return;

    pageMessage.textContent = message;

    pageMessage.className =
        `page-message ${type}`;

    pageMessage.style.display = "block";

    pageMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}




function hideMessage() {

    if (!pageMessage) return;

    pageMessage.textContent = "";
    pageMessage.style.display = "none";
    pageMessage.className = "page-message";
}

/* =========================================================
   NAVBAR SCROLL
========================================================= */

window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 40) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    }
);



/* =========================================================
   MOBILE MENU
========================================================= */

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "mobile-active"
            );


            if (
                navLinks.classList.contains(
                    "mobile-active"
                )
            ) {

                mobileMenu.textContent =
                    "✕";

            } else {

                mobileMenu.textContent =
                    "☰";

            }

        }
    );

}



document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.classList.remove(
                    "mobile-active"
                );

                mobileMenu.textContent =
                    "☰";

            }
        );

    });



/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "roadwiseCurrentUser"
    );

    window.location.href =
        "../index.html";

}


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const footerLogout =
    document.getElementById(
        "footerLogout"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            logout();

        }
    );

}


if (footerLogout) {

    footerLogout.addEventListener(
        "click",
        event => {

            event.preventDefault();

            logout();

        }
    );

}



/* =========================================================
   ADDRESS COUNTER
========================================================= */

let addressNumber = 2;



/* =========================================================
   ADD MORE ADDRESS
========================================================= */

addAddressBtn.addEventListener(
    "click",
    () => {

        addressNumber++;


        const addressGroup =
            document.createElement("div");


        addressGroup.className =
            "form-group";


        addressGroup.innerHTML = `

            <label>
                DESTINATION ${addressNumber}
            </label>

            <input
                type="text"
                class="address-input"
                placeholder="Enter destination address"
                required
            >

        `;


        addressContainer.appendChild(
            addressGroup
        );

    }
);



/* =========================================================
   GET ADDRESSES
========================================================= */

function getAddresses() {

    const inputs =
        document.querySelectorAll(
            ".address-input"
        );


    return Array.from(inputs)
        .map(input =>
            input.value.trim()
        )
        .filter(address =>
            address.length > 0
        );

}



/* =========================================================
   GEOCODING
========================================================= */

async function geocodeAddress(
    address
) {

    const url =
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Unable to contact geocoding service."
        );

    }


    const data =
        await response.json();


    if (
        !data ||
        data.length === 0
    ) {

        throw new Error(
            `Location not found: ${address}`
        );

    }


    return {

        address: address,

        latitude:
            Number(data[0].lat),

        longitude:
            Number(data[0].lon)

    };

}



/* =========================================================
   HAVERSINE DISTANCE
========================================================= */

function calculateDistance(
    pointA,
    pointB
) {

    const earthRadius =
        6371;


    const lat1 =
        pointA.latitude *
        Math.PI / 180;


    const lat2 =
        pointB.latitude *
        Math.PI / 180;


    const deltaLat =
        (pointB.latitude -
            pointA.latitude) *
        Math.PI / 180;


    const deltaLon =
        (pointB.longitude -
            pointA.longitude) *
        Math.PI / 180;


    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}



/* =========================================================
   NEAREST NEIGHBOUR
========================================================= */

function nearestNeighbour(
    locations
) {

    const unvisited =
        [...locations];


    const route = [];


    let current =
        unvisited.shift();


    route.push(current);


    while (
        unvisited.length > 0
    ) {


        let nearestIndex = 0;

        let nearestDistance =
            calculateDistance(
                current,
                unvisited[0]
            );


        for (
            let i = 1;
            i < unvisited.length;
            i++
        ) {

            const distance =
                calculateDistance(
                    current,
                    unvisited[i]
                );


            if (
                distance <
                nearestDistance
            ) {

                nearestDistance =
                    distance;

                nearestIndex =
                    i;

            }

        }


        current =
            unvisited.splice(
                nearestIndex,
                1
            )[0];


        route.push(current);

    }


    return route;

}



/* =========================================================
   2-OPT HEURISTIC
========================================================= */

function calculateTotalRouteDistance(route) {

    let totalDistance = 0;

    for (
        let i = 0;
        i < route.length - 1;
        i++
    ) {

        totalDistance +=
            calculateDistance(
                route[i],
                route[i + 1]
            );

    }

    return totalDistance;

}


function reverseRouteSegment(
    route,
    start,
    end
) {

    const newRoute =
        [...route];


    while (
        start < end
    ) {

        const temp =
            newRoute[start];


        newRoute[start] =
            newRoute[end];


        newRoute[end] =
            temp;


        start++;

        end--;

    }


    return newRoute;

}


function twoOpt(route) {

    let bestRoute =
        [...route];


    let improved = true;


    while (improved) {

        improved = false;


        const currentDistance =
            calculateTotalRouteDistance(
                bestRoute
            );


        for (
            let i = 1;
            i < bestRoute.length - 1;
            i++
        ) {

            for (
                let j = i + 1;
                j < bestRoute.length;
                j++
            ) {

                const candidateRoute =
                    reverseRouteSegment(
                        bestRoute,
                        i,
                        j
                    );


                const candidateDistance =
                    calculateTotalRouteDistance(
                        candidateRoute
                    );


                if (
                    candidateDistance <
                    currentDistance
                ) {

                    bestRoute =
                        candidateRoute;

                    improved =
                        true;

                    break;

                }

            }


            if (improved) {

                break;

            }

        }

    }


    return bestRoute;

}



/* =========================================================
   BUILD ROUTE DETAILS
========================================================= */

function buildRouteDetails(
    route,
    fuelEfficiency,
    fuelPrice,
    averageSpeed
) {

    const legs = [];


    let totalDistance = 0;


    for (
        let i = 0;
        i < route.length - 1;
        i++
    ) {

        const from =
            route[i];


        const to =
            route[i + 1];


        const distance =
            calculateDistance(
                from,
                to
            );


        const time =
            distance /
            averageSpeed;


        const fuel =
            distance /
            fuelEfficiency;


        const cost =
            fuel *
            fuelPrice;


        totalDistance +=
            distance;


        legs.push({

            from:
                from.address,

            to:
                to.address,

            distance:
                distance,

            time:
                time,

            fuel:
                fuel,

            cost:
                cost

        });

    }


    const totalFuel =
        totalDistance /
        fuelEfficiency;


    const totalCost =
        totalFuel *
        fuelPrice;


    const totalTime =
        totalDistance /
        averageSpeed;


    return {

        legs:
            legs,

        totalDistance:
            totalDistance,

        totalFuel:
            totalFuel,

        totalCost:
            totalCost,

        totalTime:
            totalTime

    };

}



/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    hours
) {

    const totalMinutes =
        Math.round(
            hours * 60
        );


    const h =
        Math.floor(
            totalMinutes / 60
        );


    const m =
        totalMinutes % 60;


    if (h === 0) {

        return `${m} min`;

    }


    if (m === 0) {

        return `${h} hr`;

    }


    return `${h} hr ${m} min`;

}



/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(
    value
) {

    return `₹${value.toFixed(2)}`;

}



/* =========================================================
   SHOW ROUTE ORDER
========================================================= */

function displayRouteOrder(
    route
) {

    routeOrder.innerHTML = "";


    route.forEach(
        (location, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.style.padding =
                "15px 0";


            item.style.borderBottom =
                "1px solid var(--border)";


            item.innerHTML = `

                <div
                    style="
                        display:flex;
                        gap:15px;
                        align-items:center;
                    "
                >

                    <strong
                        style="
                            font-family:var(--heading);
                            color:var(--green-dark);
                        "
                    >
                        ${String(index + 1)
                    .padStart(2, "0")}
                    </strong>

                    <span>
                        ${location.address}
                    </span>

                </div>

            `;


            routeOrder.appendChild(
                item
            );

        }
    );

}



/* =========================================================
   SHOW LEG DETAILS
========================================================= */

function displayLegDetails(
    legs
) {

    legDetails.innerHTML = "";


    legs.forEach(
        (leg, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.style.padding =
                "20px 0";


            item.style.borderBottom =
                "1px solid var(--border)";


            item.innerHTML = `

                <div
                    style="
                        font-family:var(--heading);
                        font-weight:700;
                        margin-bottom:10px;
                    "
                >

                    ${index + 1}.
                    ${leg.from}
                    →
                    ${leg.to}

                </div>


                <div
                    style="
                        color:#777870;
                        font-size:11px;
                        line-height:1.8;
                    "
                >

                    Distance:
                    ${leg.distance.toFixed(2)} km

                    <br>

                    Estimated Time:
                    ${formatTime(leg.time)}

                    <br>

                    Fuel:
                    ${leg.fuel.toFixed(2)} L

                    <br>

                    Estimated Cost:
                    ${formatCurrency(leg.cost)}

                </div>

            `;


            legDetails.appendChild(
                item
            );

        }
    );

}



/* =========================================================
   DISPLAY ROUTE OPTIONS
========================================================= */

function displayRouteOptions(
    nearestRoute,
    nearestJourney,
    twoOptRoute,
    twoOptJourney
) {

    const oldSection =
        document.getElementById(
            "routeOptionsSection"
        );


    if (oldSection) {

        oldSection.remove();

    }


    /*
        Distance is the primary criterion.
        Fuel is used as the tie-breaker.
    */

    const distanceDifference =
        Math.abs(
            nearestJourney.totalDistance -
            twoOptJourney.totalDistance
        );


    /*
        Treat extremely small floating-point
        differences as equal.
    */

    const sameDistance =
        distanceDifference < 0.001;


    let bestOption;


    if (sameDistance) {

        bestOption =
            nearestJourney.totalFuel <=
            twoOptJourney.totalFuel

                ? {

                    route:
                        nearestRoute,

                    journey:
                        nearestJourney,

                    algorithm:
                        "Nearest Neighbour"

                }

                : {

                    route:
                        twoOptRoute,

                    journey:
                        twoOptJourney,

                    algorithm:
                        "2-Opt Heuristic"

                };

    } else {

        bestOption =
            nearestJourney.totalDistance <
            twoOptJourney.totalDistance

                ? {

                    route:
                        nearestRoute,

                    journey:
                        nearestJourney,

                    algorithm:
                        "Nearest Neighbour"

                }

                : {

                    route:
                        twoOptRoute,

                    journey:
                        twoOptJourney,

                    algorithm:
                        "2-Opt Heuristic"

                };

    }


    /*
        Main section.
    */

    const section =
        document.createElement(
            "section"
        );


    section.id =
        "routeOptionsSection";


    section.className =
        "about-section route-options-section";


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "section-container";


    container.innerHTML = `

        <div class="section-top">

            <div class="section-number">
                03 / ROUTE OPTIONS
            </div>

            <div class="section-line"></div>

            <div class="section-small-text">
                Choose your journey
            </div>

        </div>


        <div class="route-options-heading">

            <div>

                <div class="eyebrow">

                    <span class="eyebrow-dot"></span>

                    ROADWISE RECOMMENDATION

                </div>


                <h2>

                    Your best
                    <br>

                    <span>route options.</span>

                </h2>

            </div>


            <p>

                We compare the calculated routes using
                distance and fuel consumption so you can
                choose confidently.

            </p>

        </div>


        <div class="route-options-grid"></div>

    `;


    const optionsGrid =
        container.querySelector(
            ".route-options-grid"
        );


    /*
        If distances are equal, show only one.
    */

    if (sameDistance) {

        optionsGrid.appendChild(

            createRouteOptionCard(

                1,

                bestOption.route,

                bestOption.journey,

                true,

                bestOption.algorithm

            )

        );

    } else {

        const nearestIsBest =
            bestOption.route ===
            nearestRoute;


        optionsGrid.appendChild(

            createRouteOptionCard(

                1,

                nearestRoute,

                nearestJourney,

                nearestIsBest,

                "Nearest Neighbour"

            )

        );


        optionsGrid.appendChild(

            createRouteOptionCard(

                2,

                twoOptRoute,

                twoOptJourney,

                !nearestIsBest,

                "2-Opt Heuristic"

            )

        );

    }


    section.appendChild(
        container
    );


    resultSection.parentNode.insertBefore(
        section,
        resultSection
    );


    if (saveRouteBtn) {

        saveRouteBtn.style.display =
            "none";

    }

}



/* =========================================================
   CREATE ROUTE OPTION CARD
========================================================= */

function createRouteOptionCard(
    optionNumber,
    route,
    journey,
    isRecommended,
    algorithmName
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        `route-option-card${
            isRecommended
                ? " recommended"
                : ""
        }`;


    card.innerHTML = `

        ${
            isRecommended

                ? `

                    <div class="recommended-badge">

                        <span>✦</span>

                        Recommended

                    </div>

                `

                : ""
        }


        <div class="route-card-top">

            <div class="route-card-number">

                ${String(optionNumber)
                    .padStart(2, "0")}

            </div>


            <div>

                <div class="route-card-label">

                    ${
                        isRecommended
                            ? "BEST MATCH FOR THIS JOURNEY"
                            : "ALTERNATIVE ROUTE"
                    }

                </div>


                <h3>

                    ${
                        isRecommended
                            ? "A smarter choice."
                            : "Another way to go."
                    }

                </h3>

            </div>

        </div>


        <div class="route-card-stats">


            <div class="route-card-stat">

                <span>
                    Distance
                </span>

                <strong>

                    ${
                        journey.totalDistance
                            .toFixed(2)
                    }

                    <small>
                        km
                    </small>

                </strong>

            </div>


            <div class="route-card-stat">

                <span>
                    Fuel
                </span>

                <strong>

                    ${
                        journey.totalFuel
                            .toFixed(2)
                    }

                    <small>
                        L
                    </small>

                </strong>

            </div>


            <div class="route-card-stat">

                <span>
                    Est. time
                </span>

                <strong>

                    ${
                        formatTime(
                            journey.totalTime
                        )
                    }

                </strong>

            </div>


            <div class="route-card-stat">

                <span>
                    Est. cost
                </span>

                <strong>

                    ${
                        formatCurrency(
                            journey.totalCost
                        )
                    }

                </strong>

            </div>


        </div>


        <div class="route-card-route">

            <div class="route-card-route-title">

                Stop sequence

            </div>


            <div class="route-stop-list"></div>

        </div>


        <div class="route-option-map"></div>


        <button
            class="route-save-btn"
            type="button"
        >

            Use This Route

            <span>
                →
            </span>

        </button>

    `;


    const stopList =
        card.querySelector(
            ".route-stop-list"
        );


    route.forEach(
        (location, index) => {

            const stop =
                document.createElement(
                    "div"
                );


            stop.className =
                "route-stop";


            stop.innerHTML = `

                <span class="route-stop-number">

                    ${
                        String(index + 1)
                            .padStart(2, "0")
                    }

                </span>


                <span class="route-stop-address">

                    ${location.address}

                </span>

            `;


            stopList.appendChild(
                stop
            );

        }
    );


    const mapContainer =
        card.querySelector(
            ".route-option-map"
        );


    const mapId =
        `routeOptionMap${
            Date.now()
        }_${optionNumber}`;


    mapContainer.id =
        mapId;


    card
        .querySelector(
            ".route-save-btn"
        )
        .addEventListener(
            "click",
            () => {

                saveSelectedRoute(
                    algorithmName,
                    route,
                    journey
                );

            }
        );


    setTimeout(
        () => {

            displayOptionMap(
                route,
                mapId
            );

        },
        50
    );


    return card;

}



/* =========================================================
   SHOW ROUTE MAP
========================================================= */

let routeMapInstance =
    null;


function displayRouteMap(
    route
) {

    if (routeMapInstance) {

        routeMapInstance.remove();

        routeMapInstance =
            null;

    }


    routeMapInstance =
        L.map(
            "routeMap"
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    )
        .addTo(
            routeMapInstance
        );


    const latLngs =
        route.map(
            location => [

                location.latitude,

                location.longitude

            ]
        );


    route.forEach(
        (location, index) => {

            const stopNumber =
                index + 1;


            const isStart =
                index === 0;


            const icon =
                L.divIcon({

                    className:
                        "route-map-marker",

                    html: `

                        <div style="

                            display:flex;

                            align-items:center;

                            justify-content:center;

                            width:30px;

                            height:30px;

                            border-radius:50%;

                            background:${
                                isStart
                                    ? "#1f4d2b"
                                    : "var(--green-dark, #2f6b3f)"
                            };

                            color:#fff;

                            font-family:sans-serif;

                            font-weight:700;

                            font-size:12px;

                            border:2px solid #fff;

                            box-shadow:
                                0 2px 6px
                                rgba(0,0,0,0.35);

                        ">

                            ${stopNumber}

                        </div>

                    `,

                    iconSize:
                        [30, 30],

                    iconAnchor:
                        [15, 15]

                });


            L.marker(
                [
                    location.latitude,
                    location.longitude
                ],
                {
                    icon
                }
            )
                .addTo(
                    routeMapInstance
                )
                .bindPopup(
                    `<strong>
                        ${stopNumber}.
                        ${location.address}
                    </strong>${
                        isStart
                            ? "<br>Starting point"
                            : ""
                    }`
                );

        }
    );


    L.polyline(
        latLngs,
        {

            color:
                "#2f6b3f",

            weight:
                3,

            opacity:
                0.8,

            dashArray:
                "8,8"

        }
    )
        .addTo(
            routeMapInstance
        );


    routeMapInstance.fitBounds(
        latLngs,
        {
            padding:
                [40, 40]
        }
    );


    setTimeout(
        () => {

            if (routeMapInstance) {

                routeMapInstance.invalidateSize();


                routeMapInstance.fitBounds(
                    latLngs,
                    {
                        padding:
                            [40, 40]
                    }
                );

            }

        },
        150
    );

}



/* =========================================================
   DISPLAY MAP FOR A ROUTE OPTION
========================================================= */

function displayOptionMap(
    route,
    mapId
) {

    const mapElement =
        document.getElementById(
            mapId
        );


    if (!mapElement) {

        return;

    }


    const map =
        L.map(
            mapElement
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }
    )
        .addTo(
            map
        );


    const latLngs =
        route.map(
            location => [

                location.latitude,

                location.longitude

            ]
        );


    route.forEach(
        (location, index) => {

            const marker =
                L.marker(
                    [
                        location.latitude,
                        location.longitude
                    ]
                )
                    .addTo(
                        map
                    );


            marker.bindPopup(
                `<strong>

                    ${index + 1}.
                    ${location.address}

                </strong>`
            );

        }
    );


    L.polyline(
        latLngs,
        {

            color:
                "#2f6b3f",

            weight:
                3,

            opacity:
                0.8

        }
    )
        .addTo(
            map
        );


    map.fitBounds(
        latLngs,
        {
            padding:
                [30, 30]
        }
    );


    setTimeout(
        () => {

            map.invalidateSize();

        },
        100
    );

}



/* =========================================================
   SAVE SELECTED ROUTE
========================================================= */

function saveSelectedRoute(
    algorithmName,
    route,
    journey
) {

    const savedRoutes =
        JSON.parse(
            localStorage.getItem(
                "roadwiseSavedRoutes"
            )
        ) || [];


    const savedRoute = {

        userEmail:
            currentUser.email,

        userName:
            currentUser.name,

        algorithm:
            algorithmName,

        createdAt:
            new Date().toISOString(),

        originalAddresses:
            getAddresses(),

        optimizedRoute:
            route,

        legs:
            journey.legs,

        totalDistance:
            journey.totalDistance,

        totalTime:
            journey.totalTime,

        totalFuel:
            journey.totalFuel,

        totalCost:
            journey.totalCost,

        fuelPrice:
            document.getElementById(
                "fuelPrice"
            ).value,

        fuelEfficiency:
            document.getElementById(
                "fuelEfficiency"
            ).value,

        averageSpeed:
            document.getElementById(
                "averageSpeed"
            ).value

    };


    savedRoutes.push(
        savedRoute
    );


    localStorage.setItem(
        "roadwiseSavedRoutes",
        JSON.stringify(
            savedRoutes
        )
    );


    showMessage(
        `${algorithmName} route has been added to your dashboard/history!`,
        "success"
    );

}



/* =========================================================
   FIND ROUTE
========================================================= */

let latestRouteData =
    null;


findRouteBtn.addEventListener(
    "click",
    async () => {
        hideMessage();

        const addresses =
            getAddresses();


        const fuelPrice =
            Number(
                document.getElementById(
                    "fuelPrice"
                ).value
            );


        const fuelEfficiency =
            Number(
                document.getElementById(
                    "fuelEfficiency"
                ).value
            );


        const averageSpeed =
            Number(
                document.getElementById(
                    "averageSpeed"
                ).value
            );



        /* =========================================
           VALIDATION
        ========================================== */

        if (addresses.length < 2) {

            showMessage(
                "Please enter at least two addresses.",
                "error"
            );

            return;
        }


        if (
            fuelPrice <= 0 ||
            fuelEfficiency <= 0 ||
            averageSpeed <= 0
        ) {

            showMessage(
                "Please enter valid trip details.",
                "error"
            );

            return;
        }



        /* =========================================
           SHOW LOADING
        ========================================== */

        loadingSection.style.display =
            "block";


        mapSection.style.display =
            "none";


        resultSection.style.display =
            "none";


        loadingMessage.textContent =
            "Converting addresses into coordinates...";


        findRouteBtn.disabled =
            true;



        try {


            /* =====================================
               GEOCODE ALL ADDRESSES
            ====================================== */

            const locations =
                [];


            for (
                let i = 0;
                i < addresses.length;
                i++
            ) {

                loadingMessage.textContent =
                    `Finding location ${
                        i + 1
                    } of ${
                        addresses.length
                    }...`;


                const location =
                    await geocodeAddress(
                        addresses[i]
                    );


                locations.push(
                    location
                );


                if (
                    i <
                    addresses.length - 1
                ) {

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                1000
                            )
                    );

                }

            }



            /* =====================================
               OPTION 1 — NEAREST NEIGHBOUR
            ====================================== */

            loadingMessage.textContent =
                "Calculating your route...";


            const optimizedRoute =
                nearestNeighbour(
                    locations
                );


            const nearestNeighbourJourney =
                buildRouteDetails(
                    optimizedRoute,
                    fuelEfficiency,
                    fuelPrice,
                    averageSpeed
                );



            /* =====================================
               OPTION 2 — 2-OPT
            ====================================== */

            loadingMessage.textContent =
                "Comparing route options...";


            const twoOptRoute =
                twoOpt(
                    optimizedRoute
                );


            const twoOptJourney =
                buildRouteDetails(
                    twoOptRoute,
                    fuelEfficiency,
                    fuelPrice,
                    averageSpeed
                );







            /* =====================================
               DISPLAY ROUTE OPTIONS
            ====================================== */

            displayRouteOptions(
                optimizedRoute,
                nearestNeighbourJourney,
                twoOptRoute,
                twoOptJourney
            );







            /* =====================================
               HIDE OLD SINGLE ROUTE DISPLAY
            ====================================== */

            loadingSection.style.display =
                "none";


            mapSection.style.display =
                "none";


            resultSection.style.display =
                "none";


            const routeOptionsSection =
                document.getElementById(
                    "routeOptionsSection"
                );


            if (routeOptionsSection) {

                routeOptionsSection.scrollIntoView({

                    behavior:
                        "smooth"

                });

            }


        } catch (error) {


            console.error(
                error
            );


            loadingSection.style.display =
                "none";


            showMessage(
                error.message ||
                "Something went wrong while finding the route.",
                "error"
            );


        } finally {

            findRouteBtn.disabled =
                false;

        }

    }
);



/* =========================================================
   SAVE ROUTE
========================================================= */

saveRouteBtn.addEventListener(
    "click",
    () => {


        if (
            !latestRouteData
        ) {

            showMessage(
                "Please calculate a route first.",
                "error"
            );

            return;

        }


        const savedRoutes =
            JSON.parse(
                localStorage.getItem(
                    "roadwiseSavedRoutes"
                )
            ) || [];


        savedRoutes.push(
            latestRouteData
        );


        localStorage.setItem(
            "roadwiseSavedRoutes",
            JSON.stringify(
                savedRoutes
            )
        );



        showMessage(
            "Your travel has been saved successfully!",
            "success"
        );


    }
);



/* =========================================================
   REVEAL ANIMATION
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "show"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold:
                0.12
        }
    );


revealElements.forEach(
    element => {

        observer.observe(
            element
        );

    }
);