let units = "SI";
const openWeatherKey = "45e45076cc82fb0c652c83ac87864440";

function currentWeatherAPI(input_value, input_type, ReferenceFunction) {
    let weather_URL = "";
    switch (input_type) {
        case "zipcode":
            // searchByZip
            weather_URL = `https://api.openweathermap.org/data/2.5/weather?zip=${input_value}&appid=${openWeatherKey}`;
            break;
        case "name_string":
            // searchByText
            weather_URL = `https://api.openweathermap.org/data/2.5/weather?q=${input_value}&appid=${openWeatherKey}`;
            break;
        case "lat_long":
            // searchByLatLong
            weather_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${input_value[0]}&lon=${input_value[1]}&appid=${openWeatherKey}`;
            break;
        case "id":
            // searchByID
            weather_URL = `https://api.openweathermap.org/data/2.5/weather?id=${input_value}&appid=${openWeatherKey}`;
            break;
    }

    fetch(weather_URL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            ReferenceFunction(request);
        })

}

function futureWeatherAPI(latitude, longitude, ReferenceFunction) {
    let weather_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherKey}`;

    fetch(weather_URL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            ReferenceFunction(request);
        })

}

function getCityName(latitude, longitude) {
    const openCageAPIKey = "4641706a1dfd40e5b62f9de9fdbfaf11";
    const openCageAPIURL = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageAPIKey}`;

    fetch(openCageAPIURL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            let city_object = request.results[0].components;
            document.querySelector("#name").textContent = `${city_object.city}, ${city_object.state}, ${city_object["ISO_3166-1_alpha-2"]} (${today.toLocaleDateString("en-US", date_options)})`;
        })

}

function getUVIndex(lat_long_array, ReferenceFunction) {
    let UV_URL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat_long_array[0]}&lon=${lat_long_array[1]}&appid=${openWeatherKey}`;

    fetch(UV_URL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            ReferenceFunction(request);
        })
}

function getIP(ReferenceFunction) {

    const geoIPLookup_URL = "https://json.geoiplookup.io/";

    fetch(geoIPLookup_URL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            ReferenceFunction(request);
        })

};

getIP(ipResults);

var today = new Date();
var date_options = {year: "numeric", month: "numeric", day: "numeric"};
for (let future = 1; future <= 5; future++) {
    id_string = `#day_plus_${future}`;
    let card = document.querySelector(id_string);
    let future_date = new Date(today);
    future_date.setDate(today.getDate() + future);
    card.querySelector(".card-title").innerHTML = `${future_date.toLocaleDateString("en-US", {weekday: "long"})}<br>${future_date.toLocaleDateString("en-US", date_options)}`;
    // card.querySelector(".card-icon");
    // card.querySelector(".card-temp");
    // card.querySelector(".card-humidity");
}


let title_string =
`Acceptable inputs:
  City Name
  City Name, Region Code
  City Name, Region Code, Country Code
  Latitude, Longitude
  Zip Code`;
document.querySelector(".search-section").setAttribute("title", title_string);
document.querySelector(".nav-search").setAttribute("title", title_string);

document.querySelector(".location-icon").addEventListener("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(loadLatLong);
    }
}, false);

function loadLatLong(result) {
    currentWeatherAPI([result.coords.latitude, result.coords.longitude], "lat_long", loadCity);
}

function ipResults(result) {
    document.querySelector("#name").textContent = `${result.city}, ${result.region}, ${result.country_code} (${today.toLocaleDateString("en-US", date_options)})`;
    currentWeatherAPI(`${result.city}, ${result.region}, ${result.country_code}`, "name_string", loadCity);
}

function loadCity(result) {
    getCityName(result.coord.lat, result.coord.lon);
    document.querySelector("#title-weather").setAttribute("src", `https://openweathermap.org/img/wn/${result.weather[0].icon}.png`);
    document.querySelector("#title-weather").setAttribute("title", result.weather[0].description);
    document.querySelector("#title-weather").setAttribute("alt", result.weather[0].description);
    document.querySelector("#temp").innerHTML = `Temperature: ${getTemp(result.main.temp)} Feels like ${getTemp(result.main.feels_like, true)} (low ${getTemp(result.main.temp_min, true)} | high ${getTemp(result.main.temp_max, true)})`;
    document.querySelector("#humidity").innerHTML = `Humidity: ${result.main.humidity} %`;


    let wind_deg = result.wind.deg;
    let wind_dir = "";
    if (wind_deg < 22.5) {
        wind_dir = "N";
    } else if (wind_deg < 67.5) {
        wind_dir = "NE";
    } else if (wind_deg < 112.5) {
        wind_dir = "E";
    } else if (wind_deg < 157.5) {
        wind_dir = "SE";
    } else if (wind_deg < 202.5) {
        wind_dir = "S";
    } else if (wind_deg < 247.5) {
        wind_dir = "SW";
    } else if (wind_deg < 292.5) {
        wind_dir = "W";
    } else if (wind_deg < 337.5) {
        wind_dir = "NW";
    } else {
        wind_dir = "N";
    }
    document.querySelector("#wind").innerHTML = `Wind Speed: ${result.wind.speed} MPH from the ${wind_dir}`;
    document.querySelector("#wind").setAttribute("title", `Direction: ${wind_deg} deg`);
    getUVIndex([result.coord.lat, result.coord.lon], addUV);
    futureWeatherAPI(result.coord.lat, result.coord.lon, loadForecast);
}

function getTemp(temp_in_Kelvin, short = false) {
    let temp_value = 0;
    if (units == "SI") {
        temp_value = (parseFloat(temp_in_Kelvin) - 273.15) * 9 / 5 + 32;
        temp_sign = "F";
    } else if (units == "Metric") {
        temp_value = parseFloat(temp_in_Kelvin) - 273.15;
        temp_sign = "C";
    } else {
        temp_value = temp_in_Kelvin;
        temp_sign = "K";
    }
    if (short) {
        temp_value = Math.floor(temp_value);
        return `${temp_value}&deg;`;
    } else {
        temp_value = Math.floor(temp_value * 100) / 100;
        return `${temp_value} &deg;${temp_sign}`;
    }
}

function addUV(result) {
    let uv = document.querySelector("#UV");
    uv.innerHTML = "UV Index: ";

    uv_span = document.createElement("span");
    uv_span.textContent = result.value;
    if (result.value < 3) {
        uv_span.setAttribute("class", "uv-span low");
    } else if (result.value < 6) {
        uv_span.setAttribute("class", "uv-span moderate");
    } else if (result.value < 8) {
        uv_span.setAttribute("class", "uv-span high");
    } else if (result.value < 11) {
        uv_span.setAttribute("class", "uv-span very-high");
    } else {
        uv_span.setAttribute("class", "uv-span extreme");
    }

    uv.append(uv_span);

}

function loadForecast(result) {
    for (let future = 1; future <= 5; future++) {
        let forecast = result.daily[future - 1];
        console.log(forecast);
        id_string = `#day_plus_${future}`;
        let card = document.querySelector(id_string);
        console.log(card);
        card.querySelector(".card-icon").setAttribute("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`);
        card.querySelector(".card-icon").setAttribute("title", forecast.weather[0].description);
        card.querySelector(".card-icon").setAttribute("alt", forecast.weather[0].description);
        card.querySelector(".card-temp").innerHTML = `Temp: ${getTemp(forecast.temp.max)} (low ${getTemp(forecast.temp.min, true)})`;
        card.querySelector(".card-humidity").innerHTML = `Humidity: ${forecast.humidity} %`;
    }
}