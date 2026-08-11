const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const helper = `
const WeatherIcon = ({ main, className }: { main?: string; className?: string }) => {
  switch (main) {
    case 'Clear':
      return <Sun className={className} />;
    case 'Clouds':
      return <Cloud className={className} />;
    case 'Rain':
    case 'Drizzle':
      return <CloudRain className={className} />;
    case 'Thunderstorm':
      return <CloudLightning className={className} />;
    case 'Snow':
      return <Snowflake className={className} />;
    default:
      return <Sun className={className} />;
  }
};
`;

const updated = content.replace('export function Dashboard', helper + '\nexport function Dashboard')
  .replace('isRaining: boolean;', 'isRaining: boolean;\n    main?: string;')
  .replace('isRaining: boolean }[];', 'isRaining: boolean; main?: string }[];');

fs.writeFileSync('src/pages/Dashboard.tsx', updated);
console.log('done');
