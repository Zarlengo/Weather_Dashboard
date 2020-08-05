let units = "SI";

let popularLocations = [
    {name: "Bangkok, Thailand", id: 1609350},
    {name: "Paris, France", id: 2988507},
    {name: "London, U.K.", id: 2643743},
    {name: "Dubai, U.A.E.", id: 292223},
    {name: "Singapore", id: 1880252},
    {name: "Kuala Lumpur, Malaysia", id: 1733046},
    {name: "New York City", id: 5128581},
    {name: "Istanbul, Turkey", id: 745042},
    {name: "Tokyo, Japan", id: 1850144},
    {name: "Antalya, Turkey", id: 323776}
]

// Fill out the forecast cards with the correct dates
var today = new Date();
var date_options = {year: "numeric", month: "numeric", day: "numeric"};
for (let future = 1; future <= 5; future++) {
    id_string = `#day_plus_${future}`;
    let card = document.querySelector(id_string);
    let future_date = new Date(today);
    future_date.setDate(today.getDate() + future);
    card.querySelector(".card-title").innerHTML = `${future_date.toLocaleDateString("en-US", {weekday: "long"})}<br>${future_date.toLocaleDateString("en-US", date_options)}`;
    
}

// Title string for the search bar to let user know what inputs are allowed
let title_string =
`Acceptable inputs:
  City Name
  City Name, Region Code
  City Name, Region Code, Country Code
  Latitude, Longitude
  Zip Code`;
document.querySelector(".search-section").setAttribute("title", title_string);
document.querySelector(".nav-search").setAttribute("title", title_string);

// Adds the 10 most populous cities to the sidebar
let popular = document.querySelector(".popular-location");
popularLocations.forEach(location => {
    let new_p = document.createElement("p");
    new_p.textContent = location.name;
    new_p.setAttribute("data-id", location.id);
    new_p.addEventListener("click", cityClick, false);
    popular.append(new_p);
});

// Adds the city search history to the sidebar
updateHistory();

// Function to update history side bar
function updateHistory() {

    // Clears history before replacing
    let history = document.querySelector(".history");
    let history_title = document.createElement("div");
    history_title.setAttribute("class", "title");
    history_title.textContent = "History:";
    history.innerHTML = "";
    history.append(history_title);

    // Checks if history exists
    let current_storage = JSON.parse(localStorage.getItem("weather_history"));
    if (current_storage != null && current_storage.length != 0) {

        // Cycles through the history (limited to only 5)
        current_storage.forEach(location => {
            let new_p = document.createElement("p");
            new_p.textContent = location.name;
            new_p.setAttribute("data-id", location.id);
            new_p.addEventListener("click", cityClick, false);
            history.append(new_p);
        });
    }

}

// Sets the website units
getUnits();

// Function to get unit preferences from local storage
function getUnits() {
    let current_storage = JSON.parse(localStorage.getItem("weather_units"));

    // If there is no history
    if (current_storage == null || current_storage.length == "") {
        // Converts the remaining object to a string and uploads to local storage
        var json_obj = JSON.stringify(units);
        localStorage.setItem("weather_units", json_obj);
    } else {
        units = current_storage;
    }
    document.querySelector(".unit-btn").textContent = units;
}

// Adds listener to the units button
document.querySelector(".unit-btn").addEventListener("click", () => {
    // Checks which is the currently selected unit
    if (units == "SI") {
        units = "Metric";
    } else {
        units = "SI";
    }

    // Updates local storage
    var json_obj = JSON.stringify(units);
    localStorage.setItem("weather_units", json_obj);

    // Refreshes the page
    let city_id = document.querySelector(".city-weather").getAttribute("data-id");
    currentWeatherAPI(city_id, "id", loadCity);
}, false);


// Adds a listener to the GPS button to allow loading of weather based on GPS coordinates
document.querySelector(".location-icon").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(loadLatLong);
    }
}, false);

// Function to get the latitude and longitude from the browser and load weather
function loadLatLong(result) {
    currentWeatherAPI([result.coords.latitude, result.coords.longitude], "lat_long", loadCity);
}

// Initial load of the website to default to location based on the user's IP address, semi-accurate w/o using VPN
getIP(ipResults);

// Function to get the user IP address and fill out initial weather
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

function ipResults(result) {    
    document.querySelector("#name").textContent = `${result.city}, ${result.region}, ${result.country_code} (${today.toLocaleDateString("en-US", date_options)})`;
    currentWeatherAPI(`${result.city}, ${result.region}, ${result.country_code}`, "name_string", loadCity);
}

function cityClick() {
    let city_id = this.getAttribute("data-id");
    currentWeatherAPI(city_id, "id", loadCity);
}

