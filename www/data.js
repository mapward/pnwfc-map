
async function getData() {
   const res = await fetch("https://pnwfc-api-vercel.vercel.app/api/locations");

   if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
   }

   return await res.json();
}

function toGeoJson(records) {
   return {
      type: "FeatureCollection",
      features: records.map((x, index) => ({
         id: index,
         type: "Feature",
         geometry: {
            type: "Point",
            coordinates: [parseFloat(x.Longitude), parseFloat(x.Latitude)]
         },
         properties: { ...x }
      }))
   };
}

async function getGeoJsonData() {
   const records = await getData();
   return toGeoJson(records);
}

export { getGeoJsonData };