<?php
// CORS Headers Configuration
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dependencies and Setup
require_once '../config/database.php';
require_once '../JWT/JWT.php'; 
require_once '../JWT/Key.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// JWT Configuration
$secret_key = "your_very_strong_secret_key_here!@#$%^&*()";

// Authentication Middleware
// Validates JWT token from Authorization header
function validateJWT() {
    global $secret_key;
    
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => "Authorization token required"]);
        exit;
    }
    // Extract token from "Bearer {token}" format
    $jwt = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    
    try {
        return JWT::decode($jwt, new Key($secret_key, 'HS256'));
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => "Invalid or expired token"]);
        exit;
    }
}

// Validate token and get user ID
$token_data = validateJWT();
$user_id = $token_data->data->user_id;

// Request Routing
try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // GET single exercise by ID
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM exercises WHERE id = ? AND user_id = ?");
                $stmt->execute([$_GET['id'], $user_id]);
                
                if ($exercise = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    echo json_encode($exercise);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => "Exercise not found"]);
                }
            } 
            // GET all exercises for user
            else {
                $stmt = $pdo->prepare("SELECT * FROM exercises WHERE user_id = ? ORDER BY created_at DESC");
                $stmt->execute([$user_id]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;
            
        case 'POST':
            // Create new exercise
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                INSERT INTO exercises 
                (user_id, name, description, muscle_group, difficulty_level, equipment_needed) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user_id,
                $data['name'],
                $data['description'],
                $data['muscle_group'],
                $data['difficulty_level'],
                $data['equipment_needed']
            ]);
            
            http_response_code(201);
            echo json_encode([
                'id' => $pdo->lastInsertId(),
                'message' => "Exercise created successfully"
            ]);
            break;
            
        case 'PUT':
            // Update existing exercise
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                UPDATE exercises SET 
                name = ?, description = ?, muscle_group = ?, 
                difficulty_level = ?, equipment_needed = ? 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([
                $data['name'], $data['description'], $data['muscle_group'],
                $data['difficulty_level'], $data['equipment_needed'],
                $data['id'], $user_id
            ]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Exercise not found or unauthorized']);
                break;
            }
            
            echo json_encode(['message' => "Exercise updated successfully"]);
            break;
            
        case 'DELETE':
            // Delete exercise
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("DELETE FROM exercises WHERE id = ? AND user_id = ?");
            $stmt->execute([$data['id'], $user_id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Exercise not found or unauthorized']);
                break;
            }
            
            echo json_encode(['message' => "Exercise deleted successfully"]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => "Method not allowed"]);
    }
    
} catch (PDOException $e) {
    // Database error handling
    http_response_code(500);
    echo json_encode(['error' => "Database error: " . $e->getMessage()]);
    
} catch (Exception $e) {
    // General error handling
    http_response_code(500);
    echo json_encode(['error' => "Server error: " . $e->getMessage()]);
}