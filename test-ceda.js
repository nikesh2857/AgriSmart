const fetch = require('node-fetch');

async function testCeda() {
  const token = 'e1d4bd549ed05a55cf474d07f5ae0d5d1fb273fa7023d3a3b1273e8c8fc27f7b';
  
  // Get date for last 7 days
  const to_date = new Date().toISOString().split('T')[0];
  const from_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const body = {
    commodity_id: 1, // Wheat
    state_id: 0, // All India
    from_date,
    to_date
  };

  const res = await fetch('https://api.ceda.ashoka.edu.in/v1/agmarknet/prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log(JSON.stringify(data).substring(0, 500));
}

testCeda();
