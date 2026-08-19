/* =========================================================
   ROADWISE ROUTE HISTORY
========================================================= */


/* =========================================================
   CURRENT USER
========================================================= */

const currentUserData =
    localStorage.getItem("roadwiseCurrentUser");


let currentUser = null;


if (!currentUserData) {

    window.location.href =
        "../index.html";

} else {

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

}



/* =========================================================
   DOM ELEMENTS
========================================================= */

const navbar =
    document.getElementById(
        "navbar"
    );


const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


const navLinks =
    document.querySelector(
        ".nav-links"
    );


const routeHistoryContainer =
    document.getElementById(
        "routeHistoryContainer"
    );


const emptyHistory =
    document.getElementById(
        "emptyHistory"
    );



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
   FORMAT TIME
========================================================= */

function formatTime(hours) {

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

function formatCurrency(value) {

    return `₹${Number(value).toFixed(2)}`;

}



/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



/* =========================================================
   GET USER'S SAVED ROUTES
========================================================= */

function getUserRoutes() {

    // Get all saved routes
    const savedRoutes =
        JSON.parse(
            localStorage.getItem("roadwiseSavedRoutes")
        ) || [];


    // Get the logged-in user's email
    const currentUserEmail =
        currentUser.email;


    // Return only routes belonging to this user
    const userRoutes =
        savedRoutes.filter(
            route =>
                route.userEmail === currentUserEmail
        );


    console.log("Current User:", currentUser);
    console.log("Current User Email:", currentUserEmail);
    console.log("All Saved Routes:", savedRoutes);
    console.log("User Routes:", userRoutes);


    return userRoutes;

}



/* =========================================================
   CREATE ROUTE CARD
========================================================= */

function createRouteCard(
    route,
    index
) {

    const card =
        document.createElement(
            "div"
        );


    /*
        Use existing RoadWise styling.
    */

    card.className =
        "route-example";


    card.style.display =
        "grid";

    card.style.gridTemplateColumns =
        "0.7fr 1.3fr";

    card.style.background =
        "white";

    card.style.minHeight =
        "0";

    card.style.boxShadow =
        "0 25px 70px rgba(0,0,0,0.06)";



    /* =====================================================
       LEFT INFORMATION PANEL
    ====================================================== */

    const start =
    route.optimizedRoute?.[0]?.address ||
    "Start";

    const end =
        route.optimizedRoute?.[
            route.optimizedRoute.length - 1
        ]?.address ||
        "Destination";
    const info =
        document.createElement(
            "div"
        );


    info.className =
        "example-info";


    info.innerHTML = `

        <div class="example-label">
            SAVED JOURNEY ${String(index + 1).padStart(2, "0")}
        </div>


        <h3>
            ${start}
            <span style="
                color:var(--green-dark);
                margin:0 7px;
                font-size:0.8em;
            ">→</span>
            ${end}
        </h3>


        <p>
            Saved on
            ${formatDate(route.createdAt)}
        </p>


        <div class="example-settings">

            <div>

                <span>
                    START
                </span>

                <strong>
                    ${route.optimizedRoute[0]?.address || "N/A"}
                </strong>

            </div>


            <div>

                <span>
                    DESTINATIONS
                </span>

                <strong>
                    ${route.optimizedRoute.length}
                </strong>

            </div>


            <div>

                <span>
                    FUEL PRICE
                </span>

                <strong>
                    ₹${Number(route.fuelPrice).toFixed(2)}
                </strong>

            </div>


            <div>

                <span>
                    AVERAGE SPEED
                </span>

                <strong>
                    ${route.averageSpeed} km/h
                </strong>

            </div>

        </div>

    `;



    /* =====================================================
       RIGHT ROUTE AREA
    ====================================================== */

    const routeArea =
        document.createElement(
            "div"
        );


    routeArea.className =
        "example-route";



    /* =====================================================
       ROUTE MAP
    ====================================================== */

    const map =
        document.createElement(
            "div"
        );


    map.className =
        "route-map";


    map.id =
        `historyMap${index}`;


    routeArea.appendChild(
        map
    );



    /* =====================================================
       ROUTE SUMMARY
    ====================================================== */

    const summary =
        document.createElement(
            "div"
        );


    summary.className =
        "route-summary";


    const routeText =
        route.optimizedRoute
            .map(
                location =>
                    location.address
            )
            .join(" → ");


    summary.innerHTML = `

        <div class="summary-route">

            <b>
                ROUTE:
            </b>

            ${routeText}

        </div>


        <div class="summary-numbers">


            <div>

                <span>
                    DISTANCE
                </span>

                <strong>
                    ${Number(route.totalDistance).toFixed(2)}
                    km
                </strong>

            </div>


            <div>

                <span>
                    TIME
                </span>

                <strong>
                    ${formatTime(route.totalTime)}
                </strong>

            </div>


            <div>

                <span>
                    FUEL
                </span>

                <strong>
                    ${Number(route.totalFuel).toFixed(2)}
                    L
                </strong>

            </div>


            <div>

                <span>
                    ESTIMATED COST
                </span>

                <strong>
                    ${formatCurrency(route.totalCost)}
                </strong>

            </div>


        </div>

    `;


    routeArea.appendChild(
        summary
    );


    card.appendChild(
        info
    );


    card.appendChild(
        routeArea
    );


    return card;

}



/* =========================================================
   DISPLAY ROUTE MAP
========================================================= */

function displayHistoryMap(
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


    if (
        !route ||
        route.length === 0
    ) {

        return;

    }


    const map =
        L.map(
            mapElement
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        map
    );


    const latLngs =
        route.map(
            location => [

                location.latitude,

                location.longitude

            ]
        );



    /* =====================================================
       MARKERS
    ====================================================== */

    route.forEach(
        (location, index) => {

            const marker =
                L.marker(
                    [
                        location.latitude,
                        location.longitude
                    ]
                ).addTo(
                    map
                );


            marker.bindPopup(
                `
                    <strong>
                        ${index + 1}.
                        ${location.address}
                    </strong>

                    ${
                        index === 0
                            ? "<br>Starting point"
                            : ""
                    }
                `
            );

        }
    );



    /* =====================================================
       ROUTE LINE
    ====================================================== */

    L.polyline(
        latLngs,
        {
            color: "#2f6b3f",

            weight: 3,

            opacity: 0.8,

            dashArray: "8,8"
        }
    ).addTo(
        map
    );



    /* =====================================================
       FIT MAP
    ====================================================== */

    map.fitBounds(
        latLngs,
        {
            padding: [40, 40]
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
   DISPLAY ALL ROUTES
========================================================= */

function displayRouteHistory() {

    const routes =
        getUserRoutes();


    routeHistoryContainer.innerHTML =
        "";


    /* =====================================================
       NO ROUTES
    ====================================================== */

    if (routes.length === 0) {

        emptyHistory.style.display =
            "block";

        return;

    }


    emptyHistory.style.display =
        "none";



    /*
        Show newest route first.
    */

    routes.reverse();


    routes.forEach(
        (route, index) => {

            const card =
                createRouteCard(
                    route,
                    index
                );


            routeHistoryContainer.appendChild(
                card
            );


            /*
                Map must be initialized
                after the card is in DOM.
            */

            setTimeout(
                () => {

                    displayHistoryMap(
                        route.optimizedRoute,
                        `historyMap${index}`
                    );

                },
                100
            );

        }
    );

}



/* =========================================================
   INITIALIZE
========================================================= */

displayRouteHistory();