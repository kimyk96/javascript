// getHtmls
function init(){
    $("#header").load("./html/header.html");
    $("#nav").load("./html/nav.html");
    $("#aside").load("./html/aside.html");
    $("#footer").load("./html/footer.html");
}

// get게시물리스트
function getList() {
    // url 가져오기 - 없으면 초기화
    const CURRENT_URL = new URL(location.href);
    const SEARCH = CURRENT_URL.searchParams;
    let pageno = SEARCH.get('pageno') ? SEARCH.get('pageno') : 1;

    $.ajax({
        method: 'get',
        url: 'http://192.168.0.34:8081/board/all',
        data: { pageno }
    }).done((response) => {
        console.log(response)
        printList(response.boardList, response.pageno);   // print게시물리스트
        printPagi(response.totalcount, response.pageno, response.pagesize); // print페지네이션
    }).fail((response) => {
        console.log(response);
    });
}

// print게시물리스트
function printList(boardList, pageno){
    const $LIST = $("#list").empty();
    for({bno, title, writer, writeTime, readCnt, attachment} of boardList){
        let $LIST_ITEM = $("<li></li>").attr("data-no", bno).appendTo($LIST);
        let $LIST_ITEM_LINK = $("<a></a>").attr("href", `./read.html?bno=${bno}&pageno=${pageno}`).appendTo($LIST_ITEM);
        let $LIST_ITEM_DIV1 = $("<div></div>").addClass("img").appendTo($LIST_ITEM_LINK);
        $(`<img />`).attr("src", attachment).appendTo($LIST_ITEM_DIV1);
        let $LIST_ITEM_DIV2 = $("<div></div>").addClass("info").appendTo($LIST_ITEM_LINK);
        $(`<p></p>`).text(title).addClass("title").appendTo($LIST_ITEM_DIV2);
        $(`<p></p>`).text(writeTime).addClass("writeTime").appendTo($LIST_ITEM_DIV2);
        let $LIST_ITEM_DIV3 = $("<div></div>").addClass("bottom").appendTo($LIST_ITEM_LINK);
        
        $(`<p></p>`).text(`by ${writer}`).addClass("writer").appendTo($LIST_ITEM_DIV3);
        $(`<p></p>`).text(`조회수 : ${readCnt}`).addClass("readcnt").appendTo($LIST_ITEM_DIV3);
    };
};

// print페지네이션
function printPagi(total, pageno, pagesize){
    const $PAGI = $("#pagination");
    const TOTAL = Math.ceil(total/pagesize);
    const COLUMN = 5;   // pagination column length

    // 시작점, 끝점
    let start = Math.floor((pageno - 1) / COLUMN) * COLUMN + 1;
    let end = start + (COLUMN - 1);
    end = end > TOTAL ? TOTAL : end;

    // 이전 페이지
    let prev = pageno > COLUMN ? true : false;

    // 다음페이지
    let next = pageno <= TOTAL - (TOTAL % COLUMN) ? true : false;

    // 노출
    // 이전버튼
    if (prev) {
        $PAGI.append(`<li><a href="?pageno=${start - 1}">&lt&lt</a></li>`);
    }
    // 페이징 버튼
    for (let i = 0; i < COLUMN; i++) {
        if (start + i == pageno) {
            $PAGI.append(
                `<li><a href="?pageno=${start + i}" class="now">${
                    start + i
                }</a></li>`
            );
        } else {
            if (start + i <= TOTAL) {
                $PAGI.append(
                    `<li><a href="?pageno=${start + i}">${start + i}</a></li>`
                );
            }
        }
    }
    // 다음버튼
    if (next) {
        $PAGI.append(`<li><a href="?pageno=${end + 1}">&gt&gt</a></li>`);
    }
}

// get아티클
function getArticle(bno, pageno) {
    $.ajax({
        method: 'get',
        url: `http://192.168.0.34:8081/board/${bno}`,
    }).done((response) => {
        $(document).attr("title", response.title); 
        printArticle(response, pageno);   // print아티클
    }).fail((response) => {
        alert(response.responseText);
        location.href = `./index.html?pageno=${pageno}`;
    });
}

