<template>
  <!-- <Serial /> -->
  <!--   -->
  <!-- <div class="w-screen h-screen grid grid-flow-col grid-rows-2">
    <div class="row-span-2">
      <div class="bg-blue">     
        <div class="flex flex-row">
          <div>
            <label class="block text-sm">Frequência (Hz)</label>
            <input type="range" v-model="frequency" :min="1" :max="500" class="w-48" />
            <div>{{ frequency }} Hz</div>
          </div>
          <div>
            <label class="block text-sm">Amplitude</label>
            <input type="range" v-model="amplitude" :min="0.1" :max="10" step="0.1" class="w-48" />
            <div>{{ amplitude }}</div>
          </div>
          <div>
            <label class="block text-sm">Janela (s)</label>
            <input type="range" v-model="windowSec" :min="1" :max="5" step="0.5" class="w-48" />
            <div>{{ windowSec }} s</div>
          </div>
        </div>
      </div>  -->
  <div class="h-screen flex flex-col">
    <div class="flex h-1/50">s</div>
    <div class="h-full w-screen grid grid-flow-col grid-row-5 grid-cols-10 border-blue-600">
      <div ref="headerRef" class="border-emerald-600 col-start-1 col-end-9">
        <div class="h-fit border-pink-600 flex w-full row-span-1" v-for="value in colors">
            <LineChart
            :sensorIds="value"
            :frequency="frequency"
            :amplitude="amplitude"
            :windowSec="windowSec"
            :sampleRate="sampleRate"
            :color="getThemeColor(value)"
            :heigth="headerVH[0] / colors.length"
            :width="headerVH[1]"
            />
        </div>
      </div>
      <div class="border-fuchsia-500 col-start-9 col-end-11" ref="wRef">
        <div class="border-red-600 h-1/2">
          <p>1</p>
          <p>1</p>
          <p>1</p>
          <p>1</p>
        </div>
        <div class="border-red-600 h-1/2">2.3</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSensorStore } from "~/stores/sensor";
import SensorChart from "~/components/SensorChart.vue";
const colors = [
  "--color-first",
  "--color-second",
  "--color-third",
  "--color-fourth",
  "--color-fifth",
];

const frequency = ref(50);
const amplitude = ref(4);
const windowSec = ref(2);
const sampleRate = ref(1000);

const headerRef = ref<HTMLElement | null>(null);
const headerVH = ref([10, 10]);

const wRef = ref<HTMLElement | null>(null);
const wVH = ref([10, 10]);

function updateHeights() {
  if (headerRef.value) {
    headerVH.value = getVH(headerRef.value);
  }
  if (wRef.value) {
    wVH.value = getVH(wRef.value);
  }
}
onMounted(() => {
  updateHeights();
  // window.addEventListener('resize', updateHeights)
});

const sensorStore = useSensorStore();
const sensorIds = computed(() => Object.keys(sensorStore.sensorData));

function getVH(el: HTMLElement) {
  return [el.clientHeight, el.clientWidth];
}

function getThemeColor(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
</script>

<style scoped>
/* .teste{
  width: 50vw;
  height: 50vh;
} */
</style>
