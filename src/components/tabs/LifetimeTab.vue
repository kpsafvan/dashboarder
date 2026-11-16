<template>
  <div class="space-y-6">
    
    <!-- Lifetime Career Totals -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      
      <div class="glass-panel p-4 sm:p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Career Distance</span>
          <span class="p-2 rounded-xl bg-orange-500/10 text-orange-400 text-xs font-bold">
            {{ store.unitSystem === 'metric' ? 'KM' : 'MI' }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.distance.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 text-xs text-orange-400 font-medium">
          <span>🌍 {{ kpis.earthCircumferencePct }}% Around the Earth</span>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Career Elevation</span>
          <span class="p-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold">
            {{ store.unitSystem === 'metric' ? 'M' : 'FT' }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.elevation.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 text-xs text-blue-400 font-medium">
          <span>⛰️ {{ kpis.everestClimbCount }}x Mt. Everest</span>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Time in Motion</span>
          <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold">DAYS</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ (kpis.movingTimeSec / 86400).toFixed(1) }}d
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>{{ (kpis.movingTimeSec / 3600).toFixed(0) }} full hours</span>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Calories</span>
          <span class="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold">KCAL</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.calories.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>~{{ (kpis.calories / 3500).toFixed(0) }} lbs body fat burned</span>
        </div>
      </div>

      <div class="glass-panel p-4 sm:p-5 col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Workouts</span>
          <span class="p-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold">ALL</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.activityCount.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>Across {{ store.yearsPresent.length }} calendar years</span>
        </div>
      </div>

    </div>

    <!-- Master Year-over-Year (YoY) Grid & Career Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- YoY Master Summary Table -->
      <div class="glass-panel p-5 sm:p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Year-over-Year (YoY) Master Table</h3>
            <p class="text-xs text-slate-400">Annual performance history across all active years</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="py-2.5 px-3 font-semibold">Year</th>
                <th class="py-2.5 px-3 font-semibold text-right">Distance</th>
                <th class="py-2.5 px-3 font-semibold text-right">Elevation</th>
                <th class="py-2.5 px-3 font-semibold text-right">Moving Time</th>
                <th class="py-2.5 px-3 font-semibold text-right">Activities</th>
                <th class="py-2.5 px-3 font-semibold text-right">Avg Pace/Spd</th>
                <th class="py-2.5 px-3 font-semibold text-right">Avg HR</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr
                v-for="row in yoyRows"
                :key="row.year"
                :class="[
                  'hover:bg-slate-800/40 transition-colors',
                  row.year === store.currentYear ? 'bg-orange-500/5 text-orange-200' : 'text-slate-300'
                ]"
              >
                <td class="py-3 px-3 font-bold text-white flex items-center gap-1.5 font-sans">
                  <span>{{ row.year }}</span>
                  <span
                    v-if="row.year === store.currentYear"
                    class="text-[9px] bg-orange-500/20 text-orange-400 px-1 py-0.2 rounded uppercase font-bold"
                  >
                    Current
                  </span>
                </td>
                <td class="py-3 px-3 text-right font-semibold">
                  {{ store.unitSystem === 'metric' ? `${row.totalDistanceKm.toLocaleString()} km` : `${row.totalDistanceMiles.toLocaleString()} mi` }}
                </td>
                <td class="py-3 px-3 text-right text-slate-400">
                  {{ store.unitSystem === 'metric' ? `${row.totalElevationM.toLocaleString()} m` : `${row.totalElevationFt.toLocaleString()} ft` }}
                </td>
                <td class="py-3 px-3 text-right text-slate-400">
                  {{ (row.totalMovingTimeSec / 3600).toFixed(0) }}h {{ Math.round((row.totalMovingTimeSec % 3600) / 60) }}m
                </td>
                <td class="py-3 px-3 text-right text-slate-400">
                  {{ row.totalActivities }}
                </td>
                <td class="py-3 px-3 text-right text-slate-400">
                  <span v-if="row.avgPaceMinKm > 0">{{ formatPaceStr(row.avgPaceMinKm) }}</span>
                  <span v-else-if="row.avgSpeedKmh > 0">{{ row.avgSpeedKmh }} km/h</span>
                  <span v-else>--</span>
                </td>
                <td class="py-3 px-3 text-right text-slate-400">
                  <span v-if="row.avgHeartRate">{{ row.avgHeartRate }} bpm</span>
                  <span v-else>--</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Career Volume Comparison Chart -->
      <div class="glass-panel p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight mb-1">Career Volume Progression</h3>
          <p class="text-xs text-slate-400 mb-4">Total annual volume progression</p>
          <div ref="yoyChartRef" class="w-full h-64"></div>
        </div>
      </div>

    </div>

    <!-- All-Time Hall of Fame / Personal Bests -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            🏆 All-Time Hall of Fame & Personal Bests
          </h3>
          <p class="text-xs text-slate-400">Your career-best achievements extracted from your training log</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          v-for="record in records"
          :key="record.id"
          class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-orange-500/40 transition-colors"
        >
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span class="font-semibold">{{ record.label }}</span>
            <span>{{ record.sport === 'Run' ? '🏃' : (record.sport === 'Ride' ? '🚴' : '⚡') }}</span>
          </div>
          <div class="text-xl font-extrabold text-orange-400 mono-font">
            {{ record.value }}
          </div>
          <div class="mt-2 text-[11px] text-slate-400 truncate" :title="record.activityTitle">
            {{ record.activityTitle }}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">
            {{ record.date }}
          </div>
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

const yoyChartRef = ref<HTMLDivElement | null>(null);
let yoyChart: echarts.ECharts | null = null;

const kpis = computed(() => store.lifetimeKPIs);
const yoyRows = computed(() => store.yearStats);
const records = computed(() => store.personalRecords);

function formatPaceStr(minKm: number): string {
  const min = Math.floor(minKm);
  const sec = Math.round((minKm - min) * 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec} /km`;
}

function renderYoYChart() {
  if (!yoyChartRef.value) return;
  if (!yoyChart) {
    yoyChart = echarts.init(yoyChartRef.value);
  }

  const rows = [...yoyRows.value].reverse();
  const years = rows.map(r => String(r.year));
  const distances = rows.map(r => store.unitSystem === 'metric' ? r.totalDistanceKm : r.totalDistanceMiles);

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
    },
    grid: {
      top: '12%',
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8' },
    },
    yAxis: {
      type: 'value',
      name: store.unitSystem === 'metric' ? 'KM' : 'Miles',
      nameTextStyle: { color: '#94A3B8' },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8' },
    },
    series: [
      {
        name: 'Annual Distance',
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FC4C02' },
            { offset: 1, color: '#9A2C00' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        data: distances,
      },
    ],
  };

  yoyChart.setOption(option, true);
}

function handleResize() {
  yoyChart?.resize();
}

onMounted(() => {
  renderYoYChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  yoyChart?.dispose();
});

watch(
  () => [store.activities, store.unitSystem],
  () => {
    renderYoYChart();
  },
  { deep: true }
);
</script>
