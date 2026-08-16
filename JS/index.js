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

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
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

const sections = document.querySelectorAll("section[id]");
const navigationLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }

    });

    navigationLinks.forEach(link => {

        link.classList.remove("active");

        const linkTarget = link.getAttribute("href");

        if (linkTarget === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});


/* =========================================================
   HERO CARD MOUSE MOVEMENT
========================================================= */

const heroImage = document.querySelector(".hero-image-area");
const floatingCard = document.querySelector(".hero-floating-card");

if (heroImage && floatingCard) {

    heroImage.addEventListener("mousemove", (event) => {

        const rect = heroImage.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) / rect.width - 0.5;

        const y =
            (event.clientY - rect.top) / rect.height - 0.5;

        floatingCard.style.transform =
            `translate(${x * 12}px, ${y * 12}px)`;

    });


    heroImage.addEventListener("mouseleave", () => {

        floatingCard.style.transform =
            "translate(0, 0)";

    });

}


/* =========================================================
   NUMBER COUNTER
========================================================= */

function animateNumber(element, target, duration = 1200) {

    let start = 0;

    const increment = target / (duration / 16);

    const timer = setInterval(() => {

        start += increment;

        if (start >= target) {

            start = target;

            clearInterval(timer);

        }

        element.textContent =
            Math.floor(start).toLocaleString();

    }, 16);

}


/* =========================================================
   SMOOTH ANCHOR SCROLL
========================================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (event) {

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

    });

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


function openSignupModal(event) {

    if (event) {
        event.preventDefault();
    }

    if (!signupModal) return;

    signupModal.classList.add("active");

    document.body.classList.add("modal-open");

}


function closeSignupModal() {

    if (!signupModal) return;

    signupModal.classList.remove("active");

    document.body.classList.remove("modal-open");

}


/* Open popup */

signupTriggers.forEach(button => {

    button.addEventListener("click", openSignupModal);

});


/* Close using X */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeSignupModal
    );

}


/* Close when clicking outside modal */

if (signupModal) {

    signupModal.addEventListener("click", (event) => {

        if (event.target === signupModal) {
            closeSignupModal();
        }

    });

}


/* Close with ESC */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeSignupModal();
    }

});


/* =========================================================
   SIGN UP / SIGN IN
========================================================= */

const signupForm =
    document.getElementById("signupForm");


/*
    Get existing users from localStorage.

    If there are no users yet,
    create an empty array.
*/

function getUsers() {

    const users =
        localStorage.getItem("roadwiseUsers");

    return users ? JSON.parse(users) : [];

}


/*
    Save users array to localStorage
*/

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

    signupForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const name =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();


        /* Check empty fields */

        if (!name || !email || !password) {

            alert("Please fill in all the fields.");

            return;

        }


        /* Get existing users */

        const users = getUsers();


        /*
            Check whether this email
            is already registered.
        */

        const existingUser =
            users.find(
                user =>
                    user.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (existingUser) {

            alert(
                "An account with this email already exists. Please sign in."
            );

            return;

        }


        /*
            Create new user object
        */

        const newUser = {

            name: name,

            email: email,

            password: password

        };


        /*
            Add new user to users array
        */

        users.push(newUser);


        /*
            Save updated users array
            to localStorage
        */

        saveUsers(users);


        /*
            Store the currently logged-in user

            We don't need to store the password
            here because the next page only
            needs the user's information.
        */

        const currentUser = {

            name: name,

            email: email

        };


        localStorage.setItem(
            "roadwiseCurrentUser",
            JSON.stringify(currentUser)
        );


        /*
            Show success message
        */

        alert(
            `Welcome to RoadWise, ${name}!`
        );


        /*
            Clear the form
        */

        signupForm.reset();


        /*
            Close modal
        */

        closeSignupModal();


        /*
            Go to route planner
        */

        window.location.href =
            "Pages/dashboard.html";

    });

}


/* =========================================================
   SWITCH TO LOGIN
========================================================= */

const switchToLogin =
    document.getElementById("switchToLogin");


if (switchToLogin) {

    switchToLogin.addEventListener("click", (event) => {

        event.preventDefault();

        /*
            For now, create a simple login form
            using the existing modal.
        */

        showLoginForm();

    });

}


/* =========================================================
   LOGIN FORM
========================================================= */

