const API_URL = "http://localhost:5000/api";

// --- Tab Switching ---
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".form").forEach(f => f.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab + "Form").classList.add("active");
    });
});

// --- Login ---
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || "Login failed";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
    } catch (err) {
        errorEl.textContent = "Server error. Try again later.";
    }
});

// --- Register ---
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("registerError");
    errorEl.textContent = "";

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || "Registration failed";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
    } catch (err) {
        errorEl.textContent = "Server error. Try again later.";
    }
});

// --- Auto Redirect if Already Logged In ---
if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
}
