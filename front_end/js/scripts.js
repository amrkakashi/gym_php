// API Configuration
const API_URL = "http://localhost/gym_project/api/exercises.php";
const token = localStorage.getItem("jwt_token");

// Fetches and displays all exercises from the API
const fetchExercisesData = async () => {
  try {
    // Fetch exercises from API
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch exercises");
    const exercises = await response.json();
    const exercisesContainer = document.getElementById("exercises-container");
    const mainContent = document.getElementById("main-content");
    // Clear existing content
    exercisesContainer.innerHTML = "";
    // Handle empty results
    if (exercises.length === 0) {
      mainContent.innerHTML += '<p class="no-exercises">No exercises found</p>';
      return;
    }
    // Render exercises
    exercisesContainer.innerHTML = exercises
      .map(
        (exercise) => `
      <div class="exercise">
        <h3>${exercise.name}</h3>
        <p><span>Muscle Group:</span> ${exercise.muscle_group}</p>
        <p><span>Difficulty Level:</span> ${exercise.difficulty_level}</p>
        <p><span>Equipment Needed:</span> ${exercise.equipment_needed}</p>
        <p><span>Description:</span> ${exercise.description}</p>
        <div class="btn-container">
          <button class="btn btn-edit" onclick="editExercise(${exercise.id})">Edit</button>
          <button class="btn btn-delete" onclick="deleteExercise(${exercise.id})">Delete</button>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load exercises");
  }
};

const deleteExercise = async (id) => {
  // Confirmation dialog
  const confirmDelete = confirm(
    "Are you sure you want to delete this exercise?"
  );
  if (confirmDelete) {
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete exercise");
      // Refresh exercises list after deletion
      fetchExercisesData();
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

const editExercise = (id) => {
  window.location.href = `edit.html?id=${id}`;
};

// Initialize page when DOM loads
window.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  if (!localStorage.getItem("jwt_token")) {
    window.location.href = "signin.html";
    return;
  }

  // Clear container and load exercises
  document.getElementById("exercises-container").innerHTML = "";
  fetchExercisesData();
});
