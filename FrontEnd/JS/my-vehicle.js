/* =========================================================
   ROADWISE MY VEHICLES
========================================================= */


/* =========================================================
   CURRENT USER
========================================================= */

const currentUserData =
    localStorage.getItem(
        "roadwiseCurrentUser"
    );


let currentUser = null;


if (!currentUserData) {

    window.location.href =
        "../index.html";

} else {

    try {

        currentUser =
            JSON.parse(
                currentUserData
            );

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


const vehicleList =
    document.getElementById(
        "vehicleList"
    );

const emptyVehicleState =
    document.getElementById(
        "emptyVehicleState"
    );


const otherVehicleList =
    document.getElementById(
        "otherVehicleList"
    );


const vehicleModal =
    document.getElementById(
        "vehicleModal"
    );


const addVehicleBtn =
    document.getElementById(
        "addVehicleBtn"
    );


const emptyAddVehicleBtn =
    document.getElementById(
        "emptyAddVehicleBtn"
    );


const closeVehicleModal =
    document.getElementById(
        "closeVehicleModal"
    );


const vehicleForm =
    document.getElementById(
        "vehicleForm"
    );



/* =========================================================
   NAVBAR
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

    clearSession();

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
   OPEN MODAL
========================================================= */

function openVehicleModal() {

    vehicleForm.reset();

    vehicleModal.classList.add(
        "active"
    );

}


if (addVehicleBtn) {

    addVehicleBtn.addEventListener(
        "click",
        openVehicleModal
    );

}


if (emptyAddVehicleBtn) {

    emptyAddVehicleBtn.addEventListener(
        "click",
        openVehicleModal
    );

}



/* =========================================================
   CLOSE MODAL
========================================================= */

function closeVehicleModalFunction() {

    vehicleModal.classList.remove(
        "active"
    );

}


closeVehicleModal.addEventListener(
    "click",
    closeVehicleModalFunction
);


vehicleModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            vehicleModal
        ) {

            closeVehicleModalFunction();

        }

    }
);



/* =========================================================
   GET SAVED VEHICLES
========================================================= */

let vehiclesCache = [];
let otherVehiclesCache = [];

async function loadVehicles() {
    vehiclesCache = await api("/vehicles");
    otherVehiclesCache = await api("/other-vehicles");
}

function getSavedVehicles() {
    return vehiclesCache;
}

/* =========================================================
   SAVE VEHICLE
========================================================= */

vehicleForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document
                .getElementById(
                    "vehicleName"
                )
                .value
                .trim();


        const mileage =
            Number(
                document
                    .getElementById(
                        "vehicleMileage"
                    )
                    .value
            );


        if (!name) {

            return;

        }


        if (
            !mileage ||
            mileage <= 0
        ) {

            return;

        }


        const vehicles =
            JSON.parse(
                localStorage.getItem(
                    "roadwiseVehicles"
                )
            ) || [];


        const vehicle = {

            id:
                crypto.randomUUID(),

            userEmail:
                currentUser.email,

            name:
                name,

            mileage:
                mileage,

            totalDistance:
                0,

            totalFuel:
                0,

            totalCost:
                0,

            createdAt:
                new Date().toISOString()

        };


        vehicles.push(
            vehicle
        );


        localStorage.setItem(
            "roadwiseVehicles",
            JSON.stringify(
                vehicles
            )
        );


        closeVehicleModalFunction();

        displayVehicles();

    }
);



/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(value) {

    return `₹${Number(value).toFixed(2)}`;

}



/* =========================================================
   CREATE VEHICLE CARD
========================================================= */

function createVehicleCard(
    vehicle
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "vehicle-card";


    card.innerHTML = `

        <div class="vehicle-card-header">

            <div>

                <span class="vehicle-card-label">
                    SAVED VEHICLE
                </span>

                <h3>
                    ${vehicle.name}
                </h3>

            </div>


            <button
                type="button"
                class="vehicle-delete-btn"
            >
                Delete
            </button>

        </div>


        <div class="vehicle-mileage">

            <span>
                MILEAGE
            </span>

            <strong>
                ${Number(vehicle.mileage).toFixed(1)}
                <small>km/L</small>
            </strong>

        </div>


        <div class="vehicle-stats">

            <div>

                <span>
                    DISTANCE TRAVELLED
                </span>

                <strong>
                    ${Number(vehicle.totalDistance).toFixed(2)}
                    <small>km</small>
                </strong>

            </div>


            <div>

                <span>
                    FUEL USED
                </span>

                <strong>
                    ${Number(vehicle.totalFuel).toFixed(2)}
                    <small>L</small>
                </strong>

            </div>


            <div>

                <span>
                    FUEL COST
                </span>

                <strong>
                    ${formatCurrency(vehicle.totalCost)}
                </strong>

            </div>

        </div>

    `;


    const deleteButton =
        card.querySelector(
            ".vehicle-delete-btn"
        );


    deleteButton.addEventListener(
        "click",
        () => {

            showVehicleDeleteModal(
                vehicle.id
            );

        }
    );


    return card;

}



