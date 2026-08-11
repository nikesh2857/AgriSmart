const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const route = `
  app.get("/api/weather", async (req, res) => {
    try {
      const { query, lat, lon } = req.query;
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenWeather API key missing" });
      }
      
      let finalLat = lat;
      let finalLon = lon;
      let locationName = "";

      if (query) {
        const geoRes = await fetch(\`http://api.openweathermap.org/geo/1.0/direct?q=\${encodeURIComponent(query)}&limit=1&appid=\${apiKey}\`);
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) {
          return res.status(404).json({ error: "Location not found" });
        }
        finalLat = geoData[0].lat;
        finalLon = geoData[0].lon;
        locationName = \`\${geoData[0].name}\${geoData[0].state ? \`, \${geoData[0].state}\` : ''}\`;
      }

      if (!finalLat || !finalLon) {
        return res.status(400).json({ error: "Missing lat/lon or query" });
      }

      const weatherRes = await fetch(\`https://api.openweathermap.org/data/2.5/weather?lat=\${finalLat}&lon=\${finalLon}&appid=\${apiKey}&units=metric\`);
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(\`https://api.openweathermap.org/data/2.5/forecast?lat=\${finalLat}&lon=\${finalLon}&appid=\${apiKey}&units=metric\`);
      const forecastData = await forecastRes.json();

      const isRaining = (main) => ['Rain', 'Thunderstorm', 'Drizzle'].includes(main);

      const currentInfo = {
        desc: weatherData.weather[0].description,
        isRaining: isRaining(weatherData.weather[0].main)
      };

      const futureForecast = [];
      const seenDays = new Set();
      // Use local date from API, approximation since OpenWeather returns UTC dt_txt. 
      // dt_txt is "YYYY-MM-DD HH:MM:SS"
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      
      for (const item of forecastData.list) {
        const dateObj = new Date(item.dt * 1000);
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (day !== today && !seenDays.has(day)) {
          seenDays.add(day);
          futureForecast.push({
            day: futureForecast.length === 0 ? 'Tomorrow' : day,
            temp: Math.round(item.main.temp),
            isRaining: isRaining(item.weather[0].main)
          });
        }
        if (futureForecast.length >= 5) break;
      }

      res.json({
        locationName: locationName || weatherData.name,
        temp: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6),
        description: currentInfo.desc.charAt(0).toUpperCase() + currentInfo.desc.slice(1),
        isRaining: currentInfo.isRaining,
        forecast: futureForecast
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

const updated = content.replace('  // 1. Chatbot', route + '\n  // 1. Chatbot');
fs.writeFileSync('server.ts', updated);
console.log('Done inserting');
