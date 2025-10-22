<template>
	<Map
		:isDev
		:geoJson
		:sources
		@select-location="selected => location = selected"
	>
		<LocationInfo :location />
	</Map>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import Map from './map.vue';
import LocationInfo from './locationInfo.vue';
import { getGeoJsonData } from './data.js';

// set this to true for easier development
// here and there
const isDev = true;
const geoJson = ref(); 
const location = ref();

const sources = reactive({
	processors: {
		id: "processors",
		label: "Processors",
		color: "#486548", // green
		isVisible: true,
		// function that returns true if a location is included
		// in the source
		filter: filterView("Processors")
	},
	retailers: {
		id: "retailers",
		label: "Retailers",
		color: "black",
		isVisible: true,
		filter: filterView("Retailers")
	},
	schools: {
		id: "schools",
		label: "Learning",
		color: "#F1A638", // orange
		isVisible: true,
		filter: filterView("Learning")
	},
	producers: {
		id: "producers",
		label: "Producers",
		color: "#A8C5A8", // light green
		isVisible: true,
		filter: filterView("Producer")
	},
	artisans: {
		id: "artisans",
		label: "Artisans",
		color: "#F7CC86", // light orange, 
		isVisible: true,
		filter: filterView("Artisans")
	}
});

function filterView(viewType) {
   return x => (x.properties["Map Views"] || []).includes(viewType)
      && x.properties["Approved for Map? (Internal Only)"] === "Approved";
}

onMounted(async () => {
	geoJson.value = await getGeoJsonData();
});
</script>