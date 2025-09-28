<template>
	<div>
		<div id="map" style="height:600px;"></div>
		<div v-cloak class="map-overlay right" :class="{ show: location, hide: !isInfoWindowVisible }">
			<div class="map-overlay-border">
				<svg class="border-svg">
					<rect x="10" y="10" width="96%" height="96%" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="20 12.36" vector-effect="non-scaling-stroke" />
				</svg>
				<div v-if="location" class="map-overlay-inner">
					<!-- X close button from HeroIcons -->
					<svg id="close-btn" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" @click="hideInfoWindow">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>

					<h2>{{ name }}</h2>
					<div>
						<a :href="website" target="_blank">{{ website }}</a>
					</div>

					<section style="margin-top: 1.5rem">
						<h3>Products</h3>
						<div>{{ products }}</div>

						<template v-if="producerType">
							<h3>Producer Type</h3>
							<div>{{ producerType }}</div>
						</template>

						<template v-if="sourcing">
							<h3>Sourcing Information</h3>
							<div>{{ sourcing }}</div>
						</template>
					</section>

					<section>
						<h3>Location</h3>
						<div>{{ address }}</div>
					</section>

					<section v-if="phone">
						<h3>Contact</h3>
						<div>{{ phone }}</div>
					</section>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
// Vue app
import { createApp, computed, onMounted, ref } from "vue";

// set this to true for easier development
// here and there
const isDev = false;
const location = ref();
const isInfoWindowVisible = ref(false);

function hideInfoWindow() {
	isInfoWindowVisible.value = false;
}

function prop(propName) {
	return location?.value?.properties[propName];
}

const name = computed(() => prop("Business Name") || prop("Name"));
// phone: computed(() => prop("Business Phone"))
const phone = "(555) 753-1234";
const website = computed(() => prop("Business/Organization Website"));
const address = computed(() => prop("Business/Organization Address"));
const products = computed(() => prop("Product and/or Service Type(s)"));
const producerType = computed(() => prop("Producer Type"));
const isMill = computed(() => prop("Fiber Processing Mill") === "checked");
const sourcing = computed(() => prop("Product Sourcing Information"));

onMounted(() => {
	// Mapbox stuff
	const map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/mapbox/streets-v12",
		center: [-122.8, 47.04], // overriden below via setCenter
		zoom: isDev ? 10 : 5,
		accessToken:
			"pk.eyJ1IjoicG53ZmMiLCJhIjoiY21kdWdxMWdxMGp4MjJrb2tydG5pNDBubCJ9.f6fYE5chIPEXv9Qx4P1VHg"
	});

	map.addControl(
		new mapboxgl.NavigationControl({ showCompass: false }),
		"top-left"
	);

	map.on("style.load", async () => {
		const data = await getData();
		const geoJson = toGeoJson(data);

		const center = getCenter(data);
		if (!isDev) {
			map.setCenter(center);
		}

		// For development, start with a feature already selected
		if (isDev) {
			selectFeature({ feature: geoJson.features[25] });
		}

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
				"text-field": "{Name}",
				"text-size": 16,
				"text-offset": [0, 3.8],
				"text-anchor": "bottom",
				"icon-image": "",
				"icon-optional": true
			},
			paint: {
				"text-color": "black",
				"text-halo-color": whenFeatureState({
					prop: "selected",
					whenTrue: "pink",
					whenFalse: "white"
				}),
				"text-halo-width": 1.5
			}
		});

		// Clicking on a feature will highlight it and display its properties in the info window
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
			if (location.value) {
				map.setFeatureState(location.value, { selected: false });
			}

			location.value = feature;
			isInfoWindowVisible.value = true;
			map.setFeatureState(feature, { selected: true });
		}

		// Clicking on the map will deselect the selected feature
		map.addInteraction("map-click", {
			type: "click",
			handler: hideInfoWindow
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

	function clearLocation() {
		if (location.value) {
			map.setFeatureState(location.value, { selected: false });
			location.value = null;
			isInfoWindowVisible.value = false;
		}
	}

	// utility function to make MapboxGL easier to read
	function whenFeatureState({ prop, whenTrue, whenFalse }) {
		return [
			"case",
			["boolean", ["feature-state", prop], false],
			whenTrue,
			whenFalse
		];
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

	// get the center of all the data points
	function getCenter(data) {
		const bounds = data.reduce(
			(result, val) => {
				const lng = parseFloat(val.Longitude);
				const lat = parseFloat(val.Latitude);

				if (lat < result.lat) {
					result.lat = lat;
				}
				if (lng < result.lng) {
					result.lng = lng;
				}
				if (lat > result.lat2) {
					result.lat2 = lat;
				}
				if (lng > result.lng2) {
					result.lng2 = lng;
				}

				return result;
			},
			{ lat: 90, lng: 0, lat2: 0, lng2: -180 }
		);

		const center = [
			(bounds.lng + bounds.lng2) / 2.0,
			(bounds.lat + bounds.lat2) / 2.0
		];

		return center;
	}

	async function getData() {
		const res = await fetch(
			"https://pnwfc-api-vercel.vercel.app/api/locations-demo"
		);
		if (!res.ok) {
			throw new Error(`Request failed: ${res.status}`);
		}
		return await res.json(); // parse JSON body
	}

});
</script>
