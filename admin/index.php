<?php require_once __DIR__ . "/../include/adminCore.php";
agvs_admin_require_login();
agvs_admin_header("대시보드");
?>
<h1>콘텐츠 관리</h1><p>공개 페이지에 표시될 제품, AGV 영상, 자료실 콘텐츠를 관리합니다.</p><section class="cards"><a href="content.php?type=products">제품·카테고리·모델 관리</a><a href="content.php?type=videos">AGV 영상 관리</a><a href="content.php?type=archives">자료실 관리</a><a href="translate.php">번역 (i18n only)</a></section><?php agvs_admin_footer();
