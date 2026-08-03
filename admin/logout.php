<?php require_once __DIR__ . "/../include/adminCore.php";
agvs_admin_start();
$_SESSION = [];
session_destroy();
header("Location: login.php");