function showLoginForm() {

    if (!signupModal) return;


    const modal =
        signupModal.querySelector(".signup-modal");


    /*
        Replace the existing signup form
        with the login form.
    */

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


    /*
        Close button
    */

    const newCloseButton =
        document.getElementById("modalClose");


    if (newCloseButton) {

        newCloseButton.addEventListener(
            "click",
            closeSignupModal
        );

    }


    /*
        Login form
    */

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    /*
        Switch back to signup
    */

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


    /* Get users */

    const users = getUsers();


    /*
        Find matching user
    */

    const user =
        users.find(
            user =>
                user.email.toLowerCase() ===
                    email.toLowerCase() &&
                user.password === password
        );


    /*
        Wrong email/password
    */

    if (!user) {

        alert(
            "Invalid email or password."
        );

        return;

    }


    /*
        Store logged-in user
    */

    const currentUser = {

        name: user.name,

        email: user.email

    };


    localStorage.setItem(
        "roadwiseCurrentUser",
        JSON.stringify(currentUser)
    );


    /*
        Login successful
    */

    alert(
        `Welcome back, ${user.name}!`
    );


    /*
        Go to route planner
    */

    window.location.href =
        "route-planner.html";

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
                    required
                >

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


    /*
        Close button
    */

    const newCloseButton =
        document.getElementById("modalClose");


    if (newCloseButton) {

        newCloseButton.addEventListener(
            "click",
            closeSignupModal
        );

    }


    /*
        Signup form
    */

    const newSignupForm =
        document.getElementById("signupForm");


    if (newSignupForm) {

        newSignupForm.addEventListener(
            "submit",
            handleSignup
        );

    }


    /*
        Switch to login
    */

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


    /*
        Check empty fields
    */

    if (!name || !email || !password) {

        alert(
            "Please fill in all the fields."
        );

        return;

    }


    /*
        Get existing users
    */

    const users = getUsers();


    /*
        Check if email already exists
    */

    const existingUser =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (existingUser) {

        alert(
            "An account with this email already exists. Please sign in."
        );

        return;

    }


    /*
        Create new user
    */

    const newUser = {

        name: name,

        email: email,

        password: password

    };


    /*
        Add user
    */

    users.push(newUser);


    /*
        Save users
    */

    saveUsers(users);


    /*
        Save current user
    */

    const currentUser = {

        name: name,

        email: email

    };


    localStorage.setItem(
        "roadwiseCurrentUser",
        JSON.stringify(currentUser)
    );


    /*
        Success
    */

    alert(
        `Welcome to RoadWise, ${name}!`
    );


    /*
        Go to route planner
    */

    window.location.href =
        "route-planner.html";

}


/* =========================================================
   REVIEW SLIDER
========================================================= */

const testimonialSlider =
    document.getElementById("testimonialSlider");

const reviewPrev =
    document.getElementById("reviewPrev");

const reviewNext =
    document.getElementById("reviewNext");

const reviewDots =
    document.querySelectorAll(".review-dot");


let currentReview = 0;


function getReviewCards() {

    if (!testimonialSlider) return [];

    return testimonialSlider.querySelectorAll(
        ".testimonial-card"
    );

}


function getReviewStep() {

    const cards = getReviewCards();

    if (!cards.length) return 0;

    const cardWidth =
        cards[0].getBoundingClientRect().width;

    return cardWidth + 22;

}


function updateReviewDots(index) {

    reviewDots.forEach((dot, i) => {

        dot.classList.toggle(
            "active",
            i === index
        );

    });

}


/* Next */

if (reviewNext) {

    reviewNext.addEventListener("click", () => {

        const cards = getReviewCards();

        if (!cards.length) return;

        currentReview++;

        if (currentReview >= cards.length) {
            currentReview = 0;
        }

        testimonialSlider.scrollTo({

            left:
                currentReview * getReviewStep(),

            behavior: "smooth"

        });

        updateReviewDots(currentReview);

    });

}


/* Previous */

if (reviewPrev) {

    reviewPrev.addEventListener("click", () => {

        const cards = getReviewCards();

        if (!cards.length) return;

        currentReview--;

        if (currentReview < 0) {

            currentReview =
                cards.length - 1;

        }

        testimonialSlider.scrollTo({

            left:
                currentReview * getReviewStep(),

            behavior: "smooth"

        });

        updateReviewDots(currentReview);

    });

}


/* Dots */

reviewDots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        currentReview = index;

        testimonialSlider.scrollTo({

            left:
                currentReview * getReviewStep(),

            behavior: "smooth"

        });

        updateReviewDots(currentReview);

    });

});


/* =========================================================
   AUTOMATIC REVIEW SLIDER
========================================================= */

let reviewAutoSlide =
    setInterval(() => {

        if (!testimonialSlider) return;

        const cards = getReviewCards();

        if (!cards.length) return;

        currentReview++;

        if (currentReview >= cards.length) {
            currentReview = 0;
        }

        testimonialSlider.scrollTo({

            left:
                currentReview * getReviewStep(),

            behavior: "smooth"

        });

        updateReviewDots(currentReview);

    }, 5000);


/* Stop automatic movement while user interacts */

if (testimonialSlider) {

    testimonialSlider.addEventListener(
        "mouseenter",
        () => {
            clearInterval(reviewAutoSlide);
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