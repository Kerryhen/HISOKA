<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">Senoide em Tempo Real (uPlot)</h2>

    <!-- Controles para ajustar frequência, amplitude e janela -->
    <div class="flex space-x-4 mb-6">
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

    <!-- Container do gráfico: ocupa 100% da largura e altura fixa ou dinâmica -->
    <div ref="chartEl" class="chart-container border rounded p-2 w-full h-80"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

// Parâmetros reativos para a senoide simulada
const frequency = ref(50)
const amplitude = ref(5)
const windowSec = ref(2)     // janela visível em segundos

const chartEl = ref(null)
let u = null
let animationFrameId = null

// Gera senoide baseada em shift e comprimento
const sampleRate = 1000    // 1000 Hz de amostragem base
function generateSine(shift, length) {
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
function initChart(shift) {
  const length = Math.floor(windowSec.value * sampleRate)
  const [xs, ys] = generateSine(shift, length)

  // Obtém dimensões do container
  const width = chartEl.value.clientWidth
  const height = chartEl.value.clientHeight

  const opts = {
    width,
    height,
    scales: { x: { time: false }, y: { range: () => [-amplitude.value, amplitude.value] } },
    series: [{}, { label: 'Senoide', stroke: 'red' }],
    axes: [ { grid: { show: false } }, { grid: { show: true } } ],
  }

  // Destrói instância anterior se existir
  if (u) u.destroy()
  u = new uPlot(opts, [xs, ys], chartEl.value)
}

function startLoop() {
  let shift = 0
  const loop = () => {
    const length = Math.floor(windowSec.value * sampleRate)
    const [xs, ys] = generateSine(shift, length)
    u.setData([xs, ys])
    shift++             //! Isso vai estourar a memória em algum momento. Verficar dps.
    animationFrameId = requestAnimationFrame(loop)
  }
  loop()
}

onMounted(() => {
  // Inicializa e inicia o loop de atualização
  initChart(0)
  startLoop()

  // Recria gráfico ao mudar janela ou resize da janela
  watch([windowSec, amplitude, frequency], () => initChart(0))
  window.addEventListener('resize', () => initChart(0))
})

onBeforeUnmount(() => {
  if (u) u.destroy()
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', initChart)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 80vh; /* Ajustável conforme necessidade */
  overflow: hidden;
}
</style>
