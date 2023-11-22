const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config()

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {polling: true})

bot.onText(/\/start/, (msg) => {
    const imagePath = './images/start-image.png';
    const welcomeText = `\n\nWelcome to WeatherBot! Your cheerful guide to the forecast.\n Ask me about the weather anywhere, anytime. 🌞🌦️❄️`;
    bot.sendPhoto(msg.chat.id, imagePath, {
        caption: `${welcomeText}`,
        parse_mode: 'Markdown'
        });
})


const myApiKey = `9069d7b9693a6b5a612b628da6629601`;

async function getCityName(cityName) { // Added 'async' keyword here
    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${myApiKey}`);
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.log('Failed to retrieve data');
        throw error; // Propagate the error so it can be caught in the calling code
    }
}

bot.on('text', async (msg) => {
    const chatId = msg.chat.id;
    let lat;
    let lon;

    try {
        const cityName = msg.text.trim();
        const jsonData = await getCityName(cityName);
        lat = jsonData[0].lat;
        lon = jsonData[0].lon;
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'You may have entered the wrong city/country name')
    }

    try {
        const weatherData = await fetchWeatherData(lat, lon);
        console.log(weatherData);
        bot.sendMessage(chatId, `
        📍 Location: ${weatherData.name}
🌡️ Temperature: ${parseInt(weatherData.main.temp - 273)} °C
🌊 Pressure: ${weatherData.main.pressure} hPa
💧 Humidity: ${weatherData.main.humidity}%
🌧️ Weather: ${weatherData.weather[0].description}
🌬️ Wind Speed: ${weatherData.wind.speed} m/s, Direction: ${weatherData.wind.deg}°
${weatherData.rain ?`🌧️ Rainfall (1 hour): ${weatherData.rain} mm` : ''}
        `)
    } catch (error) {
        console.log(error);        
    }
})

async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${myApiKey}`)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} Text: ${await response.text()}`)
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.log('Failed to retrieve weather data', error);
        throw error;
    }        
}

