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

    <!-- Cardiovascular & Heart Rate Analytics Section -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 class="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            ❤️ Cardiovascular & Heart Rate Trends
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {{ hrSummary.sessionsCount }} Sessions Tracked
            </span>
          </h3>
          <p class="text-xs text-slate-400">
            Track average and peak heart rate adaptations across workouts, runs, and rides over time.
          </p>
        </div>

        <!-- HR Quick Filter / Legend -->
        <div class="flex items-center gap-3 text-xs flex-wrap">
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span class="text-slate-300">Avg HR</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span class="text-slate-300">Max HR</span></div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-emerald-500"></span><span class="text-slate-400">Z2 Aerobic Threshold</span></div>
        </div>
      </div>

      <!-- Cardiovascular Key Stats Badges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Peak Heart Rate</span>
          <span class="text-2xl font-extrabold text-rose-400 mono-font mt-1 block">
            {{ hrSummary.peakHr > 0 ? `${hrSummary.peakHr} bpm` : '--' }}
          </span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Highest recorded exertion</span>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Average Training HR</span>
          <span class="text-2xl font-extrabold text-orange-400 mono-font mt-1 block">
            {{ hrSummary.avgHr > 0 ? `${hrSummary.avgHr} bpm` : '--' }}
          </span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Overall cardiac mean</span>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Aerobic Base Hours</span>
          <span class="text-2xl font-extrabold text-emerald-400 mono-font mt-1 block">
            {{ hrSummary.aerobicBaseHours }} hrs
          </span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Time in Zone 1 & 2</span>
        </div>

        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Aerobic Ratio</span>
          <span class="text-2xl font-extrabold text-blue-400 mono-font mt-1 block">
            {{ hrSummary.aerobicPct }}%
          </span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Target: 80% Polarized</span>
        </div>
      </div>

      <!-- Heart Rate Timeline Chart -->
      <div v-if="hrSummary.sessionsCount > 0" ref="hrChartRef" class="w-full h-72 sm:h-80"></div>
      <div v-else class="text-center py-12 text-slate-500 text-xs">
        No heart rate data found in current selection. Ensure a heart rate monitor was paired during your activities.
      </div>
    </div>

    <!-- Heart Rate Zones & Polarized Endurance Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Heart Rate Zones (Z1 to Z5) Breakdown -->
      <div class="glass-panel p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Heart Rate Zone Distribution</h3>
            <p class="text-xs text-slate-400">Calculated from configured Max HR: {{ store.maxHeartRate }} BPM</p>
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
            <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: `${zone.percentage}%`, backgroundColor: zone.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Polarized Training & Form Guide -->
      <div class="glass-panel p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-bold text-white tracking-tight">Polarized Training (80/20 Rule)</h3>
            <span
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
              :class="hrSummary.aerobicPct >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'"
            >
              {{ hrSummary.aerobicPct >= 75 ? 'Optimal Aerobic Base' : 'Mixed Intensity' }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mb-4">
            Gold-standard endurance coaching recommends ~80% of volume at low cardiac intensity (Zone 1 & 2) and ~20% at tempo or threshold (Zone 3–5).
          </p>

          <div class="space-y-3 text-xs">
            <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div class="flex items-center justify-between font-bold text-emerald-400 mb-1">
                <span>Low Intensity Base (Z1 + Z2)</span>
                <span class="mono-font">{{ hrSummary.aerobicPct }}%</span>
              </div>
              <p class="text-slate-300">
                Enhances mitochondrial density, capillary growth, fat oxidation, and cardiac stroke volume with minimal neuromuscular fatigue.
              </p>
            </div>

            <div class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div class="flex items-center justify-between font-bold text-rose-400 mb-1">
                <span>High Intensity Exertion (Z3 – Z5)</span>
                <span class="mono-font">{{ (100 - hrSummary.aerobicPct).toFixed(1) }}%</span>
              </div>
              <p class="text-slate-300">
                Threshold tempo, HIIT, and VO2 max training. Delivers power gains and race pace tolerance but requires dedicated recovery.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Banister PMC: 42d CTL / 7d ATL</span>
          <span>Max HR: {{ store.maxHeartRate }} BPM</span>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useStravaStore } from '../../stores/stravaStore';

const store = useStravaStore();

const pmcChartRef = ref<HTMLDivElement | null>(null);
const hrChartRef = ref<HTMLDivElement | null>(null);

let pmcChart: echarts.ECharts | null = null;
let hrChart: echarts.ECharts | null = null;

const fitnessStatus = computed(() => store.currentFitnessStatus);
const hrZones = computed(() => store.heartRateZones);

