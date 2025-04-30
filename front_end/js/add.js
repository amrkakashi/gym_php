document
  .getElementById("add-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const muscle_group = document.getElementById("muscle_group").value;
    const difficulty_level = document.getElementById("difficulty_level").value;
    const equipment_needed = document.getElementById("equipment_needed").value;
    const submitBtn = document.querySelector(
      "#add-form button[type='submit']"
    );
    const originalBtnText = submitBtn.textContent;

    try {
      if (!name || !description || !muscle_group || !difficulty_level || !equipment_needed) {
        throw new Error("Please fill all fields");
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Adding exercise...";

      const response = await fetch("http://localhost/gym_php/api/exercises.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("jwt_token"))}`,
        },
        body: JSON.stringify({
          name,
          description,
          muscle_group,
          difficulty_level,
          equipment_needed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add exercise");
      }

      if (data.id) {
        console.log("Exercise added successfully:", data);

        window.location.href = "/front_end/index.html";
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error:", error);

      const errorElement = document.getElementById("add-error");
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

if (!isUserLoggedIn) {
  window.location.href = "signin.html";
}