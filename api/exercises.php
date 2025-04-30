<?php
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once '../config/database.php';

require_once '../JWT/JWTExceptionWithPayloadInterface.php';
require_once '../JWT/BeforeValidException.php';
require_once '../JWT/ExpiredException.php';
require_once '../JWT/SignatureInvalidException.php';
require_once '../JWT/JWT.php';
require_once '../JWT/Key.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret_key = "your_very_strong_secret_key_here!@#$%^&*()";

function validateJWT() {
    global $secret_key;
    
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => "Kindly provide a valid token"]);
        exit;
    }
    
    $authHeader = $headers['Authorization'];
    list($jwt) = sscanf($authHeader, 'Bearer %s');
    
    if (!$jwt) {
        http_response_code(401);
        echo json_encode(['error' => "Kindly provide a valid token"]);
        exit;
    }
    
    try {
        $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
        return $decoded;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => "Kindly provide a valid token"]);
        exit;
    }
}
$token_data = validateJWT();
$user_id = $token_data->data->user_id;

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM exercises WHERE id = ? AND user_id = ?");
                $stmt->execute([$_GET['id'], $user_id]);
                $exercise = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($exercise) {
                    echo json_encode($exercise);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => "Exercise not found"]);
                }
            } else {
                $stmt = $pdo->prepare("SELECT * FROM exercises WHERE user_id = ? ORDER BY created_at DESC");
                $stmt->execute([$user_id]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
            break;
            
        case 'POST':
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
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                UPDATE exercises SET 
                name = ?, 
                description = ?, 
                muscle_group = ?, 
                difficulty_level = ?, 
                equipment_needed = ? 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([
                $data['name'],
                $data['description'],
                $data['muscle_group'],
                $data['difficulty_level'],
                $data['equipment_needed'],
                $data['id'],
                $user_id
            ]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => "Exercise updated successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Exercise not found or you do not have permission to modify it']);
            }
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("DELETE FROM exercises WHERE id = ? AND user_id = ?");
            $stmt->execute([$data['id'], $user_id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => "Exercise deleted successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Exercise not found or you do not have permission to delete it']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => "Method not allowed"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => "Error in database: " . $e->getMessage()]);
}
?>