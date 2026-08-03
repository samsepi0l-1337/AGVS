<?php require_once __DIR__ . "/../include/adminCore.php";
$error = "";
if (
	$_SERVER["REQUEST_METHOD"] === "POST" &&
	!agvs_admin_login((string) ($_POST["password"] ?? ""))
) {
	$error = "로그인 정보를 확인해 주세요.";
} elseif (agvs_admin_logged_in()) {
	header("Location: index.php");
	exit();
}
?>
<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="assets/admin.css"><title>AGVS 관리자 로그인</title></head><body class="login"><form method="post"><h1>AGVS 관리자</h1><p>환경변수 <code>AGVS_ADMIN_PASSWORD_HASH</code>를 설정한 계정으로 로그인합니다.</p><?php if (
	$error
): ?><p class="error"><?= $error ?></p><?php endif; ?><label>비밀번호<input type="password" name="password" required autofocus></label><button>로그인</button></form></body></html>