// print아티클
function printArticle({bno, attachment, content, readCnt, title, writeTime, writer}, pageno){
    const $SECTION = $("#section").empty();
    let $ARTICLE = $("<article></article>").attr("data-no", bno).appendTo($SECTION);
    let $DIV2 = $("<div></div>").addClass("info").appendTo($ARTICLE);

    console.log(pageno)

    if(location.href.includes("edit")){
        $(`<a></a>`).text("수정완료").addClass("btn_edit").attr("onclick", `postArticle('PUT', ${bno}, ${pageno})`).appendTo($('#header div'));
        $(`<input>`).val(title).addClass("title").appendTo($DIV2);
        $(`<label for="writer"></label>`).text("작성자 : ").appendTo($DIV2);
        $(`<input>`).val(writer).addClass("writer").attr("name", "writer").appendTo($DIV2);
        $(`<label for="fileUpload"><img id="uploadImg" src="${attachment}" alt="눌러서 선택" /></label>`).appendTo($DIV2);
        $(`<input type="file" id="fileUpload" name="attachment" accept="image/png, image/jpeg, image/gif">`).appendTo($DIV2);
        $(`<textarea onkeydown="resize()"></textarea>`).val(content).addClass("content").appendTo($DIV2);
    }else{
        $(`<a></a>`).text("수정").addClass("btn_edit").attr("href", `./edit.html?bno=${bno}&pageno=${pageno}`).appendTo($('#header div'));
        $(`<a></a>`).text("삭제").addClass("btn_delete").attr("onclick",'deleteArticle();').appendTo($('#header div'));
        $(`<h2></h2>`).text(title).addClass("title").appendTo($DIV2);
        $(`<p></p>`).text(writer).addClass("writer").appendTo($DIV2);
        $(`<p></p>`).text(writeTime).addClass("writeTime").appendTo($DIV2);
        $(`<p></p>`).text(`조회수 : ${readCnt}`).addClass("readCnt").appendTo($DIV2);
        $(`<img />`).attr("src", attachment).appendTo($DIV2);
        $(`<p></p>`).text(content).addClass("content").appendTo($DIV2);
    }
};

// textarea resize
function resize(obj) {
    const $TEXTAREA = $(".content");
    $TEXTAREA.css("height", $TEXTAREA.prop('scrollHeight'));
}

// post아티클
function postArticle(type, bno, pageno){

    console.log(pageno)

    // 작성 필드 확인
    const title = $('.title');
    const writer = $('.writer');
    const content = $('.content');
    if(!title.val()){
        alert("제목은 필수영역입니다.");
        title.focus();
        return;
    }else if(!writer.val()){
        alert("작성자는 필수영역입니다.");
        writer.focus();
        return;
    }else if(!content.val()){
        alert("글 내용 필수영역입니다.");
        content.focus();
        return;
    }
    
    let fd = new FormData();
    if(type=='PUT'){
        url = 'http://192.168.0.34:8081/board/' + bno;
        type
        fd.append("bno", bno);
    }else if( type='POST' ){
        url = 'http://192.168.0.34:8081/board/new';
        let img = $("#fileUpload")[0];
        if(img.files[0]){ fd.append("attachment", img.files[0]); }
    }
    fd.append("title", title.val());
    fd.append("writer", writer.val());
    fd.append("content", content.val());

    $.ajax({
        url: url,
        type: type,
        data: fd,
        contentType: false,
        processData: false,
    }).done((result) => {
        if(type=="POST"){
            alert("작성 완료!");
            location.href = "./index.html?";
        }else{
            alert("수정 완료!");
            location.href = `./index.html?pageno=${pageno}`;
        }
    });
}

// delete아티클
function deleteArticle(){
    // getUrlSearchParams
    const CURRENT_URL = new URL(location.href);
    const SEARCH = CURRENT_URL.searchParams;
    const bno = SEARCH.get('bno') ? SEARCH.get('bno') : 1;
    const pageno = SEARCH.get('pageno') ? SEARCH.get('pageno') : 1;

    $.ajax({
        url: 'http://192.168.0.34:8081/board/' + bno,
        type: "DELETE",
    }).done((result) => {
        alert("삭제 완료!");
        location.href = `./index.html?pageno=${pageno}`;
    });
}


