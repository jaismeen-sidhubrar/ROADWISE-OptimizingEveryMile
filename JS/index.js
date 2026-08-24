/* =========================================================
   ROADWISE LANDING PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbar = document.getElementById("navbar");

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

const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.querySelector(".nav-links");

if (mobileMenu && navLinks) {

    mobileMenu.addEventListener("click", () => {

        navLinks.classList.toggle("mobile-active");

        if (navLinks.classList.contains("mobile-active")) {

            mobileMenu.textContent = "✕";

        } else {

            mobileMenu.textContent = "☰";

        }

    });

}


/* Close menu after clicking a link */

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("mobile-active");

        mobileMenu.textContent = "☰";

    });

});


/* =========================================================
   SCROLL REVEAL ANIMATION
========================================================= */

const revealElements =
    document.querySelectorAll(".reveal");

const observer =
    new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach((element) => {

    observer.observe(element);

});


/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

const sections =
    document.querySelectorAll("section[id]");

const navigationLinks =
    document.querySelectorAll(".nav-links a");


window.addEventListener("scroll", () => {

    let currentSection = "";


    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;

        const sectionHeight =
            section.offsetHeight;


        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navigationLinks.forEach(link => {

        link.classList.remove("active");


        const linkTarget =
            link.getAttribute("href");


        if (
            linkTarget ===
            `#${currentSection}`
        ) {

            link.classList.add("active");

        }

    });

});


/* =========================================================
   HERO CARD MOUSE MOVEMENT
========================================================= */

const heroImage =
    document.querySelector(".hero-image-area");

const floatingCard =
    document.querySelector(".hero-floating-card");


if (heroImage && floatingCard) {

    heroImage.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                heroImage.getBoundingClientRect();


            const x =
                (event.clientX - rect.left) /
                rect.width - 0.5;


            const y =
                (event.clientY - rect.top) /
                rect.height - 0.5;


            floatingCard.style.transform =
                `translate(${x * 12}px, ${y * 12}px)`;

        }
    );


    heroImage.addEventListener(
        "mouseleave",
        () => {

            floatingCard.style.transform =
                "translate(0, 0)";

        }
    );

}


/* =========================================================
   NUMBER COUNTER
========================================================= */

function animateNumber(
    element,
    target,
    duration = 1200
) {

    let start = 0;

    const increment =
        target / (duration / 16);


    const timer =
        setInterval(() => {

            start += increment;


            if (start >= target) {

                start = target;

                clearInterval(timer);

            }


            element.textContent =
                Math.floor(start)
                    .toLocaleString();

        }, 16);

}


/* =========================================================
   SMOOTH ANCHOR SCROLL
========================================================= */

document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    this.getAttribute("href");


                if (targetId === "#") return;


                const target =
                    document.querySelector(targetId);


                if (!target) return;


                event.preventDefault();


                target.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }
        );

    });


/* =========================================================
   SIGN UP / SIGN IN MODAL
========================================================= */

const signupModal =
    document.getElementById("signupModal");


const modalClose =
    document.getElementById("modalClose");


const signupTriggers =
    document.querySelectorAll(".open-signup");


/* =========================================================
   OPEN SIGN IN MODAL
========================================================= */

function openSignupModal(event) {

    if (event) {

        event.preventDefault();

    }


    if (!signupModal) return;


    signupModal.classList.add("active");

    document.body.classList.add("modal-open");


    /*
        IMPORTANT:
        Every Sign In / Start Planning / Route Planner
        link opens the SIGN IN form directly.
    */

    showLoginForm();

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeSignupModal() {

    if (!signupModal) return;


    signupModal.classList.remove("active");

    document.body.classList.remove("modal-open");

}


/* =========================================================
   OPEN SIGN IN BUTTONS
========================================================= */

signupTriggers.forEach(button => {

    button.addEventListener(
        "click",
        openSignupModal
    );

});


/* =========================================================
   CLOSE USING X
========================================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeSignupModal
    );

}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE MODAL
========================================================= */

if (signupModal) {

    signupModal.addEventListener(
        "click",
        (event) => {

            if (event.target === signupModal) {

                closeSignupModal();

            }

        }
    );

}


/* =========================================================
   CLOSE WITH ESC
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeSignupModal();

        }

    }
);


/* =========================================================
   SIGN UP / SIGN IN
========================================================= */

const signupForm =
    document.getElementById("signupForm");


/* =========================================================
   GET USERS
========================================================= */

function getUsers() {

    const users =
        localStorage.getItem("roadwiseUsers");


    return users
        ? JSON.parse(users)
        : [];

}


/* =========================================================
   SAVE USERS
========================================================= */

function saveUsers(users) {

    localStorage.setItem(
        "roadwiseUsers",
        JSON.stringify(users)
    );

}


/* =========================================================
   SIGN UP
========================================================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        handleSignup
    );

}


/* =========================================================
   SWITCH TO LOGIN
========================================================= */

const switchToLogin =
    document.getElementById("switchToLogin");


if (switchToLogin) {

    switchToLogin.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            showLoginForm();

        }
    );

}


/* =========================================================
   LOGIN FORM
========================================================= */

