const api = {
    key: '477af09cc9bebef17b4faba6ec41179b',
    baseUrl: 'https://api.openweathermap.org/data/2.5/'
};
console.clear();
const searchbox = document.querySelector('.header__search-box');
const main = document.querySelector('main');
const city = document.querySelector('.location__city');
const date = document.querySelector('.location__date');
const temperature = document.querySelector('.current__temp');
const feel = document.querySelector('.current__feels-like');
const weatherDescEl = document.querySelector('.current__weather');
const highLow = document.querySelector('.current__hi-low');
const suggestions = document.querySelector('.suggestions');

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
            getResults(searchbox.value);
        }

    }
}

function findCityObject(suggestion) {
    return cities.find(o => o.id == suggestion.dataset.id);
}

function getResults(query) {
    console.log(query);
    let url;
    if (query.id) {
        url = `${api.baseUrl}weather?id=${query.id}&unit=metric&appid=${api.key}`;
    } 
    else {
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

    city.innerHTML = `
        ${weather.name}, ${weather.sys.country}
        <ion-icon name="location" class='icon'></ion-icon> 
    `;
    city.dataset.id = query.id;

    if (coord) {
        city.href = `https://www.google.com/maps?q=${query.name}&ll=${coord.lat},${coord.lon}&t=k`;
    } else {
        city.href = `https://www.google.com/maps?q=${query}&t=k`;
    }

    date.innerText = moment().format('dddd D MMMM');

    let temp = Math.round(calculateCelsius(weather.main.temp));
    let feelsLike = Math.round(calculateCelsius(weather.main.feels_like));
    let tempHigh = Math.round(calculateCelsius(weather.main.temp_max));
    let tempLow = Math.round(calculateCelsius(weather.main.temp_min));
    let weatherDesc = weather.weather[0].main;

    temperature.innerHTML = `
        ${temp}
        <span class="unit">&degC</span>
    `;
    feel.innerHTML = `Feels like ${feelsLike}<span class="deg">&degC</span>`
    weatherDescEl.innerText = weatherDesc;
    highLow.innerHTML = `
        ${tempLow}<span class="unit">&degC</span>
        <ion-icon name="thermometer" class='icon'></ion-icon>
        ${tempHigh}<span class="unit">&degC</span>
    `;

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
        .slice(0, 12)
        .map(place => {
            const regex = new RegExp(this.value, 'gi');
            const cityName = place.name.replace(regex, `<span class="hl">${this.value}</span>`);
            const countryName = place.country.replace(regex, `<span class="hl">${this.value}</span>`);

            suggestions.classList.remove('hide');
            return `
        <li class='suggestions__item' data-id='${place.id}'>
            <span class="city">${cityName}</span>
            <span class="country">${countryName}</span>
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
    suggestions.innerHTML = '';
    counter = 0;
}

function clearWeatherData() {
    city.innerText = '';
    date.innerText = '';
    temperature.innerText = '';
    feel.innerText = '';
    weatherDescEl.innerText = '';
    highLow.innerText = '';
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


