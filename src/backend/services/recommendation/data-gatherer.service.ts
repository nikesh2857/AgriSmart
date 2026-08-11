import prisma from '../../config/prisma';
import { fetchWeather } from '../weather.service';

export interface GatheredContext {
  farmerId: string;
  season: string;
  state: string;
  district: string;
  farmArea: number;
  soilType: string;
  weather: any;
  ph?: number;
  n?: number;
  p?: number;
  k?: number;
}

export async function gatherContext(
  userId: string,
  lat: number,
  lng: number,
  season: string,
  state: string,
  district: string,
  soilType: string,
  ph?: number,
  n?: number,
  p?: number,
  k?: number
): Promise<GatheredContext> {
  
  // 1. Fetch Farm Profile
  const farmProfile = await prisma.farmProfile.findUnique({
    where: { userId }
  });

  // 2. Fetch Weather
  let weatherData = null;
  try {
    const w = await fetchWeather({ lat: lat.toString(), lon: lng.toString() });
    weatherData = w.data;
  } catch (err) {
    console.error("Failed to fetch weather in data gatherer", err);
  }

  return {
    farmerId: userId,
    season: season.toUpperCase(),
    state: state.toUpperCase(),
    district: district.toUpperCase(),
    farmArea: farmProfile ? Number(farmProfile.totalArea) : 0,
    soilType: soilType.toUpperCase(),
    weather: weatherData,
    ph,
    n,
    p,
    k
  };
}
