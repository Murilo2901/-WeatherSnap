const input = document.getElementById('city-input');
const btn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const forecastContainer = document.getElementById('forecast-container');
const loadingMsg = document.getElementById('loading-msg');
const bodyBg = document.getElementById('body-bg');

async function fetchWeather(city) {
    try {
        loadingMsg.innerText = "Buscando dados climáticos...";
        loadingMsg.classList.remove('hidden');
        weatherCard.classList.add('hidden');
        forecastContainer.classList.add('hidden');

        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
             throw new Error("Cidade não encontrada");
        }

        const { latitude, longitude, name, admin1 } = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
                
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        updateUI(name, admin1, weatherData);

    } catch (error) {
        loadingMsg.innerText = "Erro: " + error.message;
        console.error(error);
    }
}

function updateUI(city, state, data) {
    const current = data.current;
    const daily = data.daily;
            
    document.getElementById('city-name').innerText = `${city}, ${state || ''}`;
            
    const date = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('current-date').innerText = date.toLocaleDateString('pt-BR', options);

    document.getElementById('temperature').innerText = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('wind-speed').innerText = `${current.wind_speed_10m} km/h`;
    document.getElementById('humidity').innerText = `${current.relative_humidity_2m}%`;

    const weatherInfo = getWeatherInfo(current.weather_code);
    document.getElementById('description').innerText = weatherInfo.label;
    document.getElementById('weather-icon-container').innerHTML = `<i data-lucide="${weatherInfo.icon}" class="w-20 h-20 text-white"></i>`;

    document.getElementById('suggestion-text').innerHTML = `${getSuggestion(current.weather_code, current.temperature_2m)} ${weatherInfo.emoji}`;

    updateTheme(current.is_day, current.weather_code);

    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = ''; 

    for(let i = 1; i <= 3; i++) {
        const dayCode = daily.weather_code[i];
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const dayInfo = getWeatherInfo(dayCode);
                
        const nextDate = new Date();
        nextDate.setDate(date.getDate() + i);
        const dayName = nextDate.toLocaleDateString('pt-BR', { weekday: 'short' });

        const cardHtml = `
            <div class="glass rounded-xl p-3 flex flex-col items-center justify-center">
                <span class="text-sm font-semibold capitalize opacity-80">${dayName}.</span>
                <div class="my-2">
                    <i data-lucide="${dayInfo.icon}" class="w-8 h-8 text-white"></i>
                </div>
                <span class="text-lg font-bold">${maxTemp}°C</span>
            </div>
        `;
        forecastGrid.innerHTML += cardHtml;
    }

    loadingMsg.classList.add('hidden');
    weatherCard.classList.remove('hidden');
    forecastContainer.classList.remove('hidden');
    lucide.createIcons();
}


function getWeatherInfo(code) {
    if (code === 0) return { label: 'Céu Limpo', icon: 'sun', emoji: '☀️' };
    if (code >= 1 && code <= 3) return { label: 'Nublado', icon: 'cloud', emoji: '☁️' };
    if (code >= 45 && code <= 48) return { label: 'Neblina', icon: 'cloud-fog', emoji: '🌫️' };
    if (code >= 80 && code <= 82) return { label: 'Chuva com Sol', icon: 'cloud-sun-rain', emoji: '🌦️' };
    if (code >= 51 && code <= 67) return { label: 'Chuva', icon: 'cloud-rain', emoji: '☔ ' };
    if (code >= 71 && code <= 77) return { label: 'Neve', icon: 'snowflake', emoji: '⛄' };
    if (code >= 80 && code <= 82) return { label: 'Chuva Forte', icon: 'cloud-drizzle', emoji: '🌧️' };
    if (code >= 95) return { label: 'Tempestade', icon: 'cloud-lightning', emoji: '⛈️' };
    return { label: 'Indefinido', icon: 'cloud', emoji: '😐' };
}

function getSuggestion(code, temp) {
    if (code >= 95) return "Fique em casa! Perigo de raios.";
    if (code >= 51 && code <= 67) return "Não esqueça o guarda-chuva se for sair.";
    if (temp > 30) return "Beba muita água e use protetor solar!";
    if (temp < 15) return "Tempo perfeito para um café quente.";
    if (code === 0) return "Ótimo dia para passear no parque.";
    return "Aproveite o seu dia com tranquilidade.";
}

function updateTheme(isDay, code) {
    bodyBg.className = "min-h-screen text-white font-sans transition-colors duration-700 bg-gradient-to-br";

    if (isDay === 0) {
        bodyBg.classList.add("from-gray-900", "to-blue-900");
    } else {
        if (code >= 51 || code >= 95) { 
            bodyBg.classList.add("from-slate-600", "to-slate-800");
        } else if (code >= 1 && code <= 3) { 
            bodyBg.classList.add("from-blue-300", "to-blue-500");
        } else { 
            bodyBg.classList.add("from-blue-400", "to-cyan-400");
        }
    }
}

btn.addEventListener('click', () => {
    if(input.value) fetchWeather(input.value);
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value) fetchWeather(input.value);
});

lucide.createIcons();