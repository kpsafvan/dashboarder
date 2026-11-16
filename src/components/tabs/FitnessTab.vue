<template>
  <div class="space-y-6">
    
    <!-- Top Status Banner -->
    <div class="glass-panel p-5 sm:p-6 border-l-4" :style="{ borderLeftColor: fitnessStatus.color }">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Current Training State</span>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
              :style="{ backgroundColor: `${fitnessStatus.color}20`, color: fitnessStatus.color }"
            >
              {{ fitnessStatus.label }}
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Fitness & Freshness Analysis (Banister Model)
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Full algorithmic replica of Strava Premium's impulse-response PMC (Performance Management Chart).
          </p>
        </div>

        <!-- Metric Badges -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="flex-1 md:flex-initial p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Fitness (CTL)</span>
            <span class="text-xl font-extrabold text-blue-400 mono-font">{{ fitnessStatus.ctl }}</span>
          </div>
          <div class="flex-1 md:flex-initial p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Fatigue (ATL)</span>
            <span class="text-xl font-extrabold text-rose-400 mono-font">{{ fitnessStatus.atl }}</span>
          </div>
          <div class="flex-1 md:flex-initial p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Form (TSB)</span>
            <span
              class="text-xl font-extrabold mono-font"
              :class="fitnessStatus.tsb >= 0 ? 'text-emerald-400' : 'text-amber-400'"
            >
              {{ fitnessStatus.tsb > 0 ? `+${fitnessStatus.tsb}` : fitnessStatus.tsb }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- The Interactive Fitness & Freshness ECharts Graph -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Performance Management Chart (PMC)
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              CTL / ATL / TSB
            </span>
          </h3>
          <p class="text-xs text-slate-400">
            Fitness (42-day rolling exp average) vs Fatigue (7-day rolling exp average) and Form (Freshness).
          </p>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1.5"><span class="w-3 h-1 bg-blue-500 rounded"></span><span class="text-slate-300">Fitness (CTL)</span></div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-1 bg-rose-500 rounded"></span><span class="text-slate-300">Fatigue (ATL)</span></div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-1 bg-emerald-500 rounded"></span><span class="text-slate-300">Form (TSB)</span></div>
        </div>
      </div>

      <div ref="pmcChartRef" class="w-full h-80 sm:h-96"></div>
    </div>

    <!-- Heart Rate Zones & Training Load Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Heart Rate Zones (Z1 to Z5) Breakdown -->
      <div class="glass-panel p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Heart Rate Zone Distribution</h3>
            <p class="text-xs text-slate-400">Based on Max HR of {{ store.maxHeartRate }} BPM</p>
          </div>
        </div>

        <div class="space-y-3.5">
          <div
            v-for="zone in hrZones"
            :key="zone.zone"
            class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
          >
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white mono-font px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">
                  {{ zone.zone }}
                </span>
                <span class="font-semibold text-slate-200">{{ zone.label }}</span>
                <span class="text-slate-500 text-[11px]">({{ zone.minBpm }}-{{ zone.maxBpm }} bpm)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-400">{{ (zone.timeMinutes / 60).toFixed(1) }} hrs</span>
                <span class="font-bold text-white mono-font">{{ zone.percentage }}%</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: `${zone.percentage}%`, backgroundColor: zone.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form & Recovery Guide -->
      <div class="glass-panel p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight mb-2">Form & Recovery Guide</h3>
          <p class="text-xs text-slate-400 mb-4">Understand your current Training Stress Balance (TSB)</p>

          <div class="space-y-3 text-xs">
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span class="font-bold text-emerald-400 block mb-1">Fresh / Race Ready (TSB > +15)</span>
              <p class="text-slate-300">
                You are well recovered and primed for peak performance, racing, or hard fitness tests. Not ideal for sustained building.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <span class="font-bold text-blue-400 block mb-1">Optimal Building Zone (-10 to -30 TSB)</span>
              <p class="text-slate-300">
                The "sweet spot" for progressive overload. Fitness (CTL) is increasing steadily without excessive fatigue or risk.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span class="font-bold text-rose-400 block mb-1">High Risk / Overreaching (TSB &lt; -30)</span>
              <p class="text-slate-300">
                Fatigue is accumulating rapidly. High risk of overtraining, immune suppression, or injury. Schedule rest days.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Banister Impulse Model parameters: 42d CTL / 7d ATL</span>
          <span>FTP: {{ store.ftp }}W</span>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import { useStravaStore } from '../../stores/stravaStore';

const store = useStravaStore();

const pmcChartRef = ref<HTMLDivElement | null>(null);
let pmcChart: echarts.ECharts | null = null;

const fitnessStatus = computed(() => store.currentFitnessStatus);
const hrZones = computed(() => store.heartRateZones);

function renderPMCChart() {
  if (!pmcChartRef.value) return;
  if (!pmcChart) {
    pmcChart = echarts.init(pmcChartRef.value);
  }

  const data = store.fitnessData;
  if (data.length === 0) return;

  const dates = data.map(d => d.date);
  const ctl = data.map(d => d.fitness);
  const atl = data.map(d => d.fatigue);
  const tsb = data.map(d => d.form);

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: Math.max(0, 100 - (180 / data.length) * 100), // Default to past ~6 months
        end: 100,
        borderColor: '#334155',
        fillerColor: 'rgba(252, 76, 2, 0.2)',
        handleStyle: { color: '#FC4C02' },
        textStyle: { color: '#94A3B8' },
        bottom: 5,
      },
      {
        type: 'inside',
      },
    ],
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8' },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Fitness / Fatigue',
        nameTextStyle: { color: '#94A3B8' },
        splitLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#94A3B8' },
      },
      {
        type: 'value',
        name: 'Form (TSB)',
        nameTextStyle: { color: '#94A3B8' },
        splitLine: { show: false },
        axisLabel: { color: '#94A3B8' },
      },
    ],
    series: [
      {
        name: 'Fitness (CTL)',
        type: 'line',
        smooth: 0.2,
        showSymbol: false,
        lineStyle: { width: 3, color: '#3B82F6' },
        itemStyle: { color: '#3B82F6' },
        data: ctl,
      },
      {
        name: 'Fatigue (ATL)',
        type: 'line',
        smooth: 0.2,
        showSymbol: false,
        lineStyle: { width: 2, color: '#F43F5E' },
        itemStyle: { color: '#F43F5E' },
        data: atl,
      },
      {
        name: 'Form (TSB)',
        type: 'line',
        yAxisIndex: 1,
        smooth: 0.2,
        showSymbol: false,
        lineStyle: { width: 2, color: '#10B981', type: 'dashed' },
        itemStyle: { color: '#10B981' },
        data: tsb,
      },
    ],
  };

  pmcChart.setOption(option, true);
}

function handleResize() {
  pmcChart?.resize();
}

onMounted(() => {
  renderPMCChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  pmcChart?.dispose();
});

watch(
  () => [store.activities, store.maxHeartRate, store.ftp],
  () => {
    renderPMCChart();
  },
  { deep: true }
);
</script>
