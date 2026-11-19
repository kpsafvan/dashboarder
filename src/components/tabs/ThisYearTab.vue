<template>
  <div class="space-y-6">
    
    <!-- Top Executive KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      
      <!-- Distance YTD -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">YTD Distance</span>
          <span class="p-2 rounded-xl bg-orange-500/10 text-orange-400 text-xs font-bold">
            {{ store.unitSystem === 'metric' ? 'KM' : 'MI' }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.distance.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span
            v-if="kpis.distanceDeltaPct >= 0"
            class="text-emerald-400 flex items-center"
          >
            ▲ +{{ kpis.distanceDeltaPct }}%
          </span>
          <span v-else class="text-rose-400 flex items-center">
            ▼ {{ kpis.distanceDeltaPct }}%
          </span>
          <span class="text-slate-500 text-[11px]">vs same date {{ store.currentYear - 1 }}</span>
        </div>
      </div>

      <!-- Elevation YTD -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">YTD Elevation</span>
          <span class="p-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold">
            {{ store.unitSystem === 'metric' ? 'M' : 'FT' }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.elevation.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span
            v-if="kpis.elevationDeltaPct >= 0"
            class="text-emerald-400 flex items-center"
          >
            ▲ +{{ kpis.elevationDeltaPct }}%
          </span>
          <span v-else class="text-rose-400 flex items-center">
            ▼ {{ kpis.elevationDeltaPct }}%
          </span>
          <span class="text-slate-500 text-[11px]">vs {{ store.currentYear - 1 }}</span>
        </div>
      </div>

      <!-- Active Time -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moving Time</span>
          <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold">HRS</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ (kpis.movingTimeSec / 3600).toFixed(1) }}h
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>~{{ ((kpis.movingTimeSec / 3600) / 46).toFixed(1) }} hrs / week</span>
        </div>
      </div>

      <!-- Activities Count -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activities</span>
          <span class="p-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold">COUNT</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.activityCount }}
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>Avg {{ (kpis.activityCount / 46).toFixed(1) }} sessions / wk</span>
        </div>
      </div>

      <!-- Active Days & Consistency -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Days</span>
          <span class="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold">DAYS</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.activeDays }}
          </span>
        </div>
        <div class="mt-2 text-xs text-emerald-400 font-medium">
          <span>{{ ((kpis.activeDays / 320) * 100).toFixed(0) }}% active year consistency</span>
        </div>
      </div>

    </div>

    <!-- Cumulative Progression Line Chart (Day 1 to 365 comparison) -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Cumulative {{ store.unitSystem === 'metric' ? 'Distance (KM)' : 'Distance (Miles)' }} Progression
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Day 1 to 365
            </span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Compare your year-to-date pace trajectory against previous calendar years on the exact same day.
          </p>
        </div>
      </div>
      
      <!-- Chart Container -->
      <div ref="cumulativeChartRef" class="w-full h-80 sm:h-96"></div>
    </div>

    <!-- Monthly Volume Breakdown & Goal Tracker Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Monthly Volume Stacked Bar Chart -->
      <div class="glass-panel p-5 sm:p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Monthly Volume Breakdown</h3>
            <p class="text-xs text-slate-400">Monthly distance totals for {{ store.currentYear }}</p>
          </div>
        </div>
        <div ref="monthlyChartRef" class="w-full h-72"></div>
      </div>

      <!-- Annual Goal Velocity & Projection -->
      <div class="glass-panel p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-white tracking-tight">Annual Goal Target</h3>
            <span class="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              {{ goalPct }}%
            </span>
          </div>

          <div class="mt-4">
            <div class="flex items-baseline justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span class="font-bold text-white mono-font">
                {{ kpis.distance.toLocaleString() }} / {{ store.annualDistanceGoal.toLocaleString() }} {{ store.unitSystem === 'metric' ? 'km' : 'mi' }}
              </span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                class="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(100, goalPct)}%` }"
              ></div>
            </div>
          </div>

          <!-- Pacing Velocity Alert -->
          <div class="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :class="isAheadOfPace ? 'bg-emerald-400' : 'bg-amber-400'"></span>
              <span class="text-xs font-bold text-white">
                {{ isAheadOfPace ? 'Ahead of Schedule' : 'Slightly Behind Schedule' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              At your current velocity of <span class="font-bold text-slate-200">{{ dailyPaceVelocity }} {{ store.unitSystem === 'metric' ? 'km' : 'mi' }}/day</span>, you are projected to finish the year at:
            </p>
            <p class="text-lg font-extrabold text-orange-400 mono-font">
              {{ projectedFinish.toLocaleString() }} {{ store.unitSystem === 'metric' ? 'km' : 'mi' }}
            </p>
            <p class="text-[11px] text-slate-500">
              {{ isAheadOfPace ? `+${pacingDeltaKm} ahead of current calendar target` : `${pacingDeltaKm} behind target` }}
            </p>
          </div>
        </div>

        <!-- Year Highlight Reel -->
        <div class="mt-6 pt-4 border-t border-slate-800/80">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            {{ store.currentYear }} Highlights
          </h4>
          <div class="space-y-2 text-xs">
            <div v-if="yearHighlights.longestRun" class="flex items-center justify-between text-slate-400">
              <span class="flex items-center gap-1.5">🏃 Longest Run</span>
              <span class="font-bold text-white mono-font">{{ yearHighlights.longestRun }}</span>
            </div>
            <div v-if="yearHighlights.longestRide" class="flex items-center justify-between text-slate-400">
              <span class="flex items-center gap-1.5">🚴 Longest Ride</span>
              <span class="font-bold text-white mono-font">{{ yearHighlights.longestRide }}</span>
            </div>
            <div v-if="yearHighlights.biggestClimb" class="flex items-center justify-between text-slate-400">
              <span class="flex items-center gap-1.5">⛰️ Highest Climb</span>
              <span class="font-bold text-white mono-font">{{ yearHighlights.biggestClimb }}</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- 52-Week GitHub-style Activity Heatmap -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight">Consistency Heatmap</h3>
          <p class="text-xs text-slate-400">Every active training session across the 52 weeks of {{ store.currentYear }}</p>
        </div>
      </div>

      <div class="overflow-x-auto pb-2">
        <div class="inline-grid grid-flow-col gap-1.5" style="grid-template-rows: repeat(7, minmax(0, 1fr));">
          <div
            v-for="(day, idx) in yearHeatmapDays"
            :key="idx"
            class="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-150 cursor-pointer"
            :class="getDayColor(day.distance)"
            :title="`${day.date}: ${day.distance > 0 ? `${day.distance} ${store.unitSystem === 'metric' ? 'km' : 'mi'}` : 'Rest Day'}`"
          ></div>
        </div>
      </div>
      
      <div class="mt-3 flex items-center justify-end gap-2 text-[11px] text-slate-500">
        <span>Less</span>
        <span class="w-3 h-3 rounded-sm bg-slate-800"></span>
        <span class="w-3 h-3 rounded-sm bg-orange-950"></span>
        <span class="w-3 h-3 rounded-sm bg-orange-700"></span>
        <span class="w-3 h-3 rounded-sm bg-orange-500"></span>
        <span>More</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useStravaStore } from '../../stores/stravaStore';

const store = useStravaStore();

const cumulativeChartRef = ref<HTMLDivElement | null>(null);
const monthlyChartRef = ref<HTMLDivElement | null>(null);

let cumulativeChart: echarts.ECharts | null = null;
let monthlyChart: echarts.ECharts | null = null;

const kpis = computed(() => store.thisYearKPIs);

// Annual goal calculations
const goalPct = computed(() => {
  if (store.annualDistanceGoal <= 0) return 0;
  return Math.round((kpis.value.distance / store.annualDistanceGoal) * 100);
});

// Pacing calculation
const daysElapsed = computed(() => {
  const acts = store.thisYearActivities;
  if (acts.length === 0) return 1;
  const maxDay = acts.reduce((max, a) => Math.max(max, a.dayOfYear), 1);
  return Math.max(1, maxDay);
});

const dailyPaceVelocity = computed(() => {
  return (kpis.value.distance / daysElapsed.value).toFixed(1);
});

const projectedFinish = computed(() => {
  const rate = kpis.value.distance / daysElapsed.value;
  return Math.round(rate * 365);
});

const expectedDistanceToDate = computed(() => {
  return (store.annualDistanceGoal / 365) * daysElapsed.value;
});

const isAheadOfPace = computed(() => {
  return kpis.value.distance >= expectedDistanceToDate.value;
});

const pacingDeltaKm = computed(() => {
  const delta = Math.abs(Math.round(kpis.value.distance - expectedDistanceToDate.value));
  return `${delta} ${store.unitSystem === 'metric' ? 'km' : 'mi'}`;
});

// Highlights
const yearHighlights = computed(() => {
  const acts = store.thisYearActivities;
  if (acts.length === 0) return { longestRun: null, longestRide: null, biggestClimb: null };

  const runs = acts.filter(a => a.sport === 'Run');
  const rides = acts.filter(a => a.sport === 'Ride');

  const longestRun = runs.length > 0 ? [...runs].sort((a, b) => b.distanceKm - a.distanceKm)[0] : null;
  const longestRide = rides.length > 0 ? [...rides].sort((a, b) => b.distanceKm - a.distanceKm)[0] : null;
  const biggestClimb = [...acts].sort((a, b) => b.elevationGainM - a.elevationGainM)[0];

  const unit = store.unitSystem;

  return {
    longestRun: longestRun ? `${unit === 'metric' ? longestRun.distanceKm : longestRun.distanceMiles} ${unit === 'metric' ? 'km' : 'mi'} (${longestRun.title})` : null,
    longestRide: longestRide ? `${unit === 'metric' ? longestRide.distanceKm : longestRide.distanceMiles} ${unit === 'metric' ? 'km' : 'mi'} (${longestRide.title})` : null,
    biggestClimb: biggestClimb ? `${unit === 'metric' ? biggestClimb.elevationGainM : biggestClimb.elevationGainFt} ${unit === 'metric' ? 'm' : 'ft'} (${biggestClimb.title})` : null,
  };
});

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Heatmap generator (365 days of current year)
const yearHeatmapDays = computed(() => {
  const year = store.currentYear;
  const days: { date: string; distance: number }[] = [];
  const map: Record<string, number> = {};

  for (const act of store.thisYearActivities) {
    const key = toLocalDateKey(act.date);
    const dist = store.unitSystem === 'metric' ? act.distanceKm : act.distanceMiles;
    map[key] = (map[key] || 0) + dist;
  }

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const cur = new Date(start);

  while (cur <= end) {
    const key = toLocalDateKey(cur);
    days.push({
      date: key,
      distance: parseFloat((map[key] || 0).toFixed(1)),
    });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
});

function getDayColor(dist: number): string {
  if (dist <= 0) return 'bg-slate-850 hover:bg-slate-700';
  if (dist < 8) return 'bg-orange-950/70 border border-orange-900/50';
  if (dist < 18) return 'bg-orange-700 border border-orange-600/50';
  return 'bg-orange-500 shadow-sm shadow-orange-500/30';
}

// Chart rendering
function renderCumulativeChart() {
  if (!cumulativeChartRef.value) return;
  if (!cumulativeChart) {
    cumulativeChart = echarts.init(cumulativeChartRef.value);
  }

  const { years, seriesByYear } = store.cumulativeProgress;
  const currentYear = store.currentYear;

  // Days 1 to 365
  const days = Array.from({ length: 365 }, (_, i) => `Day ${i + 1}`);

  const colors = ['#64748B', '#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B'];
  let colorIdx = 0;

  const series = years.map((y) => {
    const isCurrent = y === currentYear;
    const data = seriesByYear[y] ? seriesByYear[y].slice(0, 365) : [];
    
    // Trim current year to only days elapsed to avoid flat line to day 365
    let plotData: (number | null)[] = data;
    if (isCurrent) {
      plotData = data.map((val, idx) => (idx <= daysElapsed.value ? val : null));
    }

    const color = isCurrent ? '#FC4C02' : colors[(colorIdx++) % colors.length];

    return {
      name: `${y}`,
      type: 'line',
      smooth: 0.3,
      showSymbol: false,
      lineStyle: {
        width: isCurrent ? 3.5 : 1.5,
        color,
        type: isCurrent ? 'solid' : 'dashed',
      },
      itemStyle: { color },
      data: plotData,
    };
  });

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9', fontSize: 12 },
    },
    legend: {
      textStyle: { color: '#94A3B8' },
      bottom: 0,
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94A3B8',
        interval: 30, // show approx every month
      },
    },
    yAxis: {
      type: 'value',
      name: store.unitSystem === 'metric' ? 'KM' : 'Miles',
      nameTextStyle: { color: '#94A3B8' },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8' },
    },
    series: series as any,
  };

  cumulativeChart.setOption(option, true);
  cumulativeChart.resize();
}

