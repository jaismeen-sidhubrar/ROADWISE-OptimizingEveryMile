window.API_BASE_URL =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://YOUR-RENDER-SERVICE.onrender.com/api";