/* CONTAINER */
const submit = document.querySelector('.submit');
const weatherInput = document.querySelector('.weather-input');
const container = document.querySelector('.container');
const body = document.querySelector('body');
const clue = document.querySelector('.clue');
let bottomPage, topPage, loadingScreen;

/* PROPERTIES */
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayIndex = new Date().getDay();

const weatherImages = {
  icons: {
    sunny: '<i class="fa-solid fa-sun fa-beat" style="color: #fef600;"></i>',
    cloudy: '<i class="fa-solid fa-cloud" style="color: #ffffff;"></i>',
    windy: '<i class="fa-solid fa-wind fa-shake" style="color: #0114ff;"></i>',
    rainy: '<i class="fa-solid fa-droplet fa-bounce" style="color: #0114ff;"></i>',
    bolt: '<i class="fa-solid fa-cloud-bolt fa-beat-fade" style="color: #696a79;"></i>',
    snowy: '<i class="fa-solid fa-snowflake fa-beat" style="color: #90c3ff;"></i>',
  },
  backgroundImageClasses: {
    sunnyClass: 'sunny-weather',
    rainyClass: 'rainy-weather',
    cloudyClass: 'cloudy-weather',
    snowyClass: 'snowy-weather',
  },
};

/* FUNCTIONS */
const getUserPosition = async (position) => {
  // Build Site
  let weatherData = await getDataByGeoLocation({
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  });

  buildTopScreenApp(weatherData);
  buildBottomScreenApp(weatherData);
};

const getDataByCity = async (city) => {
  const fetchCityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=10&appid=${apiKey}`;
  return fetch(fetchCityUrl)
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => {
      alert.error('Error beim Holen der City', error);
    });
};

const getDataByGeoLocation = async (geoObj) => {
  const fetchWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${geoObj.lat}&lon=${geoObj.lon}&units=metric&appid=${apiKey}`;
  return await fetch(fetchWeatherUrl)
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => {
      console.error('Error Beim holen der Wetterdaten', error);
    });
};

const buildWeatherApp = () => {
  let geoActive;
  navigator.permissions.query({ name: 'geolocation' }).then((data) => {
    geoActive = data.state;

    // Loadingscreen
    container.insertAdjacentElement('beforeend', buildLoadingScreen());
    loadingScreen = document.querySelector('.loading');

    if (geoActive !== 'denied') {
      // Build geoLocation Site
      navigator.geolocation.getCurrentPosition(getUserPosition);
      return;
    }

    clue.innerHTML = 'Bitte aktivieren Sie Ihre GeoLocation oder geben Sie eine Stadt ein!';
    clue.style.display = 'block';
  });
};

const buildTopScreenApp = (data) => {
  // Clear Loading Screen if exist
  loadingScreen?.remove();
  // clear clue if exist?
  clue.style.display = 'none';
  // remove die Klasse von body
  body.removeAttribute('class');
  // remove topPage
  if (topPage) {
    topPage.remove();
  }

  // Build Time vars
  let time = new Date()
    .toLocaleTimeString('en-US', {
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
    })
    .concat(`${new Date().getHours() >= 12 ? ' PM' : ' AM'}`);

  let day = new Date().getDate();
  let month = ('0' + new Date().getMonth()).slice(-2);
  let year = new Date().getFullYear();

  let svg = null;
  let backgroundImageClass = null;

  // set body background image and icon
  switch (data.weather[0].main) {
    case 'Clouds':
      svg = weatherImages.icons.cloudy;
      backgroundImageClass = weatherImages.backgroundImageClasses.cloudyClass;

      break;
    case 'Rain':
      svg = weatherImages.icons.rainy;
      backgroundImageClass = weatherImages.backgroundImageClasses.rainyClass;
      break;
    case 'Drizzle':
      svg = weatherImages.icons.rainy;
      backgroundImageClass = weatherImages.backgroundImageClasses.rainyClass;
      break;
    case 'Clear':
      svg = weatherImages.icons.sunny;
      backgroundImageClass = weatherImages.backgroundImageClasses.sunnyClass;
      break;
    case 'Snow':
      svg = weatherImages.icons.snowy;
      backgroundImageClass = weatherImages.backgroundImageClasses.snowyClass;
      break;

    default:
      break;
  }

  body.classList.add(backgroundImageClass);

  container.insertAdjacentHTML(
    'beforeend',
    `
      <div class="weather-side ${backgroundImageClass}">
        <div class="weather-gradient"></div>
        <div class="date-container">
          <div>
            <h2 class="date-dayname">${days[dayIndex]}</h2>
            <span class="location">${time}</span>
            <span class="date-day">${day}.${month}.${year}</span>
            <span class="location">${data.name}, ${data.sys.country}</span>
          </div>
          <div class="weather-svg">
          ${svg}
          ${data.wind.speed >= 5 ? weatherImages.icons.windy : ''}           
            
          </div>
        </div>
        <div class="weather-container">          
          <h1 class="weather-temp">${Math.floor(data.main.temp)}°C </h1>
          <h3 class="weather-desc">${data.weather[0].description}</h3>
        </div>
      </div>  
  `
  );

  topPage = document.querySelector('.weather-side');
};

