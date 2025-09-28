<template>
	<Map
		:isDev 
		:sources
		@select-location="locationSelected"
	>
		<h2>{{ name }}</h2>
		<div>
			<a :href="website" target="_blank">{{ website }}</a>
		</div>

		<section style="margin-top: 1.5rem">
			<template v-if="isMember">
				<template v-if="producerType && isProducer()">
					<h3>Producer Type</h3>
					<div>{{ producerType }}</div>
				</template>

				<template v-if="profileUrl">
					<h3>
						<a :href="profileUrl" target="_blank">
							Member Profile
						</a>
					</h3>
				</template>
				
				<template v-if="socialUrl">
					<h3>Social Media</h3>
					<div>
						<a :href="socialUrl" target="_blank">
							{{ socialUrl }}
						</a>
					</div>
				</template>
				
				<template v-if="sell">
					<h3>Available Products</h3>
					<div>{{ sell }}</div>
				</template>
										
				<template v-if="education">
					<h3>Educational Opportunities</h3>
					<div>{{ education }}</div>
				</template>
				
				<template v-if="classUrl">
					<h3>Classes</h3>
					<div>
						<a :href="classUrl" target="_blank">{{ classUrl }}</a>
					</div>
				</template>

				<template v-if="retailType">
					<h3>Retailer Type</h3>
					<div>{{ retailType }}</div>
				</template>

				<template v-if="learningType">
					<h3>Learning Type</h3>
					<div>{{ learningType }}</div>
				</template>

				<template v-if="producerType">
					<h3>Producer Type</h3>
					<div>{{ producerType }}</div>
				</template>
				
				<template v-if="products">
					<h3>Products</h3>
					<div>{{ products }}</div>
				</template>
					
				<template v-if="sourcing">
					<h3>Sourcing Information</h3>
					<div>{{ sourcing }}</div>
				</template>
			</template>			
			
			<h3>Location</h3>
			<div>{{ address }}</div>
		</section>
	</Map>
</template>

<script setup>
import { createApp, computed, reactive, ref } from "vue";
import Map from './map.vue';

// set this to true for easier development
// here and there
const isDev = false;
const location = ref();

const sources = reactive({
	producers: {
		id: "producers",
		label: "Producers",
		icon: "farm",
		isVisible: true,
		filter: filterView("Producers")
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
		// function that returns true if a location is included
		// in the source
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

const name = computed(() => prop("Business Name") || prop("Name"));
const website = computed(() => prop("Business/Organization Website"));
const address = computed(() => prop("Business/Organization Address"));

const isMember = computed(() => prop("Membership Status") === "Active");

const profileUrl = computed(() => prop("Link to PNWFC Member Profile"));
const socialUrl = computed(() => prop("Link/s to social media"));
const classUrl = computed(() => prop("Link to Classes"));

const sell = computed(() => prop("What do they sell?"));
const education = computed(() => prop("Educational Opportunities (Tours, courses, internships, etc.)"));

const products = computed(() => parseList("Product and/or Service Type(s)"));
const sourcing = computed(() => parseList("Product Sourcing Information"));

const retailType = computed(() => parseList("Retailer Type"));
const learningType = computed(() => prop("Learning Type"));
const producerType = computed(() => parseList("Producer Type"));

function locationSelected(x) {
	location.value = x;
}

function filterView(viewType) {
	return x => x.properties["Map Views"] === viewType 
		&& x.properties["Approved for Map? (Internal Only)"] === "Approved";
}

function prop(propName) {
	return location?.value?.properties[propName];
}

function isProducer() {
	return prop("Map Views") === "Producer";
}

function isRetailer() {
	return prop("Map Views") === "Retailers";
}
		
function parseList(x) {
	return JSON.parse(prop(x) || "[]").join("; ");
}
</script>

<style scoped>
h2 {
   color: black;
   font-size: 1.5rem;
   font-family: "Donegal One", serif;
   font-weight: normal;
   margin-top: 0;
   margin-bottom: 0.1rem;
}

h3 {
   font-size: 1.25rem;
   margin-bottom: 0.1rem;
}

a {
   color: black;
}
</style>
