async function findLatest() {
  const token = 'e1d4bd549ed05a55cf474d07f5ae0d5d1fb273fa7023d3a3b1273e8c8fc27f7b';
  
  let from_date = `2024-09-01`;
  let to_date = `2024-10-31`;
  
  const res = await fetch('https://api.ceda.ashoka.edu.in/v1/agmarknet/prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      commodity_id: 1, // Wheat
      state_id: 0,
      from_date,
      to_date
    })
  });

  const json = await res.json();
  console.log("JSON:", JSON.stringify(json).substring(0, 500));
}
findLatest();
