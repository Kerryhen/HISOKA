<template>
  <Serial />
  <div class="p-4 space-y-8">
   <div v-if="sensorIds.length === 0" class="text-gray-500 mt-4">
      {{ $t("no_sensor_data") }}
    </div>
  </div>
  <div v-for="sensorId in sensorIds" :key="sensorId">
    <SensorChart :sensorId="sensorId" />
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