function showLoginForm() {

    if (!signupModal) return;


    const modal =
        signupModal.querySelector(".signup-modal");


    modal.innerHTML = `

        <button class="modal-close" id="modalClose">
            ×
        </button>


        <div class="modal-logo">

            <div class="logo-mark">
                R
            </div>

            <div class="logo-text">
                ROAD<span>WISE</span>
            </div>

        </div>


        <span class="modal-label">
            WELCOME BACK
        </span>


        <h2>

            Sign in.
            <br>

            <span>Keep moving.</span>

        </h2>


        <p class="modal-description">

            Sign in to continue planning smarter journeys.

        </p>


        <form id="loginForm">
            <div id="loginMessage" class="form-message"></div>

            <div class="form-group">

                <label for="loginEmail">
                    EMAIL
                </label>

                <input
                    type="email"
                    id="loginEmail"
                    placeholder="you@example.com"
                    required
                >

            </div>


            <div class="form-group">

                <label for="loginPassword">
                    PASSWORD
                </label>

                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Enter your password"
                    required
                >

            </div>


            <button
                type="submit"
                class="modal-submit"
            >

                Sign In

                <span>→</span>

            </button>

        </form>


        <div class="modal-bottom">

            Don't have an account?

            <a href="#" id="switchToSignup">
                Sign Up
            </a>

        </div>

    `;


    /* Close button */

    const newCloseButton =
        document.getElementById("modalClose");


    if (newCloseButton) {

        newCloseButton.addEventListener(
            "click",
            closeSignupModal
        );

    }


    /* Login form */

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    /* Switch to signup */

    const switchToSignup =
        document.getElementById("switchToSignup");


    if (switchToSignup) {

        switchToSignup.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                showSignupForm();

            }
        );

    }

}


/* =========================================================
   HANDLE LOGIN
========================================================= */

function handleLogin(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value
            .trim();

    const users = getUsers();

    const user =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase() &&
                user.password === password
        );

    if (!user) {

        const message = document.getElementById("loginMessage");

        message.textContent = "Invalid email or password.";
        message.className = "form-message error";

        return;
    }

    const currentUser = {

        name: user.name,

        email: user.email

    };

    localStorage.setItem(
        "roadwiseCurrentUser",
        JSON.stringify(currentUser)
    );



    /* Go to Dashboard */

    window.location.href =
        "Pages/dashboard.html";
}


/* =========================================================
   SHOW SIGNUP FORM AGAIN
========================================================= */

function showSignupForm() {

    if (!signupModal) return;


    const modal =
        signupModal.querySelector(".signup-modal");


    modal.innerHTML = `

        <button class="modal-close" id="modalClose">
            ×
        </button>


        <div class="modal-logo">

            <div class="logo-mark">
                R
            </div>

            <div class="logo-text">
                ROAD<span>WISE</span>
            </div>

        </div>


        <span class="modal-label">
            GET STARTED
        </span>


        <h2>

            Plan smarter.
            <br>

            <span>Move better.</span>

        </h2>


        <p class="modal-description">

            Create your RoadWise account and start planning
            more efficient journeys.

        </p>


        <form id="signupForm">


            <div id="signupMessage" class="form-message"></div>

            <div class="form-group">

                <label for="fullName">
                    FULL NAME
                </label>

                <input
                    type="text"
                    id="fullName"
                    placeholder="Enter your name"
                    required
                >

            </div>


            <div class="form-group">

                <label for="email">
                    EMAIL
                </label>

                <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    required
                >

            </div>


            <div class="form-group">

                <label for="password">
                    PASSWORD
                </label>

                <input
                    type="password"
                    id="password"
                    placeholder="Create a password"
                    minlength="8"
                    required
                >

                <small class="password-hint">
                    Password must be at least 8 characters and contain
                    an uppercase letter, lowercase letter, number, and special character.
                </small>

            </div>


            <button
                type="submit"
                class="modal-submit"
            >

                Create Account

                <span>→</span>

            </button>

        </form>


        <div class="modal-bottom">

            Already have an account?

            <a href="#" id="switchToLogin">
                Sign In
            </a>

        </div>

    `;


    /* Close button */

    const newCloseButton =
        document.getElementById("modalClose");


    if (newCloseButton) {

        newCloseButton.addEventListener(
            "click",
            closeSignupModal
        );

    }


    /* Signup form */

    const newSignupForm =
        document.getElementById("signupForm");


    if (newSignupForm) {

        newSignupForm.addEventListener(
            "submit",
            handleSignup
        );

    }


    /* Switch to login */

    const newSwitchToLogin =
        document.getElementById("switchToLogin");


    if (newSwitchToLogin) {

        newSwitchToLogin.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                showLoginForm();

            }
        );

    }

}


/* =========================================================
   HANDLE SIGNUP
========================================================= */

