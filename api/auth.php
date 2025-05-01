<?php
// CORS Headers Configuration 
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle OPTIONS requests (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
require_once '../config/database.php';
require_once '../JWT/JWT.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Secret key for JWT signing (should be strong and kept secure)
$secret_key = "your_very_strong_secret_key_here!@#$%^&*()";

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'error' => "Method not allowed"]);
    exit;
}

// Get JSON input from request body
$data = json_decode(file_get_contents('php://input'), true);
// Check if this is a signup request
$isSignup = $data['is_signup'] ?? false;

// Check for required fields
if (empty($data['username']) || empty($data['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => "Username and password are required"]);
    exit;
}

// Main Authentication Logic
try {
    if ($isSignup) {
        // SIGNUP PROCESS
        // Check if username already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        
        if ($stmt->fetch()) {
            http_response_code(409); // Conflict
            throw new Exception("Username already exists");
        }

        // Create new user with hashed password
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([
            $data['username'], 
            password_hash($data['password'], PASSWORD_DEFAULT) // Secure password hashing
        ]);
        $userId = $pdo->lastInsertId();
        $message = "Account created successfully";
    } else {
        // LOGIN PROCESS
        // Find user by username
        $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();

        // Verify credentials
        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401); // Unauthorized
            throw new Exception("Invalid login credentials");
        }
        $userId = $user['id'];
        $message = "Login successful";
    }

    // JWT TOKEN GENERATION
    $payload = [
        'iss' => 'your_domain.com', // Token issuer
        'iat' => time(), // Issued at time
        'exp' => time() + 36000, // Expiration time (10 hours)
        'data' => [ // Custom payload data
            'user_id' => $userId,
            'username' => $data['username']
        ]
    ];

    // Generate signed JWT token
    $jwt = JWT::encode($payload, $secret_key, 'HS256');
    
    // SUCCESS RESPONSE
    echo json_encode([
        'success' => true,
        'message' => $message,
        'token' => $jwt, // The JWT token for client-side storage
        'expires_in' => 36000, // Token lifetime in seconds
        'user' => [ // Basic user info
            'id' => $userId, 
            'username' => $data['username']
        ]
    ]);

} catch (Exception $e) {
    // ERROR HANDLING
    // Catch any exceptions and return error response
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}