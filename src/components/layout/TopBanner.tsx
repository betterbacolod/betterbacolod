import { Phone, Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';
import { useEffect, useState } from 'react';

const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'SGD', 'KRW', 'CNY'];

const TopBanner: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(
    null
  );
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=10.6762&longitude=122.9513&current=temperature_2m,weather_code'
    )
      .then(res => res.json())
      .then(data => {
        setWeather({
          temp: Math.round(data.current?.temperature_2m),
          code: data.current?.weather_code,
        });
      })
      .catch(() => {});

    fetch('https://api.exchangerate-api.com/v4/latest/PHP')
      .then(res => res.json())
      .then(data => setRates(data.rates || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx(i => (i + 1) % currencies.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="h-3.5 w-3.5 text-amber-500" />;
    if (code <= 3) return <Cloud className="h-3.5 w-3.5 text-slate-400" />;
    if (code <= 67) return <CloudRain className="h-3.5 w-3.5 text-sky-500" />;
    return <CloudLightning className="h-3.5 w-3.5 text-violet-500" />;
  };

  const curr = currencies[currentIdx];
  const rate = rates[curr] ? (1 / rates[curr]).toFixed(2) : null;

  return (
    <div className="bg-slate-50 border-b border-slate-200 text-xs">
      <div className="container mx-auto px-4 py-2 flex items-center justify-end">
        <div className="flex items-center divide-x divide-slate-300">
          <div className="flex items-center gap-3 pr-4 text-slate-600">
            <span>
              {new Date().toLocaleDateString('en-PH', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {weather && (
              <span className="flex items-center gap-1">
                {getWeatherIcon(weather.code)}
                {weather.temp}°C
              </span>
            )}
            {rate && (
              <span className="text-emerald-600 font-medium min-w-[80px]">
                1 {curr} = ₱{rate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pl-4">
            <Phone className="h-3.5 w-3.5 text-red-500" />
            <a
              href="tel:911"
              className="font-semibold text-red-600 hover:underline"
            >
              911
            </a>
            <a
              href="tel:0344323871"
              className="text-slate-600 hover:text-primary-600"
            >
              CDRRMO (034) 432-3871
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
