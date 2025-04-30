<?php
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../JWT/JWTExceptionWithPayloadInterface.php';
require_once '../JWT/BeforeValidException.php';
require_once '../JWT/ExpiredException.php';
require_once '../JWT/SignatureInvalidException.php';
require_once '../JWT/JWT.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret_key = "your_very_strong_secret_key_here!@#$%^&*()";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  $isSignup = isset($data['is_signup']) && $data['is_signup'] === true;
  
  if ($isSignup) {
      if (!isset($data['username']) || !isset($data['password']) || !isset($data['email'])) {
          http_response_code(400);
          echo json_encode([
              'success' => false,
              'error' => "Username, password, and email are required"
          ]);
          exit;
      }
      
      if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
          http_response_code(400);
          echo json_encode([
              'success' => false,
              'error' => "Invalid email format"
          ]);
          exit;
      }
  } else {
      if (!isset($data['username']) || !isset($data['password'])) {
          http_response_code(400);
          echo json_encode([
              'success' => false,
              'error' => "Username and password are required"
          ]);
          exit;
      }
  }

  if ($isSignup) {
      $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
      $stmt->execute([$data['username'], $data['email']]);
      
      if ($existingUser = $stmt->fetch()) {
          http_response_code(409);
          $error = ($existingUser['username'] === $data['username']) ? 
                  "Username already exists" : "Email already exists";
          echo json_encode([
              'success' => false,
              'error' => $error
          ]);
          exit;
      }

      $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
      $stmt = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
      
      if ($stmt->execute([$data['username'], $hashedPassword, $data['email']])) {
          $userId = $pdo->lastInsertId();
          
          $payload = [
              'iss' => 'your_domain.com',
              'iat' => time(),
              'exp' => time() + 36000,
              'data' => [
                  'user_id' => $userId,
                  'username' => $data['username'],
                  'email' => $data['email']
              ]
          ];

          $jwt = JWT::encode($payload, $secret_key, 'HS256');
          
          echo json_encode([
              'success' => true,
              'message' => "Account created successfully",
              'token' => $jwt,
              'expires_in' => 36000,
              'user' => [
                  'id' => $userId,
                  'username' => $data['username'],
                  'email' => $data['email']
              ]
          ]);
      } else {
          http_response_code(500);
          echo json_encode([
              'success' => false,
              'error' => "Error creating account"
          ]);
      }
  }else {
        $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            $payload = [
                'iss' => 'your_domain.com',
                'iat' => time(),
                'exp' => time() + 36000,
                'data' => [
                    'user_id' => $user['id'],
                    'username' => $user['username']
                ]
            ];

            $jwt = JWT::encode($payload, $secret_key, 'HS256');
            
            echo json_encode([
                'success' => true,
                'message' => "Login successful",
                'token' => $jwt,
                'expires_in' => 36000,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => "Invalid login credentials"
            ]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => "Method not allowed"
    ]);
}
?>