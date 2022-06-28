$(window).on("load", () => {
    // url 받아오기
    href = location.href;
    if (href.includes("pageno")) {
        let pageno = href.split("pageno=");
        let no = pageno[1].split("&");
        getContact(no[0]);
    } else {
        getContact(1);
    }

    // file 변경 감지 - 업로드 이미지 표시
    $("#fileUpload").change(function () {
        let $img = $("#uploadImg");
        var reader = new FileReader();
        reader.onload = function (e) {
            $img.attr("src", e.target.result);
            $img.attr("alt", "uploadImg");
        };
        reader.readAsDataURL(this.files[0]);
    });

    $("body").on("change", "input.info_imgInput", function () {
        let no = this.dataset.no;
        let $img = $(`#img${no}`);
        var reader = new FileReader();
        reader.onload = function (e) {
            $img.attr("src", e.target.result);
            $img.attr("alt", no);
        };
        reader.readAsDataURL(this.files[0]);
    });

    $("#list").on("change", "input", function () {
        let $li = $(this).closest("li");
        console.log(this);
        $li.css("border", "2px solid red");
    });
});

// 연락처 받아오기
function getContact(pageno) {
    $.ajax({
        url: "https://contactsvc.herokuapp.com/contacts/",
        type: "GET",
        data: { pageno: pageno, pagesize: 5 },
    })
        .done((result) => {
            const resultArray = result.contacts;
            const $list = $("#list");

            for (const person of resultArray) {
                const $LI = $(`<li></li>`)
                    .addClass("item")
                    .attr("data-no", `${person.no}`)
                    .appendTo($list);
                const $DIV = $(`<form id="f${person.no}"></form>`)
                    .addClass("person")
                    .appendTo($LI);
                const $LABEL = $(
                    `<label for="input${person.no}"></label>`
                ).appendTo($DIV);
                const $IMG = $(`<img>`)
                    .addClass("person_photo")
                    .attr("id", `img${person.no}`)
                    .attr("src", `${person.photo}`)
                    .attr("alt", `${person.name}`)
                    .appendTo($LABEL);
                const $INFO = $(`<div></div>`)
                    .addClass("person_info")
                    .appendTo($DIV);
                $(
                    `<input type="file" name="photo" accept="image/png, image/jpeg, image/gif">`
                )
                    .attr("id", `input${person.no}`)
                    .attr("data-no", `${person.no}`)
                    .addClass("info_imgInput")
                    .appendTo($INFO);
                $(`<input disabled>`)
                    .attr("name", `${person.no}`)
                    .val(`no : ${person.no}`)
                    .addClass("info_no")
                    .appendTo($INFO);
                $(`<input>`)
                    .attr("name", `name`)
                    .val(`${person.name}`)
                    .addClass("info_name")
                    .appendTo($INFO);
                $(`<input>`)
                    .attr("name", `tel`)
                    .val(`${person.tel}`)
                    .addClass("info_tel")
                    .appendTo($INFO);
                $(`<input>`)
                    .attr("name", `address`)
                    .val(`${person.address}`)
                    .addClass("info_address")
                    .appendTo($INFO);
                const $BTN = $(`<div></div>`)
                    .addClass("info_btnarea")
                    .appendTo($INFO);
                $(`<button>수정</button>`)
                    .addClass("info_edit")
                    .attr("onclick", `putContact(${person.no}); return false;`)
                    .appendTo($BTN);
                $(`<button>삭제</button>`)
                    .addClass("info_delete")
                    .attr(
                        "onclick",
                        `deleteContact(${person.no}); return false;`
                    )
                    .appendTo($BTN);
            }

            // 페이징 처리
            pagination(result.pageno, result.pagesize, result.totalcount);
        })
        .fail({});
}

// 연락처 - 추가
function postContact() {
    let name = $(`#addName`);
    let tel = $(`#addTel`);
    let address = $(`#addAdd`);
    if (!name.val()) {
        alert("이름은 필수 항목입니다.");
        name.focus();
        return;
    } else if (!tel.val()) {
        alert("번호는 필수 항목입니다.");
        tel.focus();
        return;
    } else if (!address.val()) {
        alert("주소는 필수 항목입니다.");
        address.focus();
        return;
    } else {
        let formData = $(`#contact1`).serialize();
        $.ajax({
            url: "https://contactsvc.herokuapp.com/contacts/",
            type: "POST",
            data: formData,
        }).done((result) => {
            let input = $("#fileUpload")[0];
            if (input.files[0] == undefined) {
                location.reload();
            } else {
                putContactPhoto(result.no, "#fileUpload");
            }
        });
    }
}

