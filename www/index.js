// coming soon: vue app
//
// import { createApp } from 'vue';
// import WoolMapApp from './app.vue';

// createApp(WoolMapApp).mount('#wool-map-app');

const map = new mapboxgl.Map({
   container: "map",
   style: "mapbox://styles/mapbox/streets-v12",
   center: [-122.8, 47.04],
   zoom: 10,
   accessToken:
      "pk.eyJ1IjoicG53ZmMiLCJhIjoiY21kdWdxMWdxMGp4MjJrb2tydG5pNDBubCJ9.f6fYE5chIPEXv9Qx4P1VHg"
});

const infoWindow = document.getElementById("info-window");

map.addControl(
   new mapboxgl.NavigationControl({ showCompass: false }),
   "top-left"
);

map.on("style.load", () => {
   const data = getData();
   const geoJson = toGeoJson(data);

   map.addSource("locations", { type: "geojson", data: geoJson });

   // Icon layer
   map.addLayer({
      id: "locations",
      type: "symbol",
      source: "locations",
      layout: {
         "icon-image": "clothing-store", // built-in maki icon
         "icon-size": 1.2,
         "icon-anchor": "top",
         "icon-allow-overlap": true
      }
   });

   // Text layer
   map.addLayer({
      id: "location-names",
      type: "symbol",
      source: "locations",
      minzoom: 10, // text only appears at zoom 10+
      layout: {
         "text-field": "{name}",
         "text-size": 16,
         "text-offset": [0, 3.8],
         "text-anchor": "bottom",
         // TODO: to make the text clickable, make a transparent image
         // to use as the icon, so the text has a clickable area
         "icon-image": "",
         "icon-optional": true
      },
      paint: {
         "text-color": "black",
         "text-halo-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "pink",
            "white"
         ],
         "text-halo-width": 1.5
      }
   });

   // Clicking on a feature will highlight it and display its properties in the info window
   let selectedFeature = null;
   map.addInteraction("click-icons", {
      type: "click",
      target: { layerId: "locations" },
      handler: selectFeature
   });
   
   map.addInteraction("click-text", {
      type: "click",
      target: { layerId: "location-names" },
      handler: selectFeature
   });

   function selectFeature({ feature }) {
      if (selectedFeature) {
         map.setFeatureState(selectedFeature, { selected: false });
      }

      selectedFeature = feature;
      map.setFeatureState(feature, { selected: true });
      showInfo(feature);
   }

   // Clicking on the map will deselect the selected feature
   map.addInteraction("map-click", {
      type: "click",
      handler: () => {
         if (selectedFeature) {
            map.setFeatureState(selectedFeature, { selected: false });
            selectedFeature = null;
            infoWindow.style.display = "none";
         }
      }
   });

   // Hovering over a feature will highlight it
   map.addInteraction("mouseenter", {
      type: "mouseenter",
      target: { layerId: "locations" },
      handler: ({ feature }) => {
         map.setFeatureState(feature, { highlight: true });
         map.getCanvas().style.cursor = "pointer";
      }
   });

   // Moving the mouse away from a feature will remove the highlight
   map.addInteraction("mouseleave", {
      type: "mouseleave",
      target: { layerId: "locations" },
      handler: ({ feature }) => {
         map.setFeatureState(feature, { highlight: false });
         map.getCanvas().style.cursor = "";
         return false;
      }
   });
});

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
         properties: { name: x.Name }
      }))
   };
}

const showInfo = (feature) => {
   infoWindow.innerHTML = `
            <div class="map-overlay-inner">
                <h4>${feature.properties.name}</h4><hr>
                ${Object.entries(feature.properties)
                                                   .map(([key, value]) => `<li><b>${key}</b>: ${value}</li>`)
                                                   .join("")}
            </div>`;

   infoWindow.style.display = "block";
};

function getData() {
   return rawData.split("\n").map((line) => {
      const [Name, Latitude, Longitude] = line.split(",");
      return {
         Name,
         Latitude,
         Longitude
      };
   });
}

const rawData = `Store 1,47.38565,-122.82764
Store 2,47.045356,-122.893574
Store 3,47.239119,-121.968585`;
