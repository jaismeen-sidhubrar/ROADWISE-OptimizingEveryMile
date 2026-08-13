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

    modalClose.addEventListener("click", closeSignupModal);

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
   SIGN UP FORM
========================================================= */

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const name =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();


        if (!name || !email || !password) {

            alert("Please fill in all the fields.");

            return;

        }


        /*
            Frontend-only demo.

            Replace this section later with your
            backend/API registration logic.
        */

        alert(
            `Welcome to RoadWise, ${name}!`
        );


        signupForm.reset();

        closeSignupModal();

    });

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

        }
    );

}

