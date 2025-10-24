const axios = require('axios');

const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    
    return {
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
};

const getWeatherAlerts = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    
    const alerts = [];
    const forecasts = response.data.list.slice(0, 5); // Next 5 forecasts
    
    forecasts.forEach(forecast => {
      if (forecast.weather[0].main === 'Rain') {
        alerts.push({
          time: forecast.dt_txt,
          alert: 'Rain expected',
          severity: 'moderate'
        });
      }
      if (forecast.main.temp < 5) {
        alerts.push({
          time: forecast.dt_txt,
          alert: 'Freezing temperature expected',
          severity: 'high'
        });
      }
    });
    
    return alerts;
  } catch (error) {
    console.error('Weather alerts error:', error);
    return [];
  }
};

module.exports = { getWeatherData, getWeatherAlerts };