const api = {
    key: '477af09cc9bebef17b4faba6ec41179b',
    baseUrl: 'https://api.openweathermap.org/data/2.5/'
};
console.clear();
const searchbox = document.querySelector('.header__search-box');
const main = document.querySelector('main');
const cityEl = document.querySelector('.location__city');
const dateEl = document.querySelector('.location__date');
const temperatureEl = document.querySelector('.current__temp');
const feelEl = document.querySelector('.current__feels-like');
const weatherDescEl = document.querySelector('.current__weather');
const highLowGroupEL = document.querySelector('#hi-low');
const otherGroupEl = document.querySelector('.current__group#other');
const suggestions = document.querySelector('.suggestions');
const geoBtn = document.querySelector('#geolocate');

let cities;
const cityList = fetch('./city.list.json')
    .then(blob => blob.json())
    .then(data => {
        cities = data;
    });

function setQuery(e) {
    // Enter
    if (e.keyCode === 13) {
        // if there are suggestions
        if (suggestions.hasChildNodes()) {
            let suggestionsItems = document.querySelectorAll('.suggestions__item');

            for (let item of suggestionsItems) {
                if (item.classList.contains('active')) {
                    getResults(findCityObject(item));
                }
            }

            // if none of the suggestions has 'active' class, send a search query
            // try to find it in the cities file, if not found, send only the searchbox value as the query
            let cityObj = cities.find(o => o.name.toLowerCase() == searchbox.value.toLowerCase()) || searchbox.value;
            getResults(cityObj);
        } else {
            console.log(searchbox.value);
            // TODO dont send request for empty strings
            if (searchbox.value === '') {
                throw new Error('No city provided');
            } else {
                getResults(searchbox.value);
            }
        }

    }
}

function findCityObject(suggestion) {
    return cities.find(o => o.id == suggestion.dataset.id);
}

function getGeolocation() {
    let lon;
    let lat;
    let geolocation = navigator.geolocation;
    if (geolocation) {
        geolocation.getCurrentPosition(({ coords }) => {
            lon = coords.longitude;
            lat = coords.latitude
            console.log(lon, lat);
            getResults({ lat, lon });
        })
    }
}

function getResults(query) {
    console.log(query);
    let url;
    if (query.id) {
        url = `${api.baseUrl}weather?id=${query.id}&unit=metric&appid=${api.key}`;
    } else if (query.lat && query.lon) {
        url = `${api.baseUrl}weather?lat=${query.lat}&lon=${query.lon}&appid=${api.key}`
    } else {
        url = `${api.baseUrl}weather?q=${query}&unit=metric&appid=${api.key}`;
    }

    fetch(url)
        .then(weather => weather.json())
        .then(res => displayResults(res, query))
        .catch(err => console.log(err))
}

function displayResults(weather, query) {
    const { coord } = query;
    clearSuggestions();
    console.log('WEATHER:', weather);
    cityEl.innerHTML = `
        ${weather.name}, ${weather.sys.country}
        <ion-icon name="location" class='icon'></ion-icon> 
    `;

    // if geolocatiom get city ID from the weather api
    cityEl.dataset.id = query.id || weather.id;

    if (coord) {
        cityEl.href = `https://www.google.com/maps?q=${query.name}&ll=${coord.lat},${coord.lon}&t=k`;
    } else if (query.lat && query.lon) {
        cityEl.href = `https://www.google.com/maps?q=${cityEl.innerText}&ll=${query.lat},${query.lon}&t=k`;
    } else {
        cityEl.href = `https://www.google.com/maps?q=${query}&t=k`;
    }

    dateEl.innerText = moment().format('dddd D MMMM');

    let temp = Math.round(calculateCelsius(weather.main.temp));
    let feel = Math.round(calculateCelsius(weather.main.feels_like));
    let tempHigh = Math.round(calculateCelsius(weather.main.temp_max));
    let tempLow = Math.round(calculateCelsius(weather.main.temp_min));
    let humidity = parseInt(weather.main.humidity);
    let cloudiness = parseInt(weather.clouds.all);
    let pressure = parseInt(weather.main.pressure);
    let visibility = parseInt(weather.visibility);
    let windDeg = parseInt(weather.wind.deg);
    let windSpeed = parseFloat(weather.wind.speed);
    let weatherDesc = weather.weather[0].main;
    let weatherDescFull = weather.weather[0].description;

    temperatureEl.innerHTML = `
        ${temp}
        <span class="unit">&degC</span>
    `;
    feelEl.innerHTML = `Feels like ${feel}<span class="deg">&degC</span>`
    weatherDescEl.innerText = weatherDesc;
    highLowGroupEL.innerHTML = `
        <span class='low' title='Low'>${tempLow}<span class="unit temp">&degC</span></span>
        <ion-icon name="thermometer" class='icon'></ion-icon>
        <span class='high' title='High'>${tempHigh}<span class="unit temp">&degC</span></span>
    `;
    otherGroupEl.innerHTML = `
        <span title="Humidity" class="left">
            <ion-icon name="water" class="icon"></ion-icon>
            ${humidity}<span class="unit percent">%</span>
        </span>
        <span title="Cloudiness" class="right">
            ${cloudiness}<span class="unit percent">%</span>
            <ion-icon name="cloudy" class="icon"></ion-icon>
        </span>

        <span title="Wind angle" class="wind left">${windDeg}<span class="unit deg">&deg</span></span>
        <i class="bx bx-wind icon center" title="Wind"></i>
        <span title="Wind speed" class="wind right">${windSpeed}<span class="unit">km/h</span></span>

        <span title="Visibility" class="left">
            <ion-icon name="eye" class="icon"></ion-icon>
            ${visibility}<span class="unit meter">m</span>
        </span>
        <span title="Pressure" class="right">
            ${pressure}<span class="unit">hPa</span>
            <i class="bx bx-water icon"></i>
        </span>
    `;

    weatherDescEl.addEventListener('click', () => {
        console.log('clicked');
        if (weatherDescEl.innerText === weatherDesc) {
            weatherDescEl.innerText = weatherDescFull;
        } else {
            weatherDescEl.innerText = weatherDesc;
        }
    });

    searchbox.value = '';
    searchbox.blur();
}

