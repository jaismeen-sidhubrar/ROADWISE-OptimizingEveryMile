/* =========================================================
   ROADWISE PERSONALIZED DASHBOARD
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const USERS_KEY = "roadwiseUsers";
const CURRENT_USER_KEY = "roadwiseCurrentUser";


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
   FETCH LATEST PROFILE
========================================================= */

/*
    roadwiseCurrentUser tells us WHO is logged in.

    roadwiseUsers contains the latest complete profile.

    Therefore:
        1. Read current session
        2. Find matching account using email
        3. Use latest account information
        4. Update current session
*/

function loadLatestUser() {

    const sessionUser = getCurrentUser();

    if (!sessionUser) {

        return null;

    }


    const users = getUsers();


    const latestUser =
        users.find(
            user =>
                user.email &&
                sessionUser.email &&
                user.email.toLowerCase() ===
                sessionUser.email.toLowerCase()
        );


    if (!latestUser) {

        /*
            If the account cannot be found,
            keep the session rather than breaking
            the dashboard.
        */

        return sessionUser;

    }


    /*
        Do NOT store the password in
        roadwiseCurrentUser.
    */

    const updatedSession = {

        name: latestUser.name || "",

        email: latestUser.email || "",

        username: latestUser.username || "",

        phone: latestUser.phone || "",

        bio: latestUser.bio || "",

        profilePic: latestUser.profilePic || "",

        joinedDate: latestUser.joinedDate || ""

    };


    saveCurrentUser(updatedSession);


    return updatedSession;

}


/* =========================================================
   LOAD USER
========================================================= */

let currentUser =
    loadLatestUser();


/*
    If no user is logged in,
    return to landing page.
*/

if (!currentUser) {

    window.location.href = "../../index.html";

}


/* =========================================================
   DISPLAY USER NAME
========================================================= */

const userName =
    document.getElementById("userName");


if (currentUser && userName) {

    userName.textContent =
        currentUser.name || "User";

}


/* =========================================================
   OPTIONAL PROFILE INFORMATION
========================================================= */

/*
    If your dashboard later has elements with
    these IDs, they will automatically display
    the latest profile information.

    You don't need to add them now.
*/

const dashboardUsername =
    document.getElementById("dashboardUsername");

const dashboardEmail =
    document.getElementById("dashboardEmail");

const dashboardBio =
    document.getElementById("dashboardBio");

const dashboardProfilePic =
    document.getElementById("dashboardProfilePic");


function renderOptionalProfileInfo(user) {

    if (!user) return;

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


renderOptionalProfileInfo(currentUser);


/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbar =
    document.getElementById("navbar");


if (navbar) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const navLinks =
    document.querySelector(".nav-links");


if (mobileMenu && navLinks) {

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

                mobileMenu.textContent = "✕";

            } else {

                mobileMenu.textContent = "☰";

            }

        }
    );

}


/* =========================================================
   CLOSE MOBILE MENU
========================================================= */

document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                if (navLinks) {

                    navLinks.classList.remove(
                        "mobile-active"
                    );

                }


                if (mobileMenu) {

                    mobileMenu.textContent = "☰";

                }

            }
        );

    });


/* =========================================================
   LOGOUT

   NOTE: this previously redirected to "../../index.html"
   (up TWO folder levels) while every other path in this
   file — CSS, images, the no-session redirect above — only
   goes up ONE level ("../index.html"). That mismatch sent
   the browser to a URL that doesn't exist, which is why
   logout looked like it "did nothing." Fixed to match the
   rest of the file. If dashboard.html genuinely lives two
   folders below index.html in your project, flip this back
   to "../../index.html" AND update the no-session redirect
   above and the CSS/image paths to match — the key thing is
   picking one consistent depth everywhere.
========================================================= */

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            localStorage.removeItem(
                CURRENT_USER_KEY
            );

            window.location.href =
                "../index.html";

        }
    );

}


/* =========================================================
   DASHBOARD DATA
========================================================= */

const routeCount =
    localStorage.getItem(
        "roadwiseRouteCount"
    ) || "0";


const totalDistance =
    localStorage.getItem(
        "roadwiseTotalDistance"
    ) || "0";


const totalFuel =
    localStorage.getItem(
        "roadwiseTotalFuel"
    ) || "0";


/* =========================================================
   HERO STATISTICS
========================================================= */

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
        routeCount;

}


if (distanceCountElement) {

    distanceCountElement.textContent =
        totalDistance + " km";

}


if (fuelCountElement) {

    fuelCountElement.textContent =
        totalFuel + " L";

}


/* =========================================================
   OVERVIEW STATISTICS
========================================================= */

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
        routeCount;

}


if (statDistance) {

    statDistance.textContent =
        totalDistance + " km";

}


if (statFuel) {

    statFuel.textContent =
        totalFuel + " L";

}


/* =========================================================
   REVEAL ANIMATION
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(

            (entries) => {

                entries.forEach(
                    (entry) => {

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
        (element) => {

            observer.observe(element);

        }
    );

} else {

    revealElements.forEach(
        element => {

            element.classList.add("show");

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
    .forEach(link => {

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

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    });


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
        (event) => {

            event.preventDefault();

            localStorage.removeItem(
                CURRENT_USER_KEY
            );

            window.location.href =
                "../index.html";

        }
    );

}


/* =========================================================
   LIVE SYNC FROM OTHER TABS/PAGES

   The browser fires a native "storage" event on every OTHER
   open tab/page whenever localStorage changes (it never fires
   in the tab that made the change). This lets Dashboard pick
   up profile edits made on the Profile page in another tab
   without requiring a reload.
========================================================= */

window.addEventListener("storage", (event) => {

    if (event.key === USERS_KEY || event.key === CURRENT_USER_KEY) {

        const refreshed = loadLatestUser();

        if (!refreshed) return;

        currentUser = refreshed;

        if (userName) {

            userName.textContent =
                refreshed.name || "User";

        }

        renderOptionalProfileInfo(refreshed);

    }

});