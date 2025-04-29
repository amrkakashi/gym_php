<?php
header('Content-Type: application/json');
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
    
    
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'اسم المستخدم وكلمة المرور مطلوبان']);
        exit;
    }

    
    if (isset($data['action']) && $data['action'] == 'signup') {
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            http_response_code(409); 
            echo json_encode(['error' => 'اسم المستخدم موجود بالفعل']);
            exit;
        }

        
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

        
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([$data['username'], $hashedPassword]);

        
        http_response_code(201); 
        echo json_encode(['message' => 'تم التسجيل بنجاح']);
        exit;
    }

    
    $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->execute([$data['username']]);
    $user = $stmt->fetch();

    if ($user && password_verify($data['password'], $user['password'])) {
        $payload = [
            'iss' => 'your_domain.com',
            'iat' => time(),
            'exp' => time() + 3600,
            'data' => [
                'user_id' => $user['id'],
                'username' => $user['username']
            ]
        ];

        $jwt = JWT::encode($payload, $secret_key, 'HS256');
        
        echo json_encode([
            'token' => $jwt,
            'expires_in' => 3600
        ]);
    } else {
        http_response_code(401); 
        echo json_encode(['error' => 'بيانات الدخول غير صحيحة']);
    }
} else {
    http_response_code(405); 
    echo json_encode(['error' => 'طريقة الطلب غير مسموحة']);
}
?>
