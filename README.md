# API Endpoints

## Exercises Endpoints

- **get all**  
  `GET` => `http://localhost/gym_php/api/exercises.php`  
  **Nedded data**: None  
  **Description**: Get all exercises for the authenticated user.

- **get one**  
  `GET` => `http://localhost/gym_php/api/exercises.php?id={id}`  
  **Nedded data**:  
  - `id`: The ID of the exercise to retrieve  
  **Description**: Get details of a specific exercise by ID.

- **add one**  
  `POST` => `http://localhost/gym_php/api/exercises.php`  
  **Nedded data**:
  - `name`: The name of the exercise
  - `description`: A description of the exercise
  - `muscle_group`: The muscle group targeted
  - `difficulty_level`: The difficulty level of the exercise
  - `equipment_needed`: The equipment needed for the exercise  
  **Description**: Add a new exercise for the authenticated user.

- **update one**  
  `PUT` => `http://localhost/gym_php/api/exercises.php`  
  **Nedded data**:
  - `id`: The ID of the exercise to update
  - `name`: The updated name of the exercise
  - `description`: The updated description
  - `muscle_group`: The updated muscle group
  - `difficulty_level`: The updated difficulty level
  - `equipment_needed`: The updated equipment needed  
  **Description**: Update an existing exercise.

- **delete one**  
  `DELETE` => `http://localhost/gym_php/api/exercises.php`  
  **Nedded data**:
  - `id`: The ID of the exercise to delete  
  **Description**: Delete an existing exercise.

## Authentication Endpoints

- **login**  
  `POST` => `http://localhost/gym_php/api/login.php`  
  **Nedded data**:
  - `username`: user name
  - `password`: password
  
- **signup**  
  `POST` => `http://localhost/gym_php/api/login.php`  
  **Nedded data**:
  - `username`: user name
  - `password`: password
  - `action`: needed for signup 