// API function to get weather data
const openWeatherKey = "45e45076cc82fb0c652c83ac87864440";
function currentWeatherAPI(input_value, input_type, ReferenceFunction) {
    let weather_URL = "";

    // Takes the initial request format to the appropriate API call
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

// Function to load the website with the API data
function loadCity(result) {

    // Updates the city name based on the API location data, accounts for different formats entered into the search options
    getCityName(result.coord.lat, result.coord.lon, result.id);

    // Saves the city id to the website
    document.querySelector(".city-weather").setAttribute("data-id", result.id);

    // Adds the weather icon for the current day, includes a hover to show text description of the weather
    document.querySelector("#title-weather").setAttribute("src", `https://openweathermap.org/img/wn/${result.weather[0].icon}.png`);
    document.querySelector("#title-weather").setAttribute("title", result.weather[0].description);
    document.querySelector("#title-weather").setAttribute("alt", result.weather[0].description);

    // Adds the temperature information to the site
    document.querySelector("#temp").innerHTML = `Temperature: ${getTemp(result.main.temp)} Feels like ${getTemp(result.main.feels_like, true)} (low ${getTemp(result.main.temp_min, true)} | high ${getTemp(result.main.temp_max, true)})`;

    // Adds the humidity to the site
    document.querySelector("#humidity").innerHTML = `Humidity: ${result.main.humidity} %`;

    // Creates nomenclature based on the wind direction, based on 45 degree increments
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
    document.querySelector("#wind").innerHTML = `Wind Speed: ${getWind(result.wind.speed)} from the ${wind_dir}`;
    document.querySelector("#wind").setAttribute("title", `Direction: ${wind_deg} deg`);

    // API call to get the future weather forecast and the UV Index
    futureWeatherAPI(result.coord.lat, result.coord.lon, loadForecast);
}

// Function to convert the latitude and longitude to a city name and location
function getCityName(latitude, longitude, city_id) {
    const openCageAPIKey = "4641706a1dfd40e5b62f9de9fdbfaf11";
    const openCageAPIURL = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageAPIKey}`;

    fetch(openCageAPIURL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            console.log(request);


            let city_object = request.results[0].components;

            // Ignores any missing components in the name (i.e. Singapore doesn't have a region code)
            let name_array = [];
            if (typeof(city_object.city) != "undefined") {
                name_array.push(city_object.city);
            }
            if (typeof(city_object.state) != "undefined") {
                name_array.push(city_object.state);
            }
            if (typeof(city_object["ISO_3166-1_alpha-2"]) != "undefined") {
                name_array.push(city_object["ISO_3166-1_alpha-2"]);
            }

            document.querySelector("#name").textContent = `${name_array.join(", ")} (${today.toLocaleDateString("en-US", date_options)})`;
            addToStorage(`${name_array.join(", ")}`, city_id);
        })
}

// Function to add the city to local storage and update the sidebar
function addToStorage(city_name, city_id) {
    let current_storage = JSON.parse(localStorage.getItem("weather_history"));

    // If there is no history
    if (current_storage == null || current_storage.length == 0) {
        current_storage = [{name: city_name, id: city_id}];

    } else {
        // Checks if the city is already in the history
        if (current_storage.filter(city => city.id == city_id).length > 0) {

            // Cycles through array looking for the repeated city
            current_storage.forEach((city, index) => {
                if (city.id == city_id) {
                    current_storage.splice(index, 1);
                }
            });

            // Adds the newest element to the front of the array
            current_storage.unshift({name: city_name, id: city_id});

        // If the city is not in the history, adds it and the deletes the oldest one
        } else {
            current_storage.unshift({name: city_name, id: city_id});
            while (current_storage.length > 5) {
                current_storage.pop();
            }
        }
    }

    // Converts the remaining object to a string and uploads to local storage
    var json_obj = JSON.stringify(current_storage);
    localStorage.setItem("weather_history", json_obj);
    updateHistory();
}

// Function to convert temperature units
function getTemp(temp_in_Kelvin, short = false) {
    let temp_value = 0;
    let temp_sign = "";
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
        temp_value = Math.floor(temp_value * 10) / 10;
        return `${temp_value} &deg;${temp_sign}`;
    }
}

// Function to convert wind speed
function getWind(wind_in_mph) {
    let wind_value = 0;
    let wind_sign = "";
    if (units == "SI") {
        wind_value = wind_in_mph;
        wind_sign = "mph";
    } else if (units = "Metric") {
        wind_value = wind_in_mph * 1.60934;
        wind_sign = "kph";
    } else {
        wind_value = wind_in_mph * 0.868976;
        wind_sign = "Knots";
    }
        wind_value = Math.floor(wind_value * 10) / 10;
        return `${wind_value} ${wind_sign}`;
}

// Function to get the future weather forecast
function futureWeatherAPI(latitude, longitude, ReferenceFunction) {
    let weather_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherKey}`;

    fetch(weather_URL)
        .then(response => {
            return response.json();
        })
        .then(request => {
            console.log(request);
            ReferenceFunction(request);
        })
}

// Function to load the forecast cards
function loadForecast(result) {

    // Loads the current weather UV index
    addUV(result.current.uvi);

    // Cycles through the next 5 days
    for (let future = 1; future <= 5; future++) {
        let forecast = result.daily[future - 1];
        id_string = `#day_plus_${future}`;
        let card = document.querySelector(id_string);

        // Adds the weather icon for the date
        card.querySelector(".card-icon").setAttribute("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`);
        card.querySelector(".card-icon").setAttribute("title", forecast.weather[0].description);
        card.querySelector(".card-icon").setAttribute("alt", forecast.weather[0].description);

        // Sets the temperature for the day
        card.querySelector(".card-temp").innerHTML = `Temp: ${getTemp(forecast.temp.max)} (low ${getTemp(forecast.temp.min, true)})`;

        // Adds the humidity for the day
        card.querySelector(".card-humidity").innerHTML = `Humidity: ${forecast.humidity} %`;
    }
}

// Function to add the UV Index to the current weather
function addUV(UVIndex) {
    let uv = document.querySelector("#UV");
    uv.innerHTML = "UV Index: ";

    uv_span = document.createElement("span");
    uv_span.textContent = UVIndex;

    // Sets the class for the Index based on the coloring scheme for that value
    if (UVIndex < 3) {
        uv_span.setAttribute("class", "uv-span low");
    } else if (UVIndex < 6) {
        uv_span.setAttribute("class", "uv-span moderate");
    } else if (UVIndex < 8) {
        uv_span.setAttribute("class", "uv-span high");
    } else if (UVIndex < 11) {
        uv_span.setAttribute("class", "uv-span very-high");
    } else {
        uv_span.setAttribute("class", "uv-span extreme");
    }

    uv.append(uv_span);

}