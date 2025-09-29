<template>
	<Map
		:isDev
		:data
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

// set this to true for easier development
// here and there
const isDev = false;
const data = ref(); 
const location = ref();

const sources = reactive({
	producers: {
		id: "producers",
		label: "Producers",
		icon: "farm",
		isVisible: true,
		// function that returns true if a location is included
		// in the source
		filter: filterView("Producer")
	},
	artisans: {
		id: "artisans",
		label: "Artisans",
		icon: "ranger-station",
		isVisible: true,
		filter: filterView("Artisans")
	},
	retailers: {
		id: "retailers",
		label: "Retailers",
		icon: "clothing-store",
		isVisible: true,
		filter: filterView("Retailers")
	},
	processors: {
		id: "processors",
		label: "Processors",
		icon: "doctor",
		isVisible: true,
		filter: filterView("Processors")
	},
	schools: {
		id: "schools",
		label: "Learning",
		icon: "library", 
		isVisible: true,
		filter: filterView("Learning")
	}
});

function filterView(viewType) {
   return x => x.properties["Map Views"] === viewType 
      && x.properties["Approved for Map? (Internal Only)"] === "Approved";
}

onMounted(async () => {
	const res = await fetch("https://pnwfc-api-vercel.vercel.app/api/locations");

	if (!res.ok) {
		throw new Error(`Request failed: ${res.status}`);
	}

	data.value = await res.json();
});
</script>