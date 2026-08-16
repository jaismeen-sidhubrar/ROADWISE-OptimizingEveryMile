/* =========================================================
   ROADWISE PERSONALIZED DASHBOARD
========================================================= */


/* =========================================================
   GET CURRENT USER
========================================================= */

const currentUserData =
    localStorage.getItem("roadwiseCurrentUser");


/*
    If no user is logged in,
    send them back to the landing page.
*/

if (!currentUserData) {

    window.location.href = "../index.html";

}


/* =========================================================
   CONVERT STORED USER DATA
========================================================= */

let currentUser = null;


if (currentUserData) {

    try {

        currentUser =
            JSON.parse(currentUserData);

    } catch (error) {

        console.error(
            "Unable to read current user.",
            error
        );

        localStorage.removeItem(
            "roadwiseCurrentUser"
        );

        window.location.href =
            "../index.html";

    }

}



/* =========================================================
   DISPLAY USER NAME
========================================================= */

const userName =
    document.getElementById("userName");


if (currentUser && userName) {

    userName.textContent =
        currentUser.name;

}



/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbar =
    document.getElementById("navbar");


window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});



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

                    mobileMenu.textContent =
                        "☰";

                }

            }
        );

    });



/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            /*
                Remove only the logged-in user.

                We DO NOT remove roadwiseUsers
                because that contains registered
                accounts.
            */

            localStorage.removeItem(
                "roadwiseCurrentUser"
            );


            /*
                Go back to landing page.
            */

            window.location.href =
                "../index.html";

        }
    );

}



/* =========================================================
   DASHBOARD DATA
========================================================= */


/*
    These are temporary frontend values.

    Later your route planner can update
    these values when actual routes are created.
*/


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
    document.getElementById("footerLogout");


if (footerLogout) {

    footerLogout.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            localStorage.removeItem(
                "roadwiseCurrentUser"
            );

            window.location.href =
                "../index.html";

        }
    );

}