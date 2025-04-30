const API_URL = "http://localhost/gym_php/api/auth.php";

document
  .getElementById("signup-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const submitBtn = document.querySelector(
      "#signup-form button[type='submit']"
    );
    const originalBtnText = submitBtn.textContent;

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account...";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          is_signup: true,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.token) {
        console.log("Account created successfully:", data);

        localStorage.setItem("jwt_token", JSON.stringify(data.token));
        localStorage.setItem("user_id", JSON.stringify(data.user.id));
        localStorage.setItem("username", JSON.stringify(data.user.username));
        localStorage.setItem("email", JSON.stringify(data.user.email));

        window.location.href = "index.html";
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error:", error);

      const errorElement =
        document.getElementById("signup-error") ||
        document.createElement("div");

      errorElement.id = "signup-error";
      errorElement.className = "error-message";
      errorElement.textContent = error.message;
      errorElement.style.display = "block";
      errorElement.style.color = "red";
      errorElement.style.margin = "10px 0";

      if (!document.getElementById("signup-error")) {
        this.insertBefore(errorElement, this.querySelector("p"));
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
