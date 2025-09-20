// /api/locations.js
export default async function handler(req, res) {
  const BASE_ID = "app1234567890";     // Replace with your Base ID
  const TABLE_NAME = "Customers";      // Replace with your table name
  const VIEW_NAME = "Grid view";       // Replace with your view name

  const headers = {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
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

    res.status(200).json(allRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Airtable data" });
  }
}
