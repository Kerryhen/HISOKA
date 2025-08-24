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
        <div class="h-20 grow-0">
          s
        </div>
          <div class="h-screen grid grid-flow-col grid-row-5 gap-2">
            <div ref="headerRef">
              <div class="h-1/5 w-200" v-for="value in colors">
                <LineChart 
                  :sensorIds="value"
                  :frequency="frequency"
                  :amplitude="amplitude"
                  :windowSec="windowSec"
                  :sampleRate="sampleRate" 
                  :color="getThemeColor(value)"
                  :heigth="(headerVH[0]/(colors.length))"
                  :width="headerVH[1]"
                />
              </div>
            </div>
            <div class="bg-third h">
              <div class="justify-center bg-fourth h-1/2">
                  <p>1</p>
                  <p>1</p>
                  <p>1</p>
                  <p>1</p>
              </div>
              <div class=" bg-fifth h-1/2">2.3</div>
            </div>
          </div>
        
      </div>
    <!-- </div>
    <div class="bg-second">03</div>
    <div class="bg-third">02</div>
  </div> -->


</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSensorStore } from '~/stores/sensor'
import SensorChart from '~/components/SensorChart.vue'
const colors = ['--color-first','--color-second','--color-third','--color-fourth','--color-fifth']

const frequency = ref(50)
const amplitude = ref(5)
const windowSec = ref(2)
const sampleRate = ref(1000)

const headerRef = ref<HTMLElement | null>(null)
const headerVH = ref([10,10])

function updateHeights() {
  if(headerRef.value){
    headerVH.value = getVH(headerRef.value)
  }
}
onMounted(() => {
  updateHeights()
  // window.addEventListener('resize', updateHeights)
})

const sensorStore = useSensorStore()
const sensorIds = computed(() => Object.keys(sensorStore.sensorData))

function getVH(el: HTMLElement) {
  return [(el.clientHeight),(el.clientWidth)]
}

function getThemeColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
</script>

<style scoped>

/* .teste{
  width: 50vw;
  height: 50vh;
} */
</style>