<template>
   <div>
      <h2>{{ name }}</h2>
      <div>
         <a :href="website" target="_blank">{{ website }}</a>
      </div>

      <section style="margin-top: 1.5rem">
         <template v-if="isMember">

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
               <h3>What do they sell?</h3>
               <div>{{ sell }}</div>
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
            
            <template v-if="education">
               <h3>Educational Opportunities</h3>
               <div>{{ education }}</div>
            </template>
            
            <template v-if="classUrl">
               <div>
                  <a :href="classUrl" target="_blank">
                     Link to classes
                  </a>
               </div>
            </template>

         </template>       

      </section>
   </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
   location: Object
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

function prop(propName) {
   return props.location?.properties[propName];
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