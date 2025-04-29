<?php
session_start();

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        header('Location: ../signin.php');
        exit();
    }
}

function getUserData($pdo, $userId) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function isExerciseOwner($pdo, $exerciseId, $userId) {
    $stmt = $pdo->prepare("SELECT id FROM exercises WHERE id = ? AND user_id = ?");
    $stmt->execute([$exerciseId, $userId]);
    return $stmt->fetch() !== false;
}
?>