// 연락처 - 삭제
function deleteContact(no) {
    $.ajax({
        url: "https://contactsvc.herokuapp.com/contacts/" + no,
        type: "DELETE",
    })
        .done((result) => {
            $(`#f${no}`).parent().empty();
            alert("연락처 삭제 완료!");
        })
        .fail((result) => {
            console.log(result);
        });
}

// 연락처 - 수정
function putContact(no) {
    let formData = $(`#f${no}`).serialize();
    $.ajax({
        url: "https://contactsvc.herokuapp.com/contacts/" + no,
        type: "PUT",
        data: formData,
    })
        .done((result) => {
            let input = $(`#input${no}`)[0];
            if (input.files[0] == undefined) {
                location.reload();
            } else {
                putContactPhoto(result.no, `#input${no}`);
            }
        })
        .fail((result) => {
            console.log(result);
        });
}

// 연락처 - 사진수정
function putContactPhoto(no, input) {
    // 이미지 업로드
    let fd = new FormData();
    let img = $(input)[0];
    fd.append("photo", img.files[0]);
    fd.append("no", no);

    $.ajax({
        url: `https://contactsvc.herokuapp.com/contacts/${no}/photo`,
        type: "POST",
        data: fd,
        contentType: false,
        processData: false,
    }).done((result) => {
        location.reload();
    });
}

// 페이징 처리 - 정석
function pagination(pageNo, pageSize, totalCount) {
    const $page = $("#pagination");
    const blockSize = 5;
    const pageCount = Math.ceil(totalCount / pageSize);

    // 시작점, 끝점
    let start = Math.floor((pageNo - 1) / blockSize) * blockSize + 1;
    let end = start + (blockSize - 1);
    end = end > pageCount ? pageCount : end;

    // 이전 페이지
    let prev = pageNo > blockSize ? true : false;

    // 다음페이지
    let next = pageNo <= pageCount - (pageCount % blockSize) ? true : false;

    // 노출
    // 이전버튼
    if (prev) {
        $page.append(`<li><a href="?pageno=${start - 1}">&lt&lt</a></li>`);
    }
    // 페이징 버튼
    for (let i = 0; i < blockSize; i++) {
        if (start + i == pageNo) {
            $page.append(
                `<li><a href="?pageno=${start + i}" class="now">${
                    start + i
                }</a></li>`
            );
        } else {
            if (start + i <= pageCount) {
                $page.append(
                    `<li><a href="?pageno=${start + i}">${start + i}</a></li>`
                );
            }
        }
    }
    // 다음버튼
    if (next) {
        $page.append(`<li><a href="?pageno=${end + 1}">&gt&gt</a></li>`);
    }
}

// 페이징 처리 - 현재 페이지 가운데
function pagination1(pageno, pagesize, total) {
    const $page = $("#pagination");
    const totalPage = Math.ceil(total / pagesize);
    let pageBlock = 3;

    // 가운데 버튼
    for (let i = pageno - 2; i < pageno + pageBlock; i++) {
        if (i == pageno) {
            $page.append(
                `<li><a href="?pageno=${i}" class="now">${i}</a></li>`
            );
        } else if (i > 0 && i <= totalPage) {
            $page.append(`<li><a href="?pageno=${i}">${i}</a></li>`);
        }
        if (i < 1) {
            pageBlock++;
        }
        if (i > totalPage) {
            const current = $("#pagination li:nth-child(1)").text();
            $page.prepend(
                `<li><a href="?pageno=${current - 1}">${current - 1}</a></li>`
            );
        }
    }

    // 이전 버튼
    if (pageno > pageBlock) {
        $page.prepend(
            `<li><a href="?pageno=${pageno - pageBlock}">&lt&lt</a></li>`
        );
    }

    // 다음 버튼
    if (pageno <= totalPage - pageBlock) {
        $page.append(
            `<li><a href="?pageno=${pageno + pageBlock}">&gt&gt</a></li>`
        );
    }
}
