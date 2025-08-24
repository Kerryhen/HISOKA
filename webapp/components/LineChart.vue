<template>
  <div ref="chartEl"
  :style="{
    overflow: 'hidden',
    height: heigthStyle,
    width: WidthStyle
  }"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

const props = defineProps<{
  sensorId: string,
  frequency: number
  amplitude: number,
  windowSec: number,
  sampleRate: number,
  color:string,
  heigth:number,
  width:number,
  
}>()


// Parâmetros reativos para a senoide simulada
const frequency = computed(() => props.frequency)
const amplitude = computed(() => props.amplitude)
const windowSec = computed(() => props.windowSec)
const sampleRate = computed(() => props.sampleRate)
const sensorId = computed(() => props.sensorId)
const color = computed(() => props.color)

const hs = computed(() => props.heigth)
const ws = computed(() => props.width)

const heigthStyle = computed(() => {
  return `calc(${(props.heigth )}px)`
})

const WidthStyle = computed(() => {
  return `calc(${(props.width)}px)`
})

const chartEl = ref<HTMLElement | null>(null)
let u: uPlot | null = null
let animationFrameId: number | null = null

// Gera senoide baseada em shift e comprimento
function generateSine(shift:number, length:number, sampleRate:number) {
  const xs = new Array(length)
  const ys = new Array(length)
  const dt = 1 / sampleRate
  for (let i = 0; i < length; i++) {
    xs[i] = (shift + i) * dt
    ys[i] = Math.sin(2 * Math.PI * frequency.value * xs[i]) * amplitude.value
  }
  return [xs, ys]
}

// Função para (re)inicializar o gráfico com dimensões dinâmicas
function initChart(shift:number, sampleRate:number) {
  u?.destroy()
  const length = Math.floor(windowSec.value * sampleRate)
  const [xs, ys] = generateSine(shift, length, sampleRate)

  // Obtém dimensões do container
  const width = chartEl?.value?.clientWidth
  const height = chartEl?.value?.clientHeight

  const opts = {
    width,
    height,
    legend:{
      show:true
    },
    scales: { x: { time: false }, y: { range: () => [-amplitude.value, amplitude.value] } },
    series: [{}, {stroke: color.value }],
    axes: [ {} ],
  }

  // Destrói instância anterior se existir
  
  u = new uPlot(opts, [xs, ys], chartEl.value)
}

function startLoop(sampleRate:number) {
  let shift = 0
  const loop = () => {
    const length = Math.floor(windowSec.value * sampleRate)
    const [xs, ys] = generateSine(shift, length, sampleRate)
    u?.setData([xs, ys])
    u?.setSize({width:ws.value, height:hs.value})
    shift++             //! Isso vai estourar a memória em algum momento. Verficar dps.
    animationFrameId = requestAnimationFrame(loop)
  }
  loop()
}

onMounted(() => {
  // Inicializa e inicia o loop de atualização
  initChart(0,sampleRate.value)
  startLoop(sampleRate.value)

  // // Recria gráfico ao mudar janela ou resize da janela
  // watch([windowSec, amplitude, frequency], () => initChart(0))
  // window.addEventListener('resize', () => )
})

onBeforeUnmount(() => {
  if (u) u.destroy()
  cancelAnimationFrame(animationFrameId)
  // window.removeEventListener('resize', initChart)
})
</script>

<style scoped>
.chart-container {
  overflow: hidden;
}
</style>
