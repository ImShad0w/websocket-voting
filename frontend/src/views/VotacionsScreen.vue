<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>

  <div class="options-container">
    <v-btn v-for="(label, index) in chartData.labels" :key="label" color="primary" :disabled="!store.connected"
      @click="votar(index)">
      {{ label }}
    </v-btn>
  </div>

  <p class="total-votes">Total de vots: {{ store.totalVotes }}</p>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAppStore } from '@/stores/votos';
import Chart from 'chart.js/auto';

const store = useAppStore();
const chartCanvas = ref(null);
let chartInstance = null;

const chartData = ref({
  labels: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
  datasets: [{
    label: 'Vots',
    data: [...store.votos],
    backgroundColor: [
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
    ],
  }],
});

function updateChart(nousVots) {
  if (!chartInstance) return;

  chartInstance.data.datasets[0].data = [...nousVots];
  chartInstance.update();
}

function votar(index) {
  if (!store.votar(index)) {
    console.warn('[votar] no s\'ha pogut enviar el vot: el socket no està obert');
  }
}

onMounted(() => {
  store.connect();

  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: chartData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
        },
      },
    });

    updateChart(store.votos);
  }
});

watch(() => store.votos, (nousVots) => {
  updateChart(nousVots);
}, { deep: true });

onUnmounted(() => {
  chartInstance?.destroy();
  chartInstance = null;
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 50vh;
  width: 90vw;
  max-width: 800px;
  margin: 20px auto;
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin: 20px auto;
}

.total-votes {
  text-align: center;
  font-weight: 600;
}
</style>
