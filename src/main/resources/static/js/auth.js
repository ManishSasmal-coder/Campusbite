var API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        // Prevent default submission
        loginForm.addEventListener("submit", (e) => e.preventDefault());
    }

    window.submitLogin = async function (role) {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!username || !password) {
            alert("Please enter username and password!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("user", JSON.stringify(data));
                if (data.role === "STUDENT") window.location.href = "student-dashboard.html";
                else if (data.role === "CHEF") window.location.href = "chef-dashboard.html";
                else if (data.role === "ADMIN") window.location.href = "admin-dashboard.html";
            } else {
                alert("Invalid credentials!");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    };

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const res = await fetch(`${API_URL}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, fullName, email_id: email, password })
                });

                if (res.ok) {
                    alert("Signup successful! Please login.");
                    window.location.href = "student-login.html";
                } else {
                    alert("Signup failed! Username may already exist.");
                }
            } catch (err) {
                console.error(err);
                alert("Server error");
            }
        });
    }
});

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}
