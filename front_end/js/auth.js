// Get DOM elements or set to null if not found
const logoutBtn = document.getElementById("logout-btn") || null;
const authButtons = document.getElementById("auth-buttons") || null;
const usernameDisplay = document.getElementById("username") || null;
const addButton = document.getElementById("add-link") || null;
const authApiUrl = "http://localhost/gym_php/api/auth.php"; // API endpoint for authentication

// Check if user is authenticated by verifying JWT token in localStorage
function checkAuthStatus() {
  return localStorage.getItem("jwt_token") !== null;
}

// Get current user data from localStorage
function getCurrentUserData() {
  return {
    username: localStorage.getItem("username"),
  };
}

// Verify page access and update UI based on authentication status
function verifyPageAccess() {
  const userData = getCurrentUserData();

  // If user is not logged in
  if (!userData.username) {
    // Hide add button and logout button if they exist
    if (addButton) addButton.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  } else {
    // If user is logged in
    // Display welcome message with username
    if (usernameDisplay) {
      usernameDisplay.textContent = `Welcome ${userData.username}`;
    }
    // Show logout button
    if (logoutBtn) {
      logoutBtn.style.display = "block";
    }
  }
}

// Run verifyPageAccess when DOM is fully loaded
document.addEventListener("DOMContentLoaded", verifyPageAccess);

// Handle signin form submission
document
  .getElementById("signin-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const form = e.target;
    const usernameInput = form.username.value.trim();
    const passwordInput = form.password.value.trim();

    // Validate form inputs
    if (!usernameInput || !passwordInput) {
      alert("all fields are required");
      return;
    }

    try {
      // Send login request to API
      const response = await fetch(authApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const responseData = await response.json();

      // Handle API errors
      if (!response.ok) {
        throw new Error(responseData.message || "failed to login");
      }

      // Verify token exists in response
      if (!responseData.token) {
        throw new Error("invalid credentials");
      }

      // Store user data in localStorage
      localStorage.setItem("jwt_token", responseData.token);
      localStorage.setItem("user_id", responseData.user.id);
      localStorage.setItem("username", responseData.user.username);

      // Redirect to home page after successful login
      window.location.href = "index.html";
    } catch (error) {
      console.error("error", error);
      alert(error.message);
    }
  });

// Handle signup form submission
document
  .getElementById("signup-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const form = e.target;
    const usernameInput = form.username.value.trim();
    const passwordInput = form.password.value.trim();
    const confirmPasswordInput = form["confirm-password"].value.trim();

    // Verify password match
    if (passwordInput !== confirmPasswordInput) {
      alert("passwords do not match");
      return;
    }

    try {
      // Send signup request to API
      const response = await fetch(authApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          is_signup: true, // Flag to indicate this is a signup request
        }),
      });

      const responseData = await response.json();
      console.log(responseData);
      // Handle API errors
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to sign up");
      }

      // // Verify token exists in response
      if (!responseData.token) {
        throw new Error("invalid credentials");
      }

      // Store user data in localStorage
      localStorage.setItem("jwt_token", responseData.token);
      localStorage.setItem("user_id", responseData.user.id);
      localStorage.setItem("username", responseData.user.username);

      // Redirect to home page after successful signup
      window.location.href = "index.html";
    } catch (error) {
      console.error("error", error);
      alert(error.message);
    }
  });

// Add click event listener to logout button if it exists
if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

// Handle logout by clearing user data from localStorage and redirecting
function handleLogout() {
  // Remove all user-related data from localStorage
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");

  // Redirect to signin page
  window.location.href = "signin.html";
}
