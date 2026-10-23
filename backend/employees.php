<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonBody(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    if (!is_array($data)) {
        respond(400, ['message' => 'Request body must be valid JSON.']);
    }
    return $data;
}

function validateEmployee(array $data): array {
    $name = trim((string)($data['name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $role = trim((string)($data['role'] ?? ''));

    if ($name === '' || $email === '' || $role === '') {
        respond(422, ['message' => 'Name, email, and role are required.']);
    }
    if (mb_strlen($name) > 120 || mb_strlen($role) > 120 || mb_strlen($email) > 190) {
        respond(422, ['message' => 'One or more fields exceed the allowed length.']);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(422, ['message' => 'Please provide a valid email address.']);
    }
    return ['name' => $name, 'email' => $email, 'role' => $role];
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
$idFromPath = null;
if (preg_match('~/employees(?:\.php)?/(\d+)/?$~', $path, $matches)) {
    $idFromPath = (int)$matches[1];
}

try {
    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT id, name, email, `role`, created_at FROM employees ORDER BY id DESC');
        respond(200, ['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $employee = validateEmployee(readJsonBody());
        $stmt = $pdo->prepare('INSERT INTO employees (name, email, `role`) VALUES (:name, :email, :role)');
        $stmt->execute($employee);
        $id = (int)$pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT id, name, email, `role`, created_at FROM employees WHERE id = :id');
        $stmt->execute(['id' => $id]);
        respond(201, ['message' => 'Employee created successfully.', 'data' => $stmt->fetch()]);
    }

    if ($method === 'PUT') {
        $id = $idFromPath ?: filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            respond(400, ['message' => 'A valid employee id query parameter is required.']);
        }
        $employee = validateEmployee(readJsonBody());
        $employee['id'] = $id;
        $stmt = $pdo->prepare('UPDATE employees SET name = :name, email = :email, `role` = :role WHERE id = :id');
        $stmt->execute($employee);

        $stmt = $pdo->prepare('SELECT id, name, email, `role`, created_at FROM employees WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $updated = $stmt->fetch();
        if (!$updated) {
            respond(404, ['message' => 'Employee not found.']);
        }
        respond(200, ['message' => 'Employee updated successfully.', 'data' => $updated]);
    }

    if ($method === 'DELETE') {
        $id = $idFromPath ?: filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            respond(400, ['message' => 'A valid employee id query parameter is required.']);
        }
        $stmt = $pdo->prepare('DELETE FROM employees WHERE id = :id');
        $stmt->execute(['id' => $id]);
        if ($stmt->rowCount() === 0) {
            respond(404, ['message' => 'Employee not found.']);
        }
        respond(200, ['message' => 'Employee deleted successfully.']);
    }

    header('Allow: GET, POST, PUT, DELETE, OPTIONS');
    respond(405, ['message' => 'Method not allowed.']);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        respond(409, ['message' => 'That email address is already in use.']);
    }
    respond(500, ['message' => 'A database error occurred. Check the server configuration.']);
}
