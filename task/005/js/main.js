// 날씨 파싱
function getWeather(city) {
    docOpacity1()
    var url = new URL(location.href);
    if (city.lat === null) {
        city = { lon: 126.7052, lat: 37.456, name: 'Incheon', country: 'KR' }
        url.searchParams.append('lon', city.lon);
        url.searchParams.append('lat', city.lat);
        url.searchParams.append('name', city.name);
        url.searchParams.append('country', city.country);
    } else {
        url.searchParams.set('lon', city.lon);
        url.searchParams.set('lat', city.lat);
        url.searchParams.set('name', city.name);
        url.searchParams.set('country', city.country);
    }
    history.pushState(city, '', url);
    $("#cityname").val(`${city.name}, ${city.country}`);

    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/onecall",
        type: "GET",
        data: {
            lon: city.lon,
            lat: city.lat,
            units: "metric",
            exclude: "minutely,alerts",
            appid: "b172e2b1e655b4a821c0f13d0574c7ad",
            lang: "kr",
        },
    }).done((res) => {
        updateToday(res.current);
        updateHourly(res.hourly);
        updateDaily(res.daily);
    }).fail(() => { });
}

// 날씨 갱신 - 오늘간략
function updateToday(res) {
    const today = new Date(res.dt * 1000)
    const day = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(today);
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = new Intl.DateTimeFormat("en-US", { month: "long" }).format(today);
    const sunrise = new Date(res.sunrise * 1000);
    const sunset = new Date(res.sunset * 1000);
    $("#breif .number").text(parseInt(res.temp));
    $("#breif .today_desc").text(res.weather[0].description);
    $("header .today_date").text(`${day}, ${dd} ${mm}`);
    $(".today_wind").html(`${res.wind_speed.toFixed(1)}km/h`);
    $(".today_humidity").html(`${res.humidity}%`);
    $(".today_cloud").html(`${res.clouds}%`);
    $("#breif .today_maingif").attr("src", `img/${res.weather[0].main}.gif`);
    $("#sun .sunrise").text(`${sunrise.getHours()}:${sunrise.getMinutes()}`);
    $("#sun .sunset").text(`${sunset.getHours()}:${sunset.getMinutes()}`);
}

// 날씨 갱신 - 오늘시간별
function updateHourly(weather) {
    let $hourly = $("#hourly ul"); $hourly.empty();
    let labels = []; let datasets = [];

    // 차트초기화
    myChart.data.datasets[0].data = [];
    myChart.data.labels = [];

    for (const [index, value] of weather.entries()) {
        if (index == 0) {
            continue;
        } else if (index > 24) {

        } else if (index % 3 == 0) {
            let hour = new Date(value.dt * 1000).getHours();
            if (hour > 12) { hour = (hour - 12) + "PM"; } else { hour = hour + "AM" }
            labels.push(hour); datasets.push(Math.round(value.temp))
            $hourly.append(`<li><img src="img/${value.weather[0].main}.gif"></li>`);
        }
    }
    // 차트 갱신
    myChart.data.datasets[0].data = datasets;
    myChart.data.labels = labels;
    myChart.update();
}

// 날씨 갱신 - 요일별
function updateDaily(weather) {
    const $daily = $("#daily ul"); $daily.empty();

    for (const [index, value] of weather.entries()) {
        if (index == 0) {
            continue;
        }
        let dayNow = new Date(value.dt * 1000);
        daynow = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(dayNow);
        let li = $("<li></li>").appendTo($daily);
        $("<p></p>").html(`${daynow}`).addClass("daily_date strong").appendTo(li);
        $("<p></p>")
            .html(`<img src="img/${value.weather[0].main}.gif">`)
            .addClass("daily_gif")
            .appendTo(li);
        $("<p></p>")
            .html(`${value.weather[0].description}`)
            .addClass("daily_desc")
            .appendTo(li);
        $("<p></p>")
            .html(`${parseInt(value.temp.max)}°`)
            .addClass("daily_max")
            .appendTo(li);
        $("<p></p>")
            .html(`${parseInt(value.temp.min)}°`)
            .addClass("daily_min")
            .appendTo(li);
    }
}

// 도시 검색 - 문자별
function searchCity(val) {
    $("main").css("opacity", "0.01"); // main 흐림 효과
    $.ajax({
        url: "https://api.openweathermap.org/geo/1.0/direct",
        type: "GET",
        data: {
            q: `${val}`,
            appid: "b172e2b1e655b4a821c0f13d0574c7ad",
            limit: 4
        },
    }).done((res) => {
        recommendList(res); // 리스트 노출
    }).fail(() => { });
}

// 도시 노출 - 추천 리스트
function recommendList(res) {
    const $locationList = $("#locationList"); $locationList.empty();
    for (const value of res) {
        const city = { lon: value.lon, lat: value.lat, name: value.name, country: value.country };
        $(`<li>${value.name}, ${value.country}</li>`).attr("onclick", `getWeather(${JSON.stringify(city)})`).appendTo($locationList);
    }
}

// main 밝게
function docOpacity1() {
    $("main").css("opacity", "1");
    $("#locationList").empty();
};

// main 어둡게
function docOpacity0() {
    $("main").css("opacity", "0");
};


// $('svg.radial-progress').each(function (index, value) {
//     $(this).find($('circle.complete')).removeAttr('style');
// });

// $(window).scroll(function () {
//     $('svg.radial-progress').each(function (index, value) {
//         // If svg.radial-progress is approximately 25% vertically into the window when scrolling from the top or the bottom
//         if (
//             $(window).scrollTop() > $(this).offset().top - ($(window).height() * 0.75) &&
//             $(window).scrollTop() < $(this).offset().top + $(this).height() - ($(window).height() * 0.25)
//         ) {
//             // Get percentage of progress
//             percent = $(value).data('percentage');
//             // Get radius of the svg's circle.complete
//             radius = $(this).find($('circle.complete')).attr('r');
//             // Get circumference (2πr)
//             circumference = 2 * Math.PI * radius;
//             // Get stroke-dashoffset value based on the percentage of the circumference
//             strokeDashOffset = circumference - ((percent * circumference) / 100);
//             // Transition progress for 1.25 seconds
//             $(this).find($('circle.complete')).animate({ 'stroke-dashoffset': strokeDashOffset }, 1250);
//         }
//     });
// }).trigger('scroll');