const buildBottomScreenApp = (data) => {
  // remove bottomPage
  if (bottomPage) {
    bottomPage.remove();
  }

  let riseHours = ('0' + new Date(data.sys.sunrise * 1000).getUTCHours()).slice(-2);
  let riseMinutes = ('0' + new Date(data.sys.sunrise * 1000).getUTCMinutes()).slice(-2);
  let riseSeconds = ('0' + new Date(data.sys.sunrise * 1000).getUTCSeconds()).slice(-2);

  let sunsetHours = ('0' + new Date(data.sys.sunset * 1000).getUTCHours()).slice(-2);
  let sunsetMinutes = ('0' + new Date(data.sys.sunset * 1000).getUTCMinutes()).slice(-2);
  let sunsetSeconds = ('0' + new Date(data.sys.sunset * 1000).getUTCSeconds()).slice(-2);

  container.insertAdjacentHTML(
    'beforeend',
    `
     <div class="info-side">
      <div class="today-info">
        <div class="precipitation">
          <span class="title">Feels Like: </span><span class="value">${Math.floor(
            data.main.feels_like
          )}°C</span>
        </div>
        <div class="humidity">
          <span class="title">Humidity: </span>
          <span class="value">${data.main.humidity}%</span>
        </div>
        <div class="wind">
          <span class="title">Wind Speed: </span>
          <span class="value">${data.wind.speed} km/h</span>
        </div>
        <div class="wind">
          <span class="title">Pressure: </span>
          <span class="value">${data.main.pressure} hPa</span>
        </div>
      </div>
      <div class="today-info">
        <div class="precipitation">
          <span class="title">Sunrise: </span>
          <span class="value">${riseHours}:${riseMinutes}:${riseSeconds}</span>
        </div>
        <div class="humidity">
          <span class="title">Sunset: </span>
          <span class="value">${sunsetHours}:${sunsetMinutes}:${sunsetSeconds}</span>
        </div>
        <div class="wind">
          <span class="title">Min Temperature: </span>
          <span class="value">${Math.floor(data.main.temp_min)}°C</span>
        </div>
        <div class="wind">
          <span class="title">Max Temperatur: </span>
          <span class="value">${Math.floor(data.main.temp_max)}°C</span>
        </div>
      </div>
  `
  );

  bottomPage = document.querySelector('.info-side');
};

const buildLoadingScreen = () => {
  const loader = document.createElement('div');
  loader.setAttribute('class', 'loading');

  const image = document.createElement('img');
  image.setAttribute('src', 'https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif');
  image.setAttribute('alt', 'loading');

  loader.appendChild(image);

  return loader;
};

//
const startWeatherPrediction = async (e) => {
  const cityVal = document.querySelector('.city-value').value;

  let getCityData = await getDataByCity(cityVal);
  let getWeatherData = await getDataByGeoLocation(getCityData[0]);

  // Build Site
  buildTopScreenApp(getWeatherData);
  buildBottomScreenApp(getWeatherData);
};
// RUN
buildWeatherApp();

/* EVENTLISTENER */
submit.addEventListener('click', startWeatherPrediction);
