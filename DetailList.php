<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AGVS-ItemList</title>
    <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
    >
    <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
    >
    <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
    rel="stylesheet"
    >
    <link
    rel="stylesheet"
    href="./stlye/reset.css?ver=20260801a"
    >
    <link
    rel="stylesheet"
    href="./stlye/layout.css?ver=20260801a"
    >
    <link
    rel="stylesheet"
    href="./stlye/DetailList.css?ver=20260801a"
    >
</head>
<body>
    <?php include __DIR__ . "/include/header.html"; ?>
    <main class="DetailListMain">
        <div class="TopBg"><!-- 백그라운드 이미지 넣어서 하기 백그라운드비지쓰면됨 -->
            <p>ALL Item</p><!--tittle에따라 이름변경되어야함ex)전체,AGV-->
        </div>
        <div class="DetailListInner">
            <div class="ListTittleWrap">
                <div class="ListTittle">
                    <ul><!--선택자 잡아서 전체 주거공간 사이에 ㅣ 만들기 마지막 선택자 잡아서 없애기 nth-of-type쓰면됨-->
                        <li>
                            <button type="button" class="isOn" data-category="all" aria-pressed="true" data-title="ALL Item">전체</button>
                        </li>
                        <li>
                            <button type="button" data-category="agv" aria-pressed="false" data-title="AGV">AGV</button>
                        </li>
                        <li>
                            <button type="button" data-category="forklift" aria-pressed="false" data-title="ForkLift">ForkLift</button>
                        </li>
                        <li>
                            <button type="button" data-category="technology" aria-pressed="false" data-title="Technology">Technology</button>
                        </li><!--라스트차일드 쓰면됨-->
                    </ul>
                </div>
                <div class="SerchBar"><!--form태그 써서 서치바 만들기-->
                    <form class="SerchForm" role="search" onsubmit="return false;">
                        <label class="SerchLabel" for="ItemSerch">아이템 검색</label>
                        <input type="search" id="ItemSerch" class="SerchInput" placeholder="검색어를 입력해 주세요" autocomplete="off">
                        <button type="submit" class="SerchBtn" aria-label="검색"></button>
                    </form>
                </div>
            </div>
            <div class="ListItemWrap">
                <div class="ItemWrap" data-category="agv"><!--랩크기는 자유-->
                    <a href="#">
                        <div class="ItemThumb"></div><!--320x230-->
                        <h3>
                            Heavy Transpoter
                        </h3><!--크기18px굵기700-->
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Cuil Transporting
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Excvator Assemble Line
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Disel Engine Assemble Line
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Box Transporting
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Aluminium DDiesasting Line
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Tire Foming Line
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="agv">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Tugging
                        </h3>
                        <p class="ItemCategory">AGV</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="forklift">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            1~2 Tone Application
                        </h3>
                        <p class="ItemCategory">ForkLift</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="forklift">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Heavy Application
                        </h3>
                        <p class="ItemCategory">ForkLift</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="technology">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            ACS
                        </h3>
                        <p class="ItemCategory">Technology</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="technology">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            System Design Tools
                        </h3>
                        <p class="ItemCategory">Technology</p>
                    </a>
                </div>
                <div class="ItemWrap" data-category="technology">
                    <a href="#">
                        <div class="ItemThumb"></div>
                        <h3>
                            Vehicle Controller
                        </h3>
                        <p class="ItemCategory">Technology</p>
                    </a>
                </div>
            </div>
            <p class="ListEmpty" hidden>검색 결과가 없습니다.</p>
        </div>
    </main>
    <?php include __DIR__ . "/include/footer.html"; ?>
    <script src="./js/main.js"></script>
</body>
</html>
