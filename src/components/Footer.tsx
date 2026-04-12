"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from "lucide-react";
import quotesData from "@/content/quotes/footerQuotes.json";
import type { FooterQuote } from "@/lib/types";

type WeatherApiResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

function getWeatherIcon(weatherCode: number) {
  if (weatherCode === 0) return { icon: Sun, label: "Clear" };
  if (weatherCode === 1 || weatherCode === 2) return { icon: CloudSun, label: "Partly cloudy" };
  if (weatherCode === 3) return { icon: Cloud, label: "Overcast" };
  if (weatherCode === 45 || weatherCode === 48) return { icon: CloudFog, label: "Foggy" };
  if (weatherCode >= 51 && weatherCode <= 57) return { icon: CloudDrizzle, label: "Drizzle" };
  if (weatherCode >= 61 && weatherCode <= 67) return { icon: CloudRain, label: "Rain" };
  if (weatherCode >= 71 && weatherCode <= 77) return { icon: Snowflake, label: "Snow" };
  if (weatherCode >= 80 && weatherCode <= 82) return { icon: CloudRain, label: "Rain showers" };
  if (weatherCode >= 85 && weatherCode <= 86) return { icon: Snowflake, label: "Snow showers" };
  if (weatherCode >= 95) return { icon: CloudLightning, label: "Thunderstorm" };
  return { icon: Cloud, label: "Weather" };
}

const AUSTIN_TIME_ZONE = "America/Chicago";

const Footer: React.FC = () => {
  const quotes = quotesData as FooterQuote[];
  const [quote, setQuote] = useState<FooterQuote | null>(null);
  const [timeLabel, setTimeLabel] = useState<string>("");
  const [weather, setWeather] = useState<{ temperature: number; code: number } | null>(null);

  const fallbackQuote = useMemo<FooterQuote>(
    () => ({ text: "Build with care, then improve with feedback.", author: "Site default" }),
    []
  );

  useEffect(() => {
    if (quotes.length === 0) {
      setQuote(fallbackQuote);
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex] ?? fallbackQuote);
  }, [quotes, fallbackQuote]);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: AUSTIN_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
    });

    const updateTime = () => {
      setTimeLabel(formatter.format(new Date()));
    };

    updateTime();
    const intervalId = window.setInterval(updateTime, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=30.2672&longitude=-97.7431&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago",
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error("Weather request failed");

        const data = (await response.json()) as WeatherApiResponse;
        const temperature = data.current?.temperature_2m;
        const weatherCode = data.current?.weather_code;

        if (typeof temperature !== "number" || typeof weatherCode !== "number") {
          throw new Error("Weather response missing values");
        }

        if (!isCancelled) {
          setWeather({ temperature, code: weatherCode });
        }
      } catch {
        if (!isCancelled) setWeather(null);
      }
    };

    void loadWeather();
    return () => {
      isCancelled = true;
    };
  }, []);

  const activeQuote = quote ?? fallbackQuote;
  const weatherDisplay = weather ? getWeatherIcon(weather.code) : { icon: Cloud, label: "Weather unavailable" };
  const WeatherIcon = weatherDisplay.icon;

  return (
    <footer className="w-full border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark py-6 text-xs">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-4 px-4 md:grid-cols-3">
        <div className="order-2 md:order-1 flex h-full flex-col justify-center text-center md:text-left text-border-light dark:text-border-dark">
          <p className="italic">&ldquo;{activeQuote.text}&rdquo;</p>
          {activeQuote.author && <p className="mt-1 opacity-80">- {activeQuote.author}</p>}
        </div>

        <div className="order-1 md:order-2 flex h-full flex-col items-center justify-center gap-2 text-center text-border-light dark:text-border-dark">
          <div
            aria-label="Current status"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(122,90,54,0.28)] dark:border-[rgba(216,199,171,0.24)] bg-[rgba(183,199,163,0.12)] dark:bg-[rgba(183,199,163,0.16)] px-3 py-1 text-border-light dark:text-border-dark"
          >
            <span className="text-[10px] uppercase tracking-[0.16em] opacity-80">Status</span>
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inline-flex h-3 w-3 rounded-full bg-[rgba(183,199,163,0.3)] dark:bg-[rgba(183,199,163,0.34)] motion-safe:animate-ping"
              />
              <span
                aria-hidden="true"
                className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#b7c7a3]"
              />
            </span>
            <span>Waiting for NiKo to win a Major</span>
          </div>
          <span>© {new Date().getFullYear()} Anjie Zhou</span>
        </div>

        <div className="order-3 md:order-3 flex h-full flex-col items-center justify-center gap-2 text-center md:items-end md:text-right text-border-light dark:text-border-dark">
          <div className="space-y-0.5">
            <p>Austin, TX · {timeLabel || "--:--"}</p>
            <p className="inline-flex items-center gap-1.5">
              <WeatherIcon
                size={14}
                strokeWidth={1.9}
                aria-hidden="true"
                className="text-[color:var(--color-hero-kicker)] dark:text-[color:var(--color-hero-subtitle)]"
              />
              <span className="sr-only">{weatherDisplay.label}</span>
              <span>{weather ? `${Math.round(weather.temperature)}F` : "--"}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
