const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // Fixed import - use 'auth' not 'protect'
const axios = require('axios');

// Current weather endpoint
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    console.log('Fetching weather for:', lat, lon);
    
    // Check if API key is available
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ 
        message: 'Weather API not configured',
        demoData: {
          temperature: 22,
          feelsLike: 24,
          humidity: 65,
          pressure: 1013,
          windSpeed: 3.5,
          description: 'clear sky',
          main: 'Clear',
          icon: '01d',
          location: 'Demo City'
        }
      });
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const weatherData = {
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      windSpeed: response.data.wind.speed,
      description: response.data.weather[0].description,
      main: response.data.weather[0].main,
      icon: response.data.weather[0].icon,
      location: response.data.name
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.message);
    
    // Return demo data if API fails
    res.json({
      temperature: 22 + Math.random() * 10,
      feelsLike: 24 + Math.random() * 8,
      humidity: 60 + Math.random() * 20,
      pressure: 1013,
      windSpeed: 2 + Math.random() * 5,
      description: 'partly cloudy',
      main: 'Clouds',
      icon: '02d',
      location: 'Local Farm',
      note: 'Demo data - configure WEATHER_API_KEY in .env'
    });
  }
});

// Weather forecast endpoint
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ 
        message: 'Weather API not configured',
        demoData: {
          city: 'Demo City',
          forecast: [
            { datetime: new Date().toISOString(), temperature: 22, description: 'clear sky', icon: '01d' },
            { datetime: new Date(Date.now() + 3*60*60*1000).toISOString(), temperature: 20, description: 'few clouds', icon: '02d' },
            { datetime: new Date(Date.now() + 6*60*60*1000).toISOString(), temperature: 18, description: 'scattered clouds', icon: '03d' }
          ]
        }
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const forecast = response.data.list.slice(0, 8).map(item => ({
      datetime: item.dt_txt,
      temperature: item.main.temp,
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }));

    res.json({
      city: response.data.city.name,
      forecast
    });
  } catch (error) {
    console.error('Weather forecast error:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather forecast' });
  }
});

// Weather alerts endpoint - FIXED: use 'auth' not 'protect'
router.get('/alerts', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    if (!process.env.WEATHER_API_KEY) {
      return res.json({
        location: 'Demo Farm',
        alerts: [
          { time: new Date().toISOString(), alert: 'Moderate rain expected tomorrow', severity: 'moderate' },
          { time: new Date(Date.now() + 24*60*60*1000).toISOString(), alert: 'Strong winds in afternoon', severity: 'high' }
        ]
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const alerts = [];
    const forecasts = response.data.list.slice(0, 8);

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

    res.json({
      location: response.data.city.name,
      alerts: alerts.slice(0, 5)
    });
  } catch (error) {
    console.error('Weather alerts error:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather alerts' });
  }
});

// Save location endpoint - FIXED: use 'auth' not 'protect'
router.post('/location', auth, async (req, res) => {
  try {
    const { lat, lon, address } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Import User model inside the function to avoid circular dependencies
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      farmLocation: {
        coordinates: { lat, lon },
        address
      }
    });

    res.json({ message: 'Farm location saved successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;