function renderMonthlyChart() {
  if (!monthlyChartRef.value) return;
  if (!monthlyChart) {
    monthlyChart = echarts.init(monthlyChartRef.value);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const runMonthly = new Array(12).fill(0);
  const rideMonthly = new Array(12).fill(0);
  const otherMonthly = new Array(12).fill(0);

  for (const act of store.thisYearActivities) {
    const m = act.month;
    const dist = store.unitSystem === 'metric' ? act.distanceKm : act.distanceMiles;
    if (act.sport === 'Run') runMonthly[m] += dist;
    else if (act.sport === 'Ride') rideMonthly[m] += dist;
    else otherMonthly[m] += dist;
  }

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
      valueFormatter: (value: any) => `${value} ${store.unitSystem === 'metric' ? 'km' : 'mi'}`,
    },
    legend: {
      textStyle: { color: '#94A3B8' },
      bottom: 0,
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
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
        name: 'Running',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#FC4C02', borderRadius: [0, 0, 0, 0] },
        data: runMonthly.map(v => parseFloat(v.toFixed(1))),
      },
      {
        name: 'Cycling',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#0EA5E9', borderRadius: [0, 0, 0, 0] },
        data: rideMonthly.map(v => parseFloat(v.toFixed(1))),
      },
      {
        name: 'Other Sports',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
        data: otherMonthly.map(v => parseFloat(v.toFixed(1))),
      },
    ],
  };

  monthlyChart.setOption(option, true);
  monthlyChart.resize();
}

function handleResize() {
  cumulativeChart?.resize();
  monthlyChart?.resize();
}

onMounted(() => {
  nextTick(() => {
    renderCumulativeChart();
    renderMonthlyChart();
  });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  cumulativeChart?.dispose();
  monthlyChart?.dispose();
});

watch(
  () => [store.thisYearActivities, store.sportFilter, store.unitSystem],
  () => {
    nextTick(() => {
      renderCumulativeChart();
      renderMonthlyChart();
    });
  },
  { deep: true }
);
</script>
