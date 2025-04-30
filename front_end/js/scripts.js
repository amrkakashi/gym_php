const fetchExercisesData = async () => {
  const API_URL = "http://localhost/gym_php/api/exercises.php";
  const token = JSON.parse(localStorage.getItem("jwt_token")) || null;

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exercises");
    }

    const data = await response.json();

    const exercisesContainer = document.getElementById("exercises-container");
    const mainContent = document.getElementById("main-content");
    exercisesContainer.innerHTML = "";
    if (data.length === 0) {
      mainContent.innerHTML += '<p class="no-exercises">No exercises found</p>';
      return;
    }
    exercisesContainer.innerHTML = data
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

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching exercises:", error);

    throw error;
  }
};

window.addEventListener("DOMContentLoaded", () => {
  if (isUserLoggedIn) {
    const exercisesContainer = document.getElementById("exercises-container");
    const mainContent = document.getElementById("main-content");
    exercisesContainer.innerHTML = "";
    fetchExercisesData();
  }
});

const deleteExercise = async (id) => {
  const API_URL = `http://localhost/gym_php/api/exercises.php`;
  const token = JSON.parse(localStorage.getItem("jwt_token")) || null;

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then(async (result) => {
      if (result.value) {
        try {
          const response = await fetch(API_URL, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id }),
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to delete exercise");
          }

          const data = await response.json();
          console.log(data);

          fetchExercisesData();
        } catch (error) {
          console.error("Error deleting exercise:", error);
        }
      }
    });
};

const editExercise = async (id) => {
  window.location.href = `edit.html?id=${id}`;
};
if (!isUserLoggedIn) {
  window.location.href = "signin.html";
}