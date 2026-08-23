/* =========================================================
   LOAD NAVBAR
========================================================= */

fetch("navbar.html")
    .then(response => response.text())
    .then(data => {

        document.getElementById("navbar-container").innerHTML = data;


        /* =====================================================
           ACTIVE NAV LINK
        ===================================================== */

        const currentPage =
            window.location.pathname.split("/").pop();

        document
            .querySelectorAll(".nav-links a")
            .forEach(link => {

                const linkPage =
                    link.getAttribute("href");

                if (linkPage === currentPage) {
                    link.classList.add("active");
                }

            });


        /* =====================================================
           LOGOUT
        ===================================================== */

        const logoutBtn =
            document.getElementById("logoutBtn");


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    showLogoutModal();

                }
            );

        }

    })
    .catch(error => {

        console.error(
            "Navbar error:",
            error
        );

    });



/* =========================================================
   LOGOUT MODAL
========================================================= */

function showLogoutModal() {

    const modal =
        document.createElement("div");

    modal.id = "logoutModal";

    modal.className =
        "delete-modal-overlay";


    modal.innerHTML = `

        <div class="delete-modal">

            <div class="delete-modal-content">

                <span class="delete-modal-label">
                    LOG OUT
                </span>

                <h3>
                    Log out of RoadWise?
                </h3>

                <p>
                    Are you sure you want to log out
                    of your RoadWise account?
                </p>

            </div>


            <div class="delete-modal-actions">

                <button
                    type="button"
                    class="delete-modal-back"
                    id="logoutModalBack"
                >
                    Back
                </button>

                <button
                    type="button"
                    class="delete-modal-confirm"
                    id="logoutModalConfirm"
                >
                    Log Out
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    /* BACK */

    document
        .getElementById("logoutModalBack")
        .addEventListener("click", function () {

            modal.remove();

        });


    /* CONFIRM */

    document
        .getElementById("logoutModalConfirm")
        .addEventListener("click", function () {

            localStorage.removeItem(
                "roadwiseCurrentUser"
            );

            window.location.href =
                "../index.html";

        });


    /* CLICK OUTSIDE */

    modal.addEventListener("click", function (event) {

        if (event.target === modal) {

            modal.remove();

        }

    });

}