function handleSignup(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("fullName")
            .value
            .trim();

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value
            .trim();

    if (!name || !email || !password) {

        const message = document.getElementById("signupMessage");

        message.textContent = "Please fill in all the fields.";
        message.className = "form-message error";

        return;
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {

        const message = document.getElementById("signupMessage");

        message.textContent =
            "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character.";

        message.className = "form-message error";

        return;
    }

    const users = getUsers();

    const existingUser =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase()
        );

    if (existingUser) {

        const message = document.getElementById("signupMessage");

        message.textContent =
            "An account with this email already exists. Please sign in.";

        message.className = "form-message error";


        return;
    }

    const newUser = {

        name: name,

        email: email,

        password: password

    };

    users.push(newUser);

    saveUsers(users);

    const currentUser = {

        name: name,

        email: email

    };

    localStorage.setItem(
        "roadwiseCurrentUser",
        JSON.stringify(currentUser)
    );

    

    /* Go to Dashboard */

    window.location.href =
        "Pages/dashboard.html";
}


/* =========================================================
   PROTECTED ROUTE / PLANNING LINKS
========================================================= */

/*
    ONLY these types of links require Sign In:

    1. route-planner.html
    2. "Plan your first route" (.about-link)

    About / Partners / Users / How It Works
    are NOT affected.
*/

const protectedLinks =
    document.querySelectorAll(
        'a[href="route-planner.html"], a.about-link'
    );


protectedLinks.forEach(link => {

    link.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openSignupModal(event);

        }
    );

});


/* =========================================================
   REVIEW SLIDER
========================================================= */

const testimonialSlider =
    document.getElementById(
        "testimonialSlider"
    );


const reviewPrev =
    document.getElementById(
        "reviewPrev"
    );


const reviewNext =
    document.getElementById(
        "reviewNext"
    );


const reviewDots =
    document.querySelectorAll(
        ".review-dot"
    );


let currentReview = 0;


/* =========================================================
   GET REVIEW CARDS
========================================================= */

function getReviewCards() {

    if (!testimonialSlider) return [];


    return testimonialSlider.querySelectorAll(
        ".testimonial-card"
    );

}


/* =========================================================
   GET REVIEW STEP
========================================================= */

function getReviewStep() {

    const cards =
        getReviewCards();


    if (!cards.length) return 0;


    const cardWidth =
        cards[0].getBoundingClientRect().width;


    return cardWidth + 22;

}


/* =========================================================
   UPDATE REVIEW DOTS
========================================================= */

function updateReviewDots(index) {

    reviewDots.forEach((dot, i) => {

        dot.classList.toggle(
            "active",
            i === index
        );

    });

}


/* =========================================================
   NEXT REVIEW
========================================================= */

if (reviewNext) {

    reviewNext.addEventListener(
        "click",
        () => {

            const cards =
                getReviewCards();


            if (!cards.length) return;


            currentReview++;


            if (
                currentReview >=
                cards.length
            ) {

                currentReview = 0;

            }


            testimonialSlider.scrollTo({

                left:
                    currentReview *
                    getReviewStep(),

                behavior: "smooth"

            });


            updateReviewDots(
                currentReview
            );

        }
    );

}


/* =========================================================
   PREVIOUS REVIEW
========================================================= */

if (reviewPrev) {

    reviewPrev.addEventListener(
        "click",
        () => {

            const cards =
                getReviewCards();


            if (!cards.length) return;


            currentReview--;


            if (currentReview < 0) {

                currentReview =
                    cards.length - 1;

            }


            testimonialSlider.scrollTo({

                left:
                    currentReview *
                    getReviewStep(),

                behavior: "smooth"

            });


            updateReviewDots(
                currentReview
            );

        }
    );

}


/* =========================================================
   REVIEW DOTS
========================================================= */

reviewDots.forEach((dot, index) => {

    dot.addEventListener(
        "click",
        () => {

            currentReview = index;


            testimonialSlider.scrollTo({

                left:
                    currentReview *
                    getReviewStep(),

                behavior: "smooth"

            });


            updateReviewDots(
                currentReview
            );

        }
    );

});


/* =========================================================
   AUTOMATIC REVIEW SLIDER
========================================================= */

let reviewAutoSlide =
    setInterval(() => {

        if (!testimonialSlider) return;


        const cards =
            getReviewCards();


        if (!cards.length) return;


        currentReview++;


        if (
            currentReview >=
            cards.length
        ) {

            currentReview = 0;

        }


        testimonialSlider.scrollTo({

            left:
                currentReview *
                getReviewStep(),

            behavior: "smooth"

        });


        updateReviewDots(
            currentReview
        );

    }, 5000);


/* =========================================================
   STOP AUTO SLIDE ON HOVER
========================================================= */

if (testimonialSlider) {

    testimonialSlider.addEventListener(
        "mouseenter",
        () => {

            clearInterval(
                reviewAutoSlide
            );

        }
    );


    testimonialSlider.addEventListener(
        "mouseleave",
        () => {

            reviewAutoSlide =
                setInterval(() => {

                    const cards =
                        getReviewCards();


                    if (!cards.length) return;


                    currentReview++;


                    if (
                        currentReview >=
                        cards.length
                    ) {

                        currentReview = 0;

                    }


                    testimonialSlider.scrollTo({

                        left:
                            currentReview *
                            getReviewStep(),

                        behavior: "smooth"

                    });


                    updateReviewDots(
                        currentReview
                    );

                }, 5000);

        }
    );

}