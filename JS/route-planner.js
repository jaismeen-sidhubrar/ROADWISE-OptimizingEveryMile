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
   ADDRESS → LATITUDE + LONGITUDE

   Uses OpenStreetMap Nominatim.
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

   Returns distance in kilometres.
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
   NEAREST NEIGHBOUR ALGORITHM

   First address = starting point.

   From the current location:
   choose the nearest unvisited location.

   Repeat until every destination
   has been visited.
========================================================= */

function nearestNeighbour(
    locations
) {

    const unvisited =
        [...locations];


    const route = [];


    /*
        First location is always
        the starting point.
    */

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
   SHOW ROUTE MAP

   Renders numbered pins for every stop
   in visiting order, plus a dashed line
   tracing the Nearest Neighbour route.

   Uses Leaflet + OpenStreetMap tiles.
========================================================= */

let routeMapInstance = null;


function displayRouteMap(
    route
) {

    /*
        Destroy any previous map instance
        before creating a new one — Leaflet
        does not allow re-initializing the
        same container.
    */

    if (routeMapInstance) {

        routeMapInstance.remove();

        routeMapInstance = null;

    }


    routeMapInstance =
        L.map("routeMap");


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        routeMapInstance
    );


    const latLngs =
        route.map(location => [

            location.latitude,

            location.longitude

        ]);



    /*
        Numbered pin markers,
        in visiting order.
    */

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
                            background:${isStart ? "#1f4d2b" : "var(--green-dark, #2f6b3f)"};
                            color:#fff;
                            font-family:sans-serif;
                            font-weight:700;
                            font-size:12px;
                            border:2px solid #fff;
                            box-shadow:0 2px 6px rgba(0,0,0,0.35);
                        ">
                            ${stopNumber}
                        </div>

                    `,

                    iconSize: [30, 30],

                    iconAnchor: [15, 15]

                });


            L.marker(
                [
                    location.latitude,
                    location.longitude
                ],
                { icon }
            )
                .addTo(routeMapInstance)
                .bindPopup(
                    `<strong>${stopNumber}. ${location.address}</strong>${isStart ? "<br>Starting point" : ""}`
                );

        }
    );



    /*
        Dashed line tracing the
        optimized route order.
    */

    L.polyline(
        latLngs,
        {
            color: "#2f6b3f",
            weight: 3,
            opacity: 0.8,
            dashArray: "8,8"
        }
    ).addTo(
        routeMapInstance
    );



    /*
        Fit the map to show
        every stop comfortably.
    */

    routeMapInstance.fitBounds(
        latLngs,
        { padding: [40, 40] }
    );



    /*
        The map container was hidden
        (display:none) while it was
        being built, so Leaflet may
        have measured it as 0×0.
        Force a resize once it is
        actually visible.
    */

    setTimeout(
        () => {

            if (routeMapInstance) {

                routeMapInstance.invalidateSize();

                routeMapInstance.fitBounds(
                    latLngs,
                    { padding: [40, 40] }
                );

            }

        },
        150
    );

}



/* =========================================================
   FIND ROUTE
========================================================= */

let latestRouteData = null;


findRouteBtn.addEventListener(
    "click",
    async () => {


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

        if (
            addresses.length < 2
        ) {

            alert(
                "Please enter at least two addresses."
            );

            return;

        }


        if (
            fuelPrice <= 0 ||
            fuelEfficiency <= 0 ||
            averageSpeed <= 0
        ) {

            alert(
                "Please enter valid trip details."
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

            const locations = [];


            for (
                let i = 0;
                i < addresses.length;
                i++
            ) {

                loadingMessage.textContent =
                    `Finding location ${i + 1} of ${addresses.length}...`;


                const location =
                    await geocodeAddress(
                        addresses[i]
                    );


                locations.push(
                    location
                );


                /*
                    Small delay between requests.
                */

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
               NEAREST NEIGHBOUR
            ====================================== */

            loadingMessage.textContent =
                "Calculating the most practical stop order...";


            const optimizedRoute =
                nearestNeighbour(
                    locations
                );



            /* =====================================
               CALCULATE JOURNEY
            ====================================== */

            const journey =
                buildRouteDetails(
                    optimizedRoute,
                    fuelEfficiency,
                    fuelPrice,
                    averageSpeed
                );



            /* =====================================
               STORE RESULT
            ====================================== */

            latestRouteData = {

                userEmail:
                    currentUser.email,

                userName:
                    currentUser.name,

                createdAt:
                    new Date().toISOString(),

                originalAddresses:
                    addresses,

                optimizedRoute:
                    optimizedRoute,

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
                    fuelPrice,

                fuelEfficiency:
                    fuelEfficiency,

                averageSpeed:
                    averageSpeed

            };



            /* =====================================
               DISPLAY RESULT
            ====================================== */

            displayRouteOrder(
                optimizedRoute
            );


            displayLegDetails(
                journey.legs
            );


            document.getElementById(
                "totalDistance"
            ).textContent =
                `${journey.totalDistance.toFixed(2)} km`;


            document.getElementById(
                "totalTime"
            ).textContent =
                formatTime(
                    journey.totalTime
                );


            document.getElementById(
                "fuelRequired"
            ).textContent =
                `${journey.totalFuel.toFixed(2)} L`;


            document.getElementById(
                "fuelCost"
            ).textContent =
                formatCurrency(
                    journey.totalCost
                );



            /* =====================================
               SHOW RESULT + MAP
            ====================================== */

            loadingSection.style.display =
                "none";


            mapSection.style.display =
                "block";


            resultSection.style.display =
                "block";


            displayRouteMap(
                optimizedRoute
            );


            mapSection.scrollIntoView({
                behavior: "smooth"
            });


        } catch (error) {


            console.error(
                error
            );


            loadingSection.style.display =
                "none";


            alert(
                error.message ||
                "Something went wrong while finding the route."
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

            alert(
                "Please calculate a route first."
            );

            return;

        }



        /*
            Get existing saved routes.
        */

        const savedRoutes =
            JSON.parse(
                localStorage.getItem(
                    "roadwiseSavedRoutes"
                )
            ) || [];



        /*
            Add current route.
        */

        savedRoutes.push(
            latestRouteData
        );



        /*
            Save all routes.
        */

        localStorage.setItem(
            "roadwiseSavedRoutes",
            JSON.stringify(
                savedRoutes
            )
        );



        alert(
            "Your travel has been saved successfully!"
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
            threshold: 0.12
        }
    );


revealElements.forEach(
    element => {

        observer.observe(
            element
        );

    }
);