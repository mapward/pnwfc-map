// /api/locations.js
export default async function handler(req, res) {
  const BASE_ID = "appfUboy1dpaUpbKE";
  const TABLE_NAME = "Members of the PNW Fiber Economy";
  const VIEW_NAME = "Mappable Only";
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const headers = {
    Authorization: `Bearer ${process.env.AIRTABLE_MAP_TOKEN}`
  };

  const allRecords = [];
  let offset = undefined;

  try {
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`);
      url.searchParams.append("view", VIEW_NAME);
      if (offset) url.searchParams.append("offset", offset);

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: text });
      }

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    res.status(200).json(allRecords.map(x => { 
      return { ...x.fields }
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Airtable data" });
  }
}