// Heart Rate summary analytics
const hrSummary = computed<{
  sessionsCount: number;
  avgHr: number;
  peakHr: number;
  aerobicBaseHours: number;
  aerobicPct: number;
}>(() => {
  const acts = store.filteredActivities.filter(a => a.avgHeartRate !== null && a.avgHeartRate > 0);
  if (acts.length === 0) {
    return { sessionsCount: 0, avgHr: 0, peakHr: 0, aerobicBaseHours: 0, aerobicPct: 0 };
  }

  const avgHr = Math.round(acts.reduce((acc, a) => acc + (a.avgHeartRate || 0), 0) / acts.length);
  const peakHr = Math.round(acts.reduce((max, a) => Math.max(max, a.maxHeartRate || a.avgHeartRate || 0), 0));

  const zones = hrZones.value;
  const z1Mins = zones[0]?.timeMinutes || 0;
  const z2Mins = zones[1]?.timeMinutes || 0;
  const aerobicMins = z1Mins + z2Mins;
  const totalMins = zones.reduce((acc, z) => acc + z.timeMinutes, 0);

  const aerobicBaseHours = totalMins > 0 ? parseFloat((aerobicMins / 60).toFixed(1)) : 0;
  const aerobicPct = totalMins > 0 ? parseFloat(((aerobicMins / totalMins) * 100).toFixed(1)) : 0;

  return {
    sessionsCount: acts.length,
    avgHr,
    peakHr,
    aerobicBaseHours,
    aerobicPct,
  };
});

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
        start: Math.max(0, 100 - (180 / data.length) * 100),
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
  pmcChart.resize();
}

function renderHRChart() {
  if (!hrChartRef.value) return;
  if (!hrChart) {
    hrChart = echarts.init(hrChartRef.value);
  }

  const hrActs = [...store.filteredActivities]
    .filter(a => a.avgHeartRate !== null && a.avgHeartRate > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (hrActs.length === 0) return;

  const dates = hrActs.map(a => toLocalDateKey(a.date));
  const avgHrs = hrActs.map(a => a.avgHeartRate);
  const maxHrs = hrActs.map(a => a.maxHeartRate || a.avgHeartRate);
  const maxThreshold = store.maxHeartRate || 190;
  const z2Threshold = Math.round(maxThreshold * 0.70);
  const z4Threshold = Math.round(maxThreshold * 0.90);

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const idx = params[0].dataIndex;
        const act = hrActs[idx];
        if (!act) return '';

        return `
          <div class="text-xs space-y-1">
            <div class="font-bold text-white">${act.title}</div>
            <div class="text-slate-400">${act.dateString} &bull; <span class="text-orange-400 font-semibold">${act.sport}</span></div>
            <div class="border-t border-slate-700 pt-1 mt-1 space-y-0.5">
              <div>Avg HR: <span class="font-bold text-rose-400">${act.avgHeartRate} bpm</span></div>
              <div>Max HR: <span class="font-bold text-amber-400">${act.maxHeartRate || '--'} bpm</span></div>
              <div>Duration: <span class="text-slate-200">${Math.round(act.movingTimeSec / 60)} mins</span></div>
              ${act.calories ? `<div>Calories: <span class="text-yellow-400">${act.calories} kcal</span></div>` : ''}
            </div>
          </div>
        `;
      },
    },
    legend: {
      data: ['Average Heart Rate', 'Peak Heart Rate'],
      textStyle: { color: '#94A3B8' },
      top: 0,
    },
    grid: {
      top: '14%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: Math.max(0, 100 - (180 / hrActs.length) * 100),
        end: 100,
        borderColor: '#334155',
        fillerColor: 'rgba(244, 63, 94, 0.15)',
        handleStyle: { color: '#F43F5E' },
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
    yAxis: {
      type: 'value',
      name: 'Heart Rate (BPM)',
      min: 60,
      max: Math.max(maxThreshold + 5, 200),
      nameTextStyle: { color: '#94A3B8' },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8' },
    },
    series: [
      {
        name: 'Average Heart Rate',
        type: 'line',
        smooth: 0.25,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#F43F5E' },
        itemStyle: { color: '#F43F5E' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(244, 63, 94, 0.25)' },
            { offset: 1, color: 'rgba(244, 63, 94, 0.0)' },
          ]),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            {
              yAxis: z2Threshold,
              lineStyle: { color: '#10B981', type: 'dashed', width: 1.5 },
              label: { formatter: `Z2 Aerobic (${z2Threshold} bpm)`, color: '#10B981', position: 'end' },
            },
            {
              yAxis: z4Threshold,
              lineStyle: { color: '#EF4444', type: 'dotted', width: 1.5 },
              label: { formatter: `Z4 Threshold (${z4Threshold} bpm)`, color: '#EF4444', position: 'end' },
            },
          ],
        },
        data: avgHrs,
      },
      {
        name: 'Peak Heart Rate',
        type: 'scatter',
        symbol: 'diamond',
        symbolSize: 7,
        itemStyle: { color: '#FBBF24', borderColor: '#F59E0B', borderWidth: 1 },
        data: maxHrs,
      },
    ],
  };

  hrChart.setOption(option, true);
  hrChart.resize();
}

function handleResize() {
  pmcChart?.resize();
  hrChart?.resize();
}

onMounted(() => {
  nextTick(() => {
    renderPMCChart();
    renderHRChart();
  });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  pmcChart?.dispose();
  hrChart?.dispose();
});

watch(
  () => [store.activities, store.filteredActivities, store.maxHeartRate, store.ftp],
  () => {
    nextTick(() => {
      renderPMCChart();
      renderHRChart();
    });
  },
  { deep: true }
);
</script>
