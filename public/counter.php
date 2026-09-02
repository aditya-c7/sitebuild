<?php
// Simple unique visitor counter - file based, no database needed
// Upload this file + visitors.json (empty) to any PHP hosting
// Works with the JS snippet below

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'unknown';
$ip = explode(',', $ip)[0];
$ip = trim($ip);

$dataFile = __DIR__ . '/visitors.json';

// Init file if missing
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode(['count' => 0, 'ips' => []]));
}

$data = json_decode(file_get_contents($dataFile), true);
if (!$data) $data = ['count' => 0, 'ips' => []];

$action = $_GET['action'] ?? 'get';

if ($action === 'hit') {
    // only count once per IP
    if (!in_array($ip, $data['ips'])) {
        $data['ips'][] = $ip;
        $data['count'] = count($data['ips']);
        file_put_contents($dataFile, json_encode($data));
    }
    echo json_encode(['value' => $data['count'], 'unique' => true]);
} else {
    // get current count without increment
    echo json_encode(['value' => $data['count']]);
}
