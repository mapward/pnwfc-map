<template>
	<div>
		<div>
			<div id="map" style="height:600px;"></div>

			<div v-cloak id="source-select-overlay">
				<div>
					<label>
						<input
							v-model="selectedSource"
							type="radio" 
							:value="all" />
						All locations
					</label>
				</div>
				<div v-for="source in props.sources">
					<label>
						<input type="radio" :value="source.id" v-model="selectedSource"/>
						{{ source.label }}
					</label>       
				</div>
			</div>
		</div>

		<div
			v-cloak
			class="map-overlay right"
			:class="{ show: location, hide: !isInfoWindowVisible }">
			<div class="map-overlay-border">
				<svg class="border-svg">
<!-- 					<rect
						x="10" y="10"
						width="96%" height="96%"
						fill="none" stroke="currentColor"
						stroke-width="4"
						stroke-dasharray="20 12.36"
						vector-effect="non-scaling-stroke" />
 -->				</svg>
				<div v-if="location" class="map-overlay-inner">
					<!-- X close button from HeroIcons -->
					<svg
						id="close-btn"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5" stroke="currentColor"
						class="size-6"
						@click="hideInfoWindow">
						<path
							stroke-linecap="round"
							stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>

					<!-- the location template is defined by the parent -->
					<slot/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch, watchEffect } from 'vue';

const props = defineProps({
	isDev: { type: Boolean, default: false },
	geoJson: Object,
	sources: Object
});

const emit = defineEmits(['select-location']);

const all = "all";
const location = ref();
const selectedSource = ref(all);
const isInfoWindowVisible = ref(false);

function hideInfoWindow() {
	isInfoWindowVisible.value = false;
}

// Wait for mounted before calling the mapbox stuff
// because it needs the DOM to be loaded. Then
// wait for the geoJson prop to come in.
onMounted(() => {
	watch(() => props.geoJson, value => {
		if (value) {
			loadMap(value);
		}
	}, { immediate: true });	
});

