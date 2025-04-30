const API_URL = "http://localhost/gym_php/api/auth.php";

document
  .getElementById("signin-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitBtn = document.querySelector(
      "#signin-form button[type='submit']"
    );
    const originalBtnText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in...";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      if (data.token) {
        console.log(data);
        console.log(data.token);
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

      const errorElement = document.getElementById("login-error");
      if (errorElement) {
        errorElement.textContent = error.message;
        errorElement.style.display = "block";
      } else {
        alert(error.message);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
