<template>
  <div>
    GRAPH-PAGES
  </div>
  <Serial />
  <div class="p-4 space-y-8">
   <div v-if="sensorIds.length === 0" class="text-gray-500 mt-4">
      No sensor data available yet.
    </div>

    <!-- Create a chart for each sensor -->
    <div v-for="sensorId in sensorIds" :key="sensorId">
      <h3 class="text-lg font-bold mb-2">Sensor: {{ sensorId }}</h3>
      <SensorChart :sensorId="sensorId" />
    </div>
  </div>

  <LineChart/>
  <LineChart/>
  <EmgSample/>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSensorStore } from '~/stores/sensor'
import SensorChart from '~/components/SensorChart.vue'

const sensorStore = useSensorStore()
const sensorIds = computed(() => Object.keys(sensorStore.sensorData))
</script>

<!-- <style scoped>
.btn {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded;
}
</style> -->