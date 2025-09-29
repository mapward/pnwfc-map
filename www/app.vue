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
const isDev = false;
const geoJson = ref(); 
const location = ref();

const sources = reactive({
	producers: {
		id: "producers",
		label: "Producers",
		icon: "farm",
		color: "black",
		isVisible: true,
		// function that returns true if a location is included
		// in the source
		filter: filterView("Producer")
	},
	artisans: {
		id: "artisans",
		label: "Artisans",
		icon: "ranger-station",
		color: "#F1A638", // orange
		isVisible: true,
		filter: filterView("Artisans")
	},
	retailers: {
		id: "retailers",
		label: "Retailers",
		icon: "clothing-store",
		color: "#A8C5A8", // light green
		isVisible: true,
		filter: filterView("Retailers")
	},
	processors: {
		id: "processors",
		label: "Processors",
		icon: "doctor",
		color: "#486548", // green
		isVisible: true,
		filter: filterView("Processors")
	},
	schools: {
		id: "schools",
		label: "Learning",
		icon: "library",
		color: "#F7CC86", // light orange, 
		isVisible: true,
		filter: filterView("Learning")
	}
});

function filterView(viewType) {
   return x => x.properties["Map Views"] === viewType 
      && x.properties["Approved for Map? (Internal Only)"] === "Approved";
}

onMounted(async () => {
	geoJson.value = await getGeoJsonData();
});
</script>