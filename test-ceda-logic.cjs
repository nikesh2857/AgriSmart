require('dotenv').config();

const COMMODITIES = [
  { id: 1, name: 'Wheat' },
  { id: 3, name: 'Rice' },
  { id: 15, name: 'Cotton' },
  { id: 150, name: 'Sugarcane' },
  { id: 4, name: 'Maize' },
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  const apiKey = process.env.CEDA_API_KEY;
  if (!apiKey) throw new Error("no key");
  
  const to_date = '2024-12-31';
  const from_date = '2024-09-01';
  const results = [];

  for (const commodity of COMMODITIES) {
    try {
      await delay(1000); // 1 sec delay
      console.log("Fetching", commodity.name);
      const res = await fetch('https://api.ceda.ashoka.edu.in/v1/agmarknet/prices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commodity_id: commodity.id,
          state_id: 0,
          from_date,
          to_date
        })
      });
      const json = await res.json();
      console.log("Status:", json.output?.type || json.status, json.message || "");
      if (json.output?.type === 'success' && json.output?.data?.length > 0) {
        const sortedData = json.output.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sortedData[0];
        console.log("Latest:", latest.date, "Price:", latest.modal_price || latest.max_price);
        results.push(latest);
      }
    } catch (e) {
      console.error(e);
    }
  }
  console.log("Total results:", results.length);
}
run();
