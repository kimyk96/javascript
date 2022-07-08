/*-----------------------게시판 관련-----------------------*/
// 보드전체 불러오기
function getBoard(pageno, bno) {
	$('main section').load(`./fragment/list.html`);

	$.ajax({
		url: `http://192.168.0.34:8081/board/all`,
		method: 'GET',
		data: { pageno },
	})
		.done((res) => {
			printBoard(res); // 게시판 전체 노출
			printPagi(res.totalcount, res.pageno, res.pagesize); // 페저네이션 노출
      console.log(res)
		})
		.fail((e) => {
      if(e.status==0){
        alert("서버가 꺼져있습니다.")
      }else{
        alert(e.responseText);
      }
      $('main section').load('./fragment/error.html');
		});
}

// 보드전체 노출
function printBoard(res) {
	const $TBODY = $('tbody');
	for (const article of res.boardList) {
		const $TR = $('<tr></tr>')
			.attr('onclick', `getArticle(${res.pageno}, ${article.bno})`)
			.appendTo($TBODY);
		$('<td></td>').text(article.bno).addClass('bno').appendTo($TR);
		$('<td></td>').text(article.title).addClass('title').appendTo($TR);
		$('<td></td>').text(article.writer).addClass('writer').appendTo($TR);
		$('<td></td>')
			.text(article.writeTime)
			.addClass('writeTime')
			.appendTo($TR);
		$('<td></td>').text(article.readCnt).addClass('readCnt').appendTo($TR);
	}
	// const $TFOOT = $('#pagination').append('<ul class="pagination"></ul>');
}

// print페지네이션
function printPagi(total, pageno, pagesize) {
	const $PAGI = $('#pagination');
	const TOTAL = Math.ceil(total / pagesize);
	const COLUMN = 5; // pagination column length

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
		$PAGI.append(`<li class="page-item"><a href="?pageno=${start - 1}" class="page-link">&lt&lt</a></li>`);
	}
	// 페이징 버튼
	for (let i = 0; i < COLUMN; i++) {
		if (start + i == pageno) {
			$PAGI.append(
				`<li class="page-item active"><a href="?pageno=${start + i}" class="page-link">${
					start + i
				}</a></li>`
			);
		} else {
			if (start + i <= TOTAL) {
				$PAGI.append(
					`<li class="page-item"><a href="?pageno=${start + i}" class="page-link">${start + i}</a></li>`
				);
			}
		}
	}
	// 다음버튼
	if (next) {
		$PAGI.append(`<li class="page-item"><a href="?pageno=${end + 1}" class="page-link">&gt&gt</a></li>`);
	}
}

/*-----------------------게시글 관련-----------------------*/

// get 게시글
function getArticle(pageno, bno) {
	$('main section').load(`./fragment/read.html`);

	$.ajax({
		url: `http://192.168.0.34:8081/board/${bno}`,
		method: 'GET',
	})
		.done((res) => {
			printArticle(res); // 단일 게시물 노출
			$('#read .goback').attr('onclick', `getBoard(${pageno}, ${bno})`);
		})
		.fail((e) => {
			alert(e.responseText);
			getBoard(pageno, bno);
		});
}

// post 게시글
function postArticle() {
	const title = $('#write .title');
	const writer = $('#write .writer');
	const content = $('#write .content');
	if (!title.val()) {
		alert('제목은 필수영역입니다.');
		title.focus();
		return;
	} else if (!writer.val()) {
		alert('작성자는 필수영역입니다.');
		writer.focus();
		return;
	} else if (!content.val()) {
		alert('글 내용 필수영역입니다.');
		content.focus();
		return;
	}
	let fd = new FormData();
	let img = $('#fileUpload')[0];
	if (img.files[0]) {
		fd.append('attachment', img.files[0]);
	}
	fd.append('title', title.val());
	fd.append('writer', writer.val());
	fd.append('content', content.val());
	$.ajax({
		url: 'http://192.168.0.34:8081/board/new',
		type: 'POST',
		data: fd,
		contentType: false,
		processData: false,
	}).done((result) => {
		alert('작성완료');
		getBoard(1, 0);
	});
}

// 게시글 작성
function loadWrite() {
	$('main section').load(`./fragment/write.html`);
}

// 게시물 노출
function printArticle(res) {
	$('#read .title').text(res.title);
	$('#read .content').text(res.content);
	$('#read .writer').text(res.writer);
	$('#read .writeTime').text(res.writeTime);
	$('#read .readCnt').text("조회수 : " + res.readCnt);
	$('#read .attachment').append(
		`<img src="${res.attachment}" alt="res.title">`
	);
}

/*-----------------------공통 부분-----------------------*/
// 공통 레이아웃
function init() {
	$('header').load('./fragment/header.html');
	$('nav').load('./fragment/nav.html');
	$('aside').load('./fragment/aside.html');
	$('footer').load('./fragment/footer.html');
}
// searchParams조사
function searchParams() {
	const href = new URL(location.href);
	const search = href.searchParams;
	let pageno = search.get('pageno') ? search.get('pageno') : 1;
	let bno = search.get('bno') ? search.get('bno') : 0;
	return { pageno, bno };
}
// textarea resize
function resize(obj) {
	const $TEXTAREA = $('.content');
	$TEXTAREA.css('height', $TEXTAREA.prop('scrollHeight'));
}