function loadMap(geoJson) {
	// Mapbox stuff
	const map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/mapbox/streets-v12",
		center: [-122.8, 47.04], // overriden below via setCenter
		zoom: props.isDev ? 10 : 5,
		accessToken:
			"pk.eyJ1IjoicG53ZmMiLCJhIjoiY21kdWdxMWdxMGp4MjJrb2tydG5pNDBubCJ9.f6fYE5chIPEXv9Qx4P1VHg"
	});

	map.addControl(
		new mapboxgl.NavigationControl({ showCompass: true }),
		"top-left"
	);

	map.on("style.load", async () => {
		const center = getCenter(geoJson);
		if (!props.isDev) {
			map.setCenter(center);
		}

		// For development, start with a feature already selected
		if (props.isDev) {
			selectFeature({ feature: geoJson.features[25] });
		}

		Object.values(props.sources).forEach(source => {
			map.addSource(source.id, { type: "geojson", data: {
				...geoJson,
				features: geoJson.features.filter(source.filter)
			}})
		});

		Object.values(props.sources).forEach(source => {
			map.addLayer(getCircleLayer(source.id, source.color));
			// map.addLayer(getIconLayer(source.id, source.icon));
			map.addLayer(getTextLayer(source.id));
		});

		function getCircleLayer(source, color) {
			return {
				id: `${source}-circles`,
				type: 'circle',
				source: source,
				paint: {
					'circle-radius': 10,
					'circle-color': color || '#FF3333',
					'circle-stroke-width': 1,
					'circle-stroke-color': '#FFFFFF'
				}
			};
		}

		function getIconLayer(source, image) {
			return {
				id: `${source}-icons`,
				type: "symbol",
				source: source,
				layout: {
					"icon-image": image,
					"icon-size": 1.2,
					"icon-anchor": "top",
					"icon-allow-overlap": true
				}
			};
		}

		function getTextLayer(source) {
			return {
				id: `${source}-names`,
				type: "symbol",
				source: source,
				minzoom: 10, // text only appears at zoom 10+
				layout: {
					"text-field": "{Name}",
					"text-size": 16,
					"text-offset": [0, 0],
					"text-anchor": "bottom",
					"icon-image": "",
					"icon-optional": true
				},
				paint: {
					"text-color": "black",
					"text-halo-color": whenFeatureState({
						prop: "selected",
						whenTrue: "#F7CC86", // light orange
						whenFalse: "white"
					}),
					"text-halo-width": 1.5
				}
			};
		}

		Object.values(props.sources)
			// each source has two layers: icons and text
			.flatMap((source) => [`${source.id}-circles`, `${source.id}-names`])
			.forEach((layer) => {
				// Clicking on a feature will highlight it and display
				// its properties in the info window
				map.addInteraction(`click-${layer}`, {
					type: "click",
					target: { layerId: layer },
					handler: selectFeature
				});
			
				// Hovering over a feature will highlight it
				map.addInteraction(`mouseenter-${layer}`, {
					type: "mouseenter",
					target: { layerId: layer },
					handler: ({ feature }) => {
						map.setFeatureState(feature, { highlight: true });
						map.getCanvas().style.cursor = "pointer";
					}
				});

				// Moving the mouse away from a feature will remove the highlight
				map.addInteraction(`mouseleave-${layer}`, {
					type: "mouseleave",
					target: { layerId: layer },
					handler: ({ feature }) => {
						map.setFeatureState(feature, { highlight: false });
						map.getCanvas().style.cursor = "";
						return false;
					}
				});
			});

		function selectFeature({ feature }) {
			if (location.value) {
				map.setFeatureState(location.value, { selected: false });
			}

			location.value = feature;
			isInfoWindowVisible.value = true;
			map.setFeatureState(feature, { selected: true });
		}

		watchEffect(() => {
			emit('select-location', location.value);
		});

		watchEffect(() => {
			if (selectedSource.value === all) {
				Object.values(props.sources).forEach(x => {
					x.isVisible = true;
				});
			}
			else {
				Object.values(props.sources).forEach(x => {
					x.isVisible = selectedSource.value === x.id;
				});
			}
		})

		// React to changes in the selected sources
		watchEffect(() => {
			function getVisibility(b) {
				return b ? "visible" : "none";
			}

			Object.values(props.sources).forEach(x => {        
				map.setLayoutProperty(
					`${x.id}-names`,
					"visibility",
					getVisibility(x.isVisible)
				);

				map.setLayoutProperty(
					`${x.id}-circles`,
					"visibility",
					getVisibility(x.isVisible)
				);       
			});
		});

		// Clicking on the map will deselect the selected feature
		map.addInteraction("map-click", {
			type: "click",
			handler: hideInfoWindow
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

	// get the center of all the data points
	function getCenter(geoJson) {
		const bounds = geoJson.features.reduce(
			(result, val) => {
				const lng = parseFloat(val.geometry.coordinates[0]);
				const lat = parseFloat(val.geometry.coordinates[1]);

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
}
</script>

<style>
.map-overlay {
	background-color: rgb(231, 209, 181);
	color: rgb(72, 101, 72);

	font-size: normal;
	line-height: 1.5;
	font-family: Barlow, sans-serif;
	padding: 3rex;
	padding-top: 0.7rem;

	position: absolute;
	right: 0;
	top: 0;
	width: 60rex;

	transform: translateX(100%);
	opacity: 0;
	transition: transform 0.4s ease, opacity 0.4s ease;

	z-index: 5;
}

.map-overlay {
	border: double 10px rgb(72, 101, 72);
	border-top: 0;
	border-right: 0;
}

.map-overlay.show {
	opacity: 1;
	transform: translateX(0);
}
.map-overlay.hide {
	transform: translateX(100%);
	opacity: 0;
}
.map-overlay-inner {
	padding: 10px;
	border-radius: 3px;
}

.map-overlay #close-btn {
	position: absolute;
	right: 0;
	top: 0;
	margin: 2rex;
	width: 4rex;
	cursor: pointer;
}

.map-overlay .border-svg {
	color: rgb(241, 166, 56);
	color: rgb(72, 101, 72);
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none; /* allows clicks through */
}

#source-select-overlay {
	background: white;
	background-color: rgb(231, 209, 181);
	color: rgb(72, 101, 72);

	border: rgb(72, 101, 72) solid 2px;
	border-radius: 3px;

	padding: 1.75rex;
	padding-right: 2.5rex;

	font-family: Barlow, sans-serif;
	position: absolute;
	left: 10px;
	top: 413px;
}
</style>