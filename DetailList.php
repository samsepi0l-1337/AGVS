<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AGVS-ItemList</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./stlye/reset.css?ver=20260730d">
    <link rel="stylesheet" href="./stlye/layout.css?ver=20260730d">
    <link rel="stylesheet" href="./stlye/DetailList.css?ver=20260730d">
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main>
        <div class="TopBg"><!-- 백그라운드 이미지 넣어서 하기 백그라운드비지쓰면됨 -->
            <p>ALL Item</p><!--tittle에따라 이름변경되어야함ex)전체,AGV-->
        </div>
        <div class="ListTittleWrap">
            <div class="ListTittle">
                <ul><!--선택자 잡아서 전체 주거공간 사이에 ㅣ 만들기 마지막 선택자 잡아서 없애기 nth-of-type쓰면됨-->
                    <li><button>전체</button></li>
                    <li><button>AGV</button></li>
                    <li><button>ForkLift</button></li>
                    <li><button>Technology</button></li><!--라스트차일드 쓰면됨-->
                </ul>
            </div>
            <div class="SerchBar"></div><!--form태그 써서 서치바 만들기-->
        </div>
        <div class="ListItemWrap">
            <div class="Item001Wrap"><!--랩크기는 자유-->
                <div><img src="#" alt="아이템이미지1"></div><!--320x230-->
                <h3>Heavy Transpoter</h3><!--크기18px굵기700-->
            </div>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <script src="./js/main.js?ver=20260730d"></script>
</body>
</html>
