const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const muscleGroupInput = document.getElementById("muscle_group");
const difficultyLevelInput = document.getElementById("difficulty_level");
const equipmentNeededInput = document.getElementById("equipment_needed");

const getExerciseById = async (id) => {
  const API_URL = `http://localhost/gym_php/api/exercises.php?id=${id}`;
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
      throw new Error("Failed to fetch exercise");
    }

    const data = await response.json();

    nameInput.value = data.name;
    descriptionInput.value = data.description;
    muscleGroupInput.value = data.muscle_group;
    difficultyLevelInput.value = data.difficulty_level;
    equipmentNeededInput.value = data.equipment_needed;

    return data;
  } catch (error) {
    console.error("Error fetching exercise:", error);
    throw error;
  }
};

const id = new URLSearchParams(window.location.search).get("id");
if (id) {
  getExerciseById(id);
}

document
  .getElementById("edit-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = nameInput.value;
    const description = descriptionInput.value;
    const muscle_group = muscleGroupInput.value;
    const difficulty_level = difficultyLevelInput.value;
    const equipment_needed = equipmentNeededInput.value;

    const submitBtn = document.querySelector(
      "#edit-form button[type='submit']"
    );
    const originalBtnText = submitBtn.textContent;

    try {
      if (
        !name ||
        !description ||
        !muscle_group ||
        !difficulty_level ||
        !equipment_needed
      ) {
        throw new Error("Please fill all fields");
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Editing exercise...";

      const response = await fetch(
        "http://localhost/gym_php/api/exercises.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem("jwt_token")
            )}`,
          },
          body: JSON.stringify({
            id: +id,
            name,
            description,
            muscle_group,
            difficulty_level,
            equipment_needed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to edit exercise");
      }

      if (response.ok) {
        console.log("Exercise edited successfully:", data);
        window.location.href = "/front_end/index.html";
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error:", error);

      const errorElement = document.getElementById("edit-error");
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
