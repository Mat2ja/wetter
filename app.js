const api = {
    key: '477af09cc9bebef17b4faba6ec41179b',
    baseUrl: 'https://api.openweathermap.org/data/2.5/'
};

const searchbox = document.querySelector('.header__search-box');
const city = document.querySelector('.location__city');
const date = document.querySelector('.location__date');
const temperature = document.querySelector('.current__temp');
const feel = document.querySelector('.current__feels-like');
const weatherDescEl = document.querySelector('.current__weather');
const highLow = document.querySelector('.current__hi-low');

searchbox.addEventListener('keypress', setQuery);

function setQuery(e) {
    if (e.keyCode === 13) {
        getResults(searchbox.value);
        console.log(searchbox.value);
    }
}

function getResults(query) {
    fetch(`${api.baseUrl}weather?q=${query}&unit=metric&appid=${api.key}`)
        .then(weather => weather.json())
        .then(displayResults)
        .catch(err => {
            console.log(err);

        })
}

function displayResults(weather) {
    console.log(weather);
    city.innerHTML = `${weather.name}, ${weather.sys.country}`;
    // date.innerText = moment().format('dddd MMMM Do YYYY, HH:mm');
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
        <i class='bx bxs-thermometer'></i>
        ${tempHigh}<span class="unit">&degC</span>
    `;

    searchbox.value = '';
    searchbox.blur();
}

function calculateCelsius(kelvin) {
    return kelvin - 273.15;
}