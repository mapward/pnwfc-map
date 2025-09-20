import { parse } from 'csv-parse/sync'; // lightweight CSV parser

export default function handler(req, res) {
 // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    // 1. Read Base64 CSV from environment variable
    const base64Csv = process.env.LOCATIONS_BASE64;

    if (!base64Csv) {
      return res.status(400).json({ error: 'CSV environment variable not set' });
    }

    // 2. Decode Base64 to string
    const csvString = Buffer.from(base64Csv, 'base64').toString('utf-8');

    // 3. Parse CSV into JSON
    const records = parse(csvString, {
      columns: true,  // use first row as headers
      skip_empty_lines: true
    });

    // 4. Return JSON response
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