function calculateCelsius(kelvin) {
    return kelvin - 273.15;
}

function findMatches(wordToMatch, cities) {
    return cities.filter(place => {
        const regex = new RegExp(wordToMatch, 'gi');
        return place.name.match(regex) || place.country.match(regex);
    })
};

function displayMatches() {
    if (!this.value) return clearSuggestions();
    clearWeatherData();

    const matchArray = findMatches(this.value, cities);

    const html = matchArray
        .slice(0, 14)
        .map(place => {
            const regex = new RegExp(this.value, 'gi');
            const cityName = place.name.replace(regex, `<span class="hl">${this.value}</span>`);
            // const countryName = place.country.replace(regex, `<span class="hl">${this.value}</span>`);

            suggestions.classList.remove('hide');
            searchbox.style.borderBottomRightRadius = '0';
            return `
                <li class='suggestions__item' data-id='${place.id}'>
                    <span class="city">${cityName}</span>
                    <span class="country">${place.country}<span class="flag-icon flag-icon-${place.country.toLowerCase()} flag-icon-squared"></span></span>
                </li>
            `;
        }).join('');

    suggestions.innerHTML = html;

    let suggestionsItems = document.querySelectorAll('.suggestions__item');

    for (let item of suggestionsItems) {
        item.addEventListener('click', (e) => {
            getResults(findCityObject(item));
        });
    }
}

function clearSuggestions() {
    searchbox.style.borderBottomRightRadius = '1.6rem';
    suggestions.innerHTML = '';
    counter = 0;
}

function clearWeatherData() {
    cityEl.innerText = '';
    dateEl.innerText = '';
    temperatureEl.innerText = '';
    feelEl.innerText = '';
    weatherDescEl.innerText = '';
    highLowGroupEL.innerText = '';
    otherGroupEl.innerText = '';
}

function moveThroughSuggestions(counter, direction) {
    // TODO
    let suggestionsItems = document.querySelectorAll('.suggestions__item');
    console.log('COUNTER', counter);

    if (counter === suggestionsItems.length) {
        suggestionsItems[counter - 1].classList.remove('active');
        counter = 0;
    }
    if (counter === 0) {
        suggestionsItems[counter].classList.add('active');
        return;
    }

    suggestionsItems[counter - 1].classList.remove('active');
    suggestionsItems[counter++].classList.add('active');
}

searchbox.addEventListener('input', displayMatches);
searchbox.addEventListener('keypress', setQuery);

let counter = 0;
document.addEventListener('keyup', ({ keyCode }) => {
    if (keyCode === 9) {
        searchbox.focus();
    } else if (keyCode === 40) {
        // DOWN
        if (suggestions.hasChildNodes()) {
            console.log('arrow down');
            // moveThroughSuggestions(counter++);
        }
    } else if (keyCode === 38) {
        // UP
        if (suggestions.hasChildNodes()) {
            console.log('arrow down');
            // moveThroughSuggestions(counter++);
        }
    }
});


geoBtn.addEventListener('click', getGeolocation)

