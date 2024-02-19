const API_KEY = "72e1d970c2189bf5af7990b19d27fa7b";
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingContainer = document.querySelector(".loading-container");
const errorBox = document.querySelector(".error-display");
const userInformation = document.querySelector(".userInfoContainer");

//error variable
const errordata = document.querySelector("[data-errordisplay]");
const retryBtn = document.querySelector("[data-errorButton]");

let currentTab = userTab;
currentTab.classList.add("current-tab");
// after refresh always it will not ask for your current location
getFromSessionStorage();

//Switch Tab function
function switchTab(clickedTab) {
  errorBox.classList.remove("active");
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      // user to search
      searchForm.classList.add("active");
      userInformation.classList.remove("active");
      grantAccessContainer.classList.remove("active");
    } else {
      // search to user
      searchForm.classList.remove("active");
      userInformation.classList.remove("active");
      getFromSessionStorage();
    }
  }
}

//User click
userTab.addEventListener("click", () => {
  switchTab(userTab);
});

// search click
searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

//getFromSessionStorage function
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchWeatherInfo(coordinates);
  }
}

async function fetchWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  grantAccessContainer.classList.remove("active");
  loadingContainer.classList.add("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    if (!data.sys) {
      throw data;
    }
    loadingContainer.classList.remove("active");
    userInformation.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingContainer.classList.remove("active");
    userInformation.classList.remove("active");
    errorBox.classList.add("active");
    errordata.innerText = `Error: ${err?.message}`;
    retryBtn.addEventListener("click", fetchWeatherInfo);
  }
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const img = {
  "clear sky": "./Images/sunny.png",
  "clear sky night": "./Images/moon.png",
  "few clouds": "./Images/sun_cloud.png",
  "overcast clouds": "./Images/clouds.png",
  "broken clouds": "./Images/clouds.png",
  smoke: "./Images/smoke.png",
  haze: "./Images/smoke.png",
  "scattered clouds": "./Images/cloud-computing.png",
  "moderate rain": "./Images/rainycloud.png",
};
//render weather information
function renderWeatherInfo(data) {
  //firstly we have to fetch the element
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const icon = document.querySelector("[data-weatherIcon]");
  const date = document.querySelector("[data-currentDate]");
  const time = document.querySelector("[data-currentTime]");
  const temp = document.querySelector("[data-temperature]");
  const humidity = document.querySelector("[data-weatherHumi]");
  const wind = document.querySelector("[data-weatherWind]");
  const cloud = document.querySelector("[data-weatherCloud]");

  //fetch the data from object
  cityName.innerText = data?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
  desc.innerText = data?.weather?.[0]?.description;
  let descrip = data?.weather?.[0]?.description;
  // icon.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
  // console.log(img[descrip]);
  temp.innerText = data?.main?.temp.toFixed(1) + "°C";
  wind.innerText = data?.wind?.speed.toFixed(2) + "m/s";
  humidity.innerText = data?.main?.humidity.toFixed(2) + "%";
  cloud.innerText = data?.clouds?.all.toFixed(2) + "%";

  let clock = new Date();
  const weekday = days[clock.getDay()];
  const month = months[clock.getMonth()];
  const datenumber = clock.getDate();
  date.innerText = weekday + " , " + month + " " + datenumber;
  const hour = clock.getHours();
  const minutes = clock.getMinutes();
  time.innerText = hour + " : " + minutes;
  if (hour > 18 && hour < 4 && descrip === "clear sky") {
    icon.src = img[descrip + " night"];
  } else {
    icon.src = img[descrip];
  }
}

//for grant access page
const grantAccessButton = document.querySelector("[data-grantLocation]");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    grantAccessButton.style.display = "none";
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
  fetchWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener("click", getLocation);

//search tab pe click kiya to
const searchInput = document.querySelector("[data-searchInput]");
const searchbtn = document.querySelector("[data-searchButton]");

searchbtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (searchInput.value === "") {
    return;
  }
  fetchSearchWeatherInfo(searchInput.value);
  searchInput.value = "";
});

//fetchSearchWeatherInfo
async function fetchSearchWeatherInfo(city) {
  loadingContainer.classList.add("active");
  userInformation.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  errorBox.classList.remove("active");
  try {
    const resp = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await resp.json();
    if (!data.sys) {
      throw data;
    }
    loadingContainer.classList.remove("active");
    userInformation.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingContainer.classList.remove("active");
    userInformation.classList.remove("active");
    errorBox.classList.add("active");
    errordata.innerText = `Error: ${err?.message}`;
    retryBtn.addEventListener("click", fetchSearchWeatherInfo);
  }
}
