const API_BASE_URL = "http://localhost/gym_php/api/exercises.php";

// Check authentication status
if (!localStorage.getItem("jwt_token")) {
  window.location.href = "signin.html";
}

// ADD EXERCISE FUNCTIONALITY
const setupAddExerciseForm = () => {
  const addForm = document.getElementById("add-form");
  if (!addForm) return;

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Get form values
    const formData = {
      name: document.getElementById("name").value.trim(),
      description: document.getElementById("description").value.trim(),
      muscle_group: document.getElementById("muscle_group").value,
      difficulty_level: document.getElementById("difficulty_level").value,
      equipment_needed: document.getElementById("equipment_needed").value,
    };
    try {
      // Validate form
      if (Object.values(formData).some((field) => !field)) {
        throw new Error("Please fill all fields");
      }
      // Submit to API
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Handle response
      if (!response.ok) throw new Error(data.error || "Failed to add exercise");
      if (!data.id) throw new Error("Invalid server response");

      // Redirect on success
      window.location.href = "/front_end/index.html";
    } catch (error) {
      alert(error.message);
    }
  });
};

// EDIT EXERCISE FUNCTIONALITY
const setupEditExerciseForm = () => {
  const editForm = document.getElementById("edit-form");
  if (!editForm) return;
  // DOM Elements
  const nameInput = document.getElementById("name");
  const descriptionInput = document.getElementById("description");
  const muscleGroupInput = document.getElementById("muscle_group");
  const difficultyLevelInput = document.getElementById("difficulty_level");
  const equipmentNeededInput = document.getElementById("equipment_needed");
  // Fetch exercise data
  const exerciseId = new URLSearchParams(window.location.search).get("id");
  if (!exerciseId) return;

  const loadExerciseData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?id=${exerciseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load exercise");
      const exercise = await response.json();
      // Populate form
      nameInput.value = exercise.name;
      descriptionInput.value = exercise.description;
      muscleGroupInput.value = exercise.muscle_group;
      difficultyLevelInput.value = exercise.difficulty_level;
      equipmentNeededInput.value = exercise.equipment_needed;
    } catch (error) {
      console.error("Loading error:", error);
      alert("Failed to load exercise data");
    }
  };
  // Form submission handler
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      // Prepare form data
      const formData = {
        id: exerciseId,
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
        muscle_group: muscleGroupInput.value,
        difficulty_level: difficultyLevelInput.value,
        equipment_needed: equipmentNeededInput.value,
      };

      // Validate
      if (Object.values(formData).some((field) => !field && field !== "id")) {
        throw new Error("Please fill all fields");
      }

      // Submit to API
      const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Handle response
      if (!response.ok) throw new Error(data.error || "Update failed");

      // Redirect on success
      window.location.href = "/front_end/index.html";
    } catch (error) {
      alert(error.message);
    }
  });
  // Initialize edit page
  loadExerciseData();
};

// PAGE INITIALIZATION
// Determine which page we're on and initialize accordingly
if (document.getElementById("add-form")) {
  setupAddExerciseForm();
} else if (document.getElementById("edit-form")) {
  setupEditExerciseForm();
}
