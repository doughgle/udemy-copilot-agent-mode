"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCountryFlag } from "@/lib/countryFlags";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface MarineWeather {
  time: string;
  interval: number;
  wave_height: number | null;
  sea_surface_temperature: number | null;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<MarineWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const searchLocations = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedLocation(null);
    setWeatherData(null);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchQuery
        )}&count=10&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data = await response.json();

      if (!data.results) {
        setLocations([]);
        setError("No locations found. Try a different search term.");
      } else {
        setLocations(data.results);
      }
    } catch (err) {
      setError("An error occurred while searching for locations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMarineWeather = async (location: Location) => {
    setSelectedLocation(location);
    setWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);

    try {
      const response = await fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${location.latitude}&longitude=${location.longitude}&current=wave_height,sea_surface_temperature`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch marine weather data");
      }

      const data = await response.json();
      setWeatherData(data.current);
    } catch (err) {
      setWeatherError("Failed to fetch marine weather data for this location.");
      console.error(err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Check if location is in France
  const isLocationInFrance = selectedLocation?.country === "France";

  // Check if marine data is missing
  const hasNoMarineData = weatherData && 
    (weatherData.wave_height === null || weatherData.sea_surface_temperature === null);

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-center">Surf Report</h1>
        <p className="text-muted-foreground text-center max-w-lg">
          Search for a coastal location to check the latest marine weather conditions for surfing.
        </p>

        <form
          onSubmit={searchLocations}
          className="w-full max-w-md space-y-4"
        >
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !searchQuery.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </form>

        {selectedLocation && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Selected Location</span>
                {weatherLoading && <span className="text-sm font-normal">Loading...</span>}
              </CardTitle>
              <CardDescription>
                {selectedLocation.name}, {getCountryFlag(selectedLocation.country)} {selectedLocation.country} 
                {selectedLocation.admin1 ? ` (${selectedLocation.admin1})` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weatherError && (
                <p className="text-destructive">{weatherError}</p>
              )}
              
              {/* Display a location-specific message when no marine data is available */}
              {hasNoMarineData && isLocationInFrance ? (
                <div className="flex flex-col items-center text-center p-4 space-y-4">
                  <Image 
                    src="/baguette.svg"
                    alt="French baguette"
                    width={170}
                    height={170}
                    className="opacity-90"
                  />
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Too bad! No surf, have a baguette instead mon amis 😃</h3>
                  </div>
                </div>
              ) : hasNoMarineData ? (
                <div className="flex flex-col items-center text-center p-4 space-y-4">
                  <Image 
                    src="/bbq.svg"
                    alt="BBQ grill"
                    width={170}
                    height={170}
                    className="opacity-90"
                  />
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Too bad! No surf, have a BBQ instead dude! :)</h3>
                  </div>
                </div>
              ) : weatherData && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time of measurement</p>
                    <p className="font-medium">{formatDate(weatherData.time)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Wave Height</p>
                      <p className="text-2xl font-bold">{weatherData.wave_height} m</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Water Temp</p>
                      <p className="text-2xl font-bold">{weatherData.sea_surface_temperature}°C</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="w-full space-y-4 mt-2">
          {locations.length > 0 && !selectedLocation && (
            <h2 className="text-xl font-semibold">
              Results ({locations.length})
            </h2>
          )}

          {!selectedLocation && (
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((location) => (
                <Card 
                  key={location.id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => getMarineWeather(location)}
                >
                  <CardHeader>
                    <CardTitle>{location.name}</CardTitle>
                    <CardDescription>
                      {getCountryFlag(location.country)} {location.country} {location.admin1 ? `(${location.admin1})` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                    </p>
                    <p className="text-sm mt-2 text-primary font-medium">Click to view surf report</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedLocation && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedLocation(null);
                  setWeatherData(null);
                }}
              >
                Back to search results
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
