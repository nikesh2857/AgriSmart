const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const helper = `
const WeatherIcon = ({ main, className }: { main?: string; className?: string }) => {
  const getIcon = () => {
    switch (main) {
      case 'Clear':
        return <Sun className={\`\${className} text-yellow-300\`} />;
      case 'Clouds':
        return <Cloud className={\`\${className} text-blue-100\`} />;
      case 'Rain':
      case 'Drizzle':
        return <CloudRain className={\`\${className} text-blue-300\`} />;
      case 'Thunderstorm':
        return <CloudLightning className={\`\${className} text-purple-300\`} />;
      case 'Snow':
        return <Snowflake className={\`\${className} text-sky-200\`} />;
      default:
        return <Cloud className={\`\${className} text-white\`} />;
    }
  };
  return getIcon();
};
`;

const updated = content.replace(/const WeatherIcon = \(\{ main, className \}: \{ main\?: string; className\?: string \}\) => \{[\s\S]*?^\};/m, helper.trim());

fs.writeFileSync('src/pages/Dashboard.tsx', updated);
console.log('done');