/* =========================================================
   DELETE VEHICLE MODAL
========================================================= */

function showVehicleDeleteModal(
    vehicleId
) {

    const existing =
        document.getElementById(
            "vehicleDeleteModal"
        );


    if (existing) {

        existing.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "vehicleDeleteModal";

    modal.className =
        "vehicle-delete-modal-overlay";


    modal.innerHTML = `

        <div class="vehicle-delete-modal">

            <div class="vehicle-delete-icon">
                ×
            </div>


            <span class="vehicle-delete-label">
                REMOVE VEHICLE
            </span>


            <h3>
                Delete this vehicle?
            </h3>


            <p>
                This vehicle will be removed
                from your saved vehicles.
            </p>


            <div class="vehicle-delete-actions">

                <button
                    type="button"
                    class="vehicle-delete-back"
                    id="vehicleDeleteBack"
                >
                    Back
                </button>


                <button
                    type="button"
                    class="vehicle-delete-confirm"
                    id="vehicleDeleteConfirm"
                >
                    Confirm Delete
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "vehicleDeleteBack"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );


    document
        .getElementById(
            "vehicleDeleteConfirm"
        )
        .addEventListener(
            "click",
            () => {

                deleteVehicle(
                    vehicleId
                );

                modal.remove();

            }
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        }
    );

}



/* =========================================================
   DELETE VEHICLE
========================================================= */

function deleteVehicle(
    vehicleId
) {

    const vehicles =
        JSON.parse(
            localStorage.getItem(
                "roadwiseVehicles"
            )
        ) || [];


    const updatedVehicles =
        vehicles.filter(
            vehicle =>
                !(
                    vehicle.id === vehicleId &&
                    vehicle.userEmail ===
                        currentUser.email
                )
        );


    localStorage.setItem(
        "roadwiseVehicles",
        JSON.stringify(
            updatedVehicles
        )
    );


    displayVehicles();

}



/* =========================================================
   DISPLAY VEHICLES
========================================================= */

function displayVehicles() {

    const vehicles =
        getSavedVehicles();


    vehicleList.innerHTML =
        "";


    if (
        vehicles.length === 0
    ) {

        vehicleList.style.display =
            "none";

        emptyVehicleState.style.display =
            "block";

    } else {

        vehicleList.style.display =
            "grid";

        emptyVehicleState.style.display =
            "none";


        vehicles.forEach(
            vehicle => {

                vehicleList.appendChild(
                    createVehicleCard(
                        vehicle
                    )
                );

            }
        );

    }


    displayOtherVehicles();

}



/* =========================================================
   OTHER VEHICLES
========================================================= */

function displayOtherVehicles() {

    const otherVehicles =
        JSON.parse(
            localStorage.getItem(
                "roadwiseOtherVehicles"
            )
        ) || [];


    const userOtherVehicles =
        otherVehicles.filter(
            vehicle =>
                vehicle.userEmail ===
                currentUser.email
        );


    otherVehicleList.innerHTML =
        "";


    userOtherVehicles.forEach(
        (vehicle, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "vehicle-card other-vehicle-card";


            card.innerHTML = `

                <div class="vehicle-card-header">

                    <div>

                        <span class="vehicle-card-label">
                            MANUAL VEHICLE ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </span>

                        <h3>
                            Other Vehicle
                        </h3>

                    </div>

                </div>


                <div class="vehicle-mileage">

                    <span>
                        MILEAGE
                    </span>

                    <strong>
                        ${Number(
                            vehicle.mileage
                        ).toFixed(1)}
                        <small>km/L</small>
                    </strong>

                </div>


                <div class="vehicle-stats">

                    <div>

                        <span>
                            DISTANCE TRAVELLED
                        </span>

                        <strong>
                            ${Number(
                                vehicle.totalDistance
                            ).toFixed(2)}
                            <small>km</small>
                        </strong>

                    </div>


                    <div>

                        <span>
                            FUEL USED
                        </span>

                        <strong>
                            ${Number(
                                vehicle.totalFuel
                            ).toFixed(2)}
                            <small>L</small>
                        </strong>

                    </div>


                    <div>

                        <span>
                            FUEL COST
                        </span>

                        <strong>
                            ${formatCurrency(
                                vehicle.totalCost
                            )}
                        </strong>

                    </div>

                </div>

            `;


            otherVehicleList.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   INITIALIZE
========================================================= */

displayVehicles();