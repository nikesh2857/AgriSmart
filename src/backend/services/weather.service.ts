import getRedis from '../config/redis';

const WEATHER_TTL_SECONDS = 30 * 60; // 30 minutes

interface WeatherParams {
  query?: string;
  lat?: string;
  lon?: string;
}

export const fetchWeather = async (params: WeatherParams) => {
  const cacheKey = `weather:${params.query || `${params.lat}_${params.lon}`}`;
  const redis = getRedis();

  // Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { data: JSON.parse(cached), fromCache: true };
    }
  } catch {
    // Redis unavailable – proceed to live fetch
  }

  const apiKey = process.env.OPENWEATHER_API_KEY || 'bd1b1f951803d56ecbc4bf53466927e6';
  let finalLat = params.lat;
  let finalLon = params.lon;
  let locationName = '';

  if (params.query) {
    const geoRes = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(params.query)}&limit=1&appid=${apiKey}`);
    const geoData = await geoRes.json();
    if (!Array.isArray(geoData) || geoData.length === 0) throw new Error('Location not found');
    finalLat = geoData[0].lat;
    finalLon = geoData[0].lon;
    locationName = `${geoData[0].name}${geoData[0].state ? `, ${geoData[0].state}` : ''}`;
  }

  if (!finalLat || !finalLon) throw new Error('Missing lat/lon or query');

  const [weatherRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${finalLat}&lon=${finalLon}&appid=${apiKey}&units=metric`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${finalLat}&lon=${finalLon}&appid=${apiKey}&units=metric`),
  ]);

  const [weatherData, forecastData] = await Promise.all([weatherRes.json(), forecastRes.json()]);

  const isRaining = (main: string) => ['Rain', 'Thunderstorm', 'Drizzle'].includes(main);
  const futureForecast: any[] = [];
  const seenDays = new Set<string>();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  for (const item of forecastData.list) {
    const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    if (day !== today && !seenDays.has(day)) {
      seenDays.add(day);
      futureForecast.push({
        day: futureForecast.length === 0 ? 'Tomorrow' : day,
        temp: Math.round(item.main.temp),
        isRaining: isRaining(item.weather[0].main),
        main: item.weather[0].main,
      });
    }
    if (futureForecast.length >= 5) break;
  }

  const result = {
    locationName: locationName || weatherData.name,
    temp: Math.round(weatherData.main.temp),
    humidity: weatherData.main.humidity,
    windSpeed: Math.round(weatherData.wind.speed * 3.6),
    description: (weatherData.weather[0].description as string).charAt(0).toUpperCase() + (weatherData.weather[0].description as string).slice(1),
    isRaining: isRaining(weatherData.weather[0].main),
    main: weatherData.weather[0].main,
    forecast: futureForecast,
  };

  // Cache the result
  try {
    await redis.set(cacheKey, JSON.stringify(result), 'EX', WEATHER_TTL_SECONDS);
  } catch {
    // Cache write failed; non-fatal
  }

  return { data: result, fromCache: false };
};
