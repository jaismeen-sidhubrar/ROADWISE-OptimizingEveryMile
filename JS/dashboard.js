/* =========================================================
   STORAGE KEYS
========================================================= */

const USERS_KEY = "roadwiseUsers";
const CURRENT_USER_KEY = "roadwiseCurrentUser";
const SAVED_ROUTES_KEY = "roadwiseSavedRoutes";


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    try {

        const raw =
            localStorage.getItem(CURRENT_USER_KEY);

        return raw ? JSON.parse(raw) : null;

    } catch (error) {

        console.error(
            "Unable to read current user.",
            error
        );

        return null;

    }

}


/* =========================================================
   GET ALL USERS
========================================================= */

function getUsers() {

    try {

        const raw =
            localStorage.getItem(USERS_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch (error) {

        console.error(
            "Unable to read users.",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE CURRENT USER
========================================================= */

function saveCurrentUser(user) {

    try {

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(user)
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to save current user.",
            error
        );

        return false;

    }

}


/* =========================================================
   FETCH LATEST USER INFORMATION
========================================================= */

function loadLatestUser() {

    const sessionUser =
        getCurrentUser();


    if (!sessionUser) {

        return null;

    }


    const users =
        getUsers();


    const latestUser =
        users.find(
            user =>
                user.email &&
                sessionUser.email &&
                user.email.toLowerCase() ===
                sessionUser.email.toLowerCase()
        );


    /*
        If the user cannot be found in
        roadwiseUsers, keep the current session.
    */

    if (!latestUser) {

        return sessionUser;

    }


    /*
        Keep only the information needed
        by the dashboard session.
    */

    const updatedSession = {

        name:
            latestUser.name || "",

        email:
            latestUser.email || "",

        username:
            latestUser.username || "",

        phone:
            latestUser.phone || "",

        bio:
            latestUser.bio || "",

        profilePic:
            latestUser.profilePic || "",

        joinedDate:
            latestUser.joinedDate || ""

    };


    saveCurrentUser(
        updatedSession
    );


    return updatedSession;

}


/* =========================================================
   LOAD CURRENT USER
========================================================= */

let currentUser =
    loadLatestUser();


/*
    If nobody is logged in,
    return to landing page.
*/

if (!currentUser) {

    window.location.href =
        "../index.html";

}


/* =========================================================
   USER NAME
========================================================= */

const userName =
    document.getElementById(
        "userName"
    );


if (
    currentUser &&
    userName
) {

    userName.textContent =
        currentUser.name ||
        "User";

}


/* =========================================================
   OPTIONAL PROFILE ELEMENTS
========================================================= */

const dashboardUsername =
    document.getElementById(
        "dashboardUsername"
    );


const dashboardEmail =
    document.getElementById(
        "dashboardEmail"
    );


const dashboardBio =
    document.getElementById(
        "dashboardBio"
    );


const dashboardProfilePic =
    document.getElementById(
        "dashboardProfilePic"
    );


function renderOptionalProfileInfo(user) {

    if (!user) {

        return;

    }


    if (dashboardUsername) {

        dashboardUsername.textContent =
            user.username ||
            user.name ||
            "User";

    }


    if (dashboardEmail) {

        dashboardEmail.textContent =
            user.email || "";

    }


    if (dashboardBio) {

        dashboardBio.textContent =
            user.bio || "";

    }


    if (
        dashboardProfilePic &&
        user.profilePic
    ) {

        dashboardProfilePic.src =
            user.profilePic;

    }

}


renderOptionalProfileInfo(
    currentUser
);


/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbar =
    document.getElementById(
        "navbar"
    );


if (navbar) {

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

}


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


const navLinks =
    document.querySelector(
        ".nav-links"
    );


if (
    mobileMenu &&
    navLinks
) {

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
   CLOSE MOBILE MENU
========================================================= */

document
    .querySelectorAll(
        ".nav-links a"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    if (navLinks) {

                        navLinks.classList.remove(
                            "mobile-active"
                        );

                    }


                    if (mobileMenu) {

                        mobileMenu.textContent =
                            "☰";

                    }

                }
            );

        }
    );


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    window.location.href =
        "../index.html";

}


const logoutBtn =
    document.getElementById(
        "logoutBtn"
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


/* =========================================================
   FOOTER LOGOUT
========================================================= */

const footerLogout =
    document.getElementById(
        "footerLogout"
    );


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
   GET USER'S SAVED ROUTES
========================================================= */

/*
    IMPORTANT:

    Route History stores all saved routes inside:

        roadwiseSavedRoutes

    Each route contains:

        userEmail
        totalDistance
        totalFuel
        totalCost
        totalTime
        optimizedRoute
        etc.

    We use the exact same source of data
    for the Dashboard.
*/

function getUserRoutes() {

    try {

        const savedRoutes =
            JSON.parse(
                localStorage.getItem(
                    SAVED_ROUTES_KEY
                )
            ) || [];


        if (
            !currentUser ||
            !currentUser.email
        ) {

            return [];

        }


        const currentUserEmail =
            currentUser.email;


        return savedRoutes.filter(
            route =>
                route.userEmail ===
                currentUserEmail
        );

    } catch (error) {

        console.error(
            "Unable to load saved routes.",
            error
        );

        return [];

    }

}


/* =========================================================
   CALCULATE DASHBOARD DATA
========================================================= */

function getDashboardData() {

    const routes =
        getUserRoutes();


    /*
        Number of saved routes
    */

    const routeCount =
        routes.length;


    /*
        Total distance
    */

    const totalDistance =
        routes.reduce(
            (
                total,
                route
            ) => {

                return (
                    total +
                    (
                        parseFloat(
                            route.totalDistance
                        ) || 0
                    )
                );

            },
            0
        );


    /*
        Total fuel
    */

    const totalFuel =
        routes.reduce(
            (
                total,
                route
            ) => {

                return (
                    total +
                    (
                        parseFloat(
                            route.totalFuel
                        ) || 0
                    )
                );

            },
            0
        );


    return {

        routeCount,

        totalDistance,

        totalFuel

    };

}


/* =========================================================
   UPDATE DASHBOARD STATISTICS
========================================================= */

function updateDashboardStats() {

    const data =
        getDashboardData();


    /* =====================================================
       HERO STATISTICS
    ===================================================== */

    const routeCountElement =
        document.getElementById(
            "routeCount"
        );


    const distanceCountElement =
        document.getElementById(
            "distanceCount"
        );


    const fuelCountElement =
        document.getElementById(
            "fuelCount"
        );


    if (routeCountElement) {

        routeCountElement.textContent =
            data.routeCount;

    }


    if (distanceCountElement) {

        distanceCountElement.textContent =
            data.totalDistance.toFixed(2) +
            " km";

    }


    if (fuelCountElement) {

        fuelCountElement.textContent =
            data.totalFuel.toFixed(2) +
            " L";

    }


    /* =====================================================
       OVERVIEW STATISTICS
    ===================================================== */

    const statRoutes =
        document.getElementById(
            "statRoutes"
        );


    const statDistance =
        document.getElementById(
            "statDistance"
        );


    const statFuel =
        document.getElementById(
            "statFuel"
        );


    if (statRoutes) {

        statRoutes.textContent =
            data.routeCount;

    }


    if (statDistance) {

        statDistance.textContent =
            data.totalDistance.toFixed(2) +
            " km";

    }


    if (statFuel) {

        statFuel.textContent =
            data.totalFuel.toFixed(2) +
            " L";

    }


    /*
        Useful for debugging.
        Open browser console to see
        exactly what Dashboard is calculating.
    */

    console.log(
        "RoadWise Dashboard Data:",
        data
    );

}


/* =========================================================
   INITIAL DASHBOARD LOAD
========================================================= */

updateDashboardStats();


/* =========================================================
   REFRESH WHEN RETURNING TO DASHBOARD
========================================================= */

window.addEventListener(
    "focus",
    () => {

        /*
            Re-read localStorage every time
            the dashboard gets focus.
        */

        updateDashboardStats();

    }
);


/* =========================================================
   REFRESH WHEN PAGE BECOMES VISIBLE
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            updateDashboardStats();

        }

    }
);


/* =========================================================
   CROSS-TAB LOCAL STORAGE UPDATE
========================================================= */

/*
    If Route History / Route Planner is open
    in another browser tab and changes
    roadwiseSavedRoutes, refresh dashboard.
*/

window.addEventListener(
    "storage",
    event => {

        if (
            event.key ===
            SAVED_ROUTES_KEY
        ) {

            updateDashboardStats();

        }

    }
);


/* =========================================================
   REVEAL ANIMATION
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


if (
    "IntersectionObserver" in window
) {

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


} else {

    revealElements.forEach(
        element => {

            element.classList.add(
                "show"
            );

        }
    );

}


/* =========================================================
   SMOOTH ANCHOR SCROLL
========================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        this.getAttribute(
                            "href"
                        );


                    if (
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );

        }
    );


/* =========================================================
   LIVE PROFILE SYNC
========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === USERS_KEY ||
            event.key === CURRENT_USER_KEY
        ) {

            const refreshedUser =
                loadLatestUser();


            if (!refreshedUser) {

                return;

            }


            currentUser =
                refreshedUser;


            if (userName) {

                userName.textContent =
                    refreshedUser.name ||
                    "User";

            }


            renderOptionalProfileInfo(
                refreshedUser
            );


            /*
                Recalculate routes as well,
                because the current user's email
                may have changed.
            */

            updateDashboardStats();

        }

    }
);


/* =========================================================
   DEBUG HELPER
========================================================= */

/*
    You can run this in the browser console:

        showDashboardData()

    It will show the routes being used
    and the calculated totals.
*/

function showDashboardData() {

    const routes =
        getUserRoutes();

    const data =
        getDashboardData();


    console.log(
        "Current User:",
        currentUser
    );


    console.log(
        "User Saved Routes:",
        routes
    );


    console.log(
        "Dashboard Statistics:",
        data
    );


    return {

        routes,

        data

    };

}