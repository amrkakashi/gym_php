const logoutBtn = document.getElementById("logout-btn");
const authButtons = document.getElementById("auth-buttons");
const username = document.getElementById("username");
const addButton = document.getElementById("add-link");
function checkAuth() {
  return JSON.parse(localStorage.getItem("jwt_token")) !== null;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("username"));
}

function logout() {
  console.log("Logout");
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_id");
  localStorage.removeItem("email");
  window.location.href = "signin.html";
}

console.log(getCurrentUser());

function checkPageAccess() {
  const user = getCurrentUser();
  console.log(user);
  if (!user) {
    addButton.style.display = "none";
    logoutBtn.style.display = "none";
    authButtons.innerHTML = `
      <a href="signin.html">Sign In</a>
      <a href="signup.html">Sign Up</a>
    `;
  } else {

    username.textContent = `Welcome ${user}`;
    logoutBtn.style.display = "block";
  }
}
const isUserLoggedIn = checkAuth();

logoutBtn?.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", checkPageAccess);
