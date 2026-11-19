<template>
  <div class="space-y-6">
    
    <!-- Top Executive KPIs (Dynamic for Workout vs Endurance Sports) -->
    <div v-if="store.sportFilter === 'Workout'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- Total Workout Time -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workout Time</span>
          <span class="p-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold">HRS</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ (kpis.movingTimeSec / 3600).toFixed(1) }}h
          </span>
        </div>
        <div class="mt-2 text-xs text-purple-400 font-medium">
          <span>~{{ ((kpis.movingTimeSec / 3600) / 46).toFixed(1) }} hrs / week</span>
        </div>
      </div>

      <!-- Workout Sessions Count -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gym Sessions</span>
          <span class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold">COUNT</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.activityCount }}
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>{{ (kpis.activityCount / 46).toFixed(1) }} workouts / wk</span>
        </div>
      </div>

      <!-- Calories Burned -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Calories Burned</span>
          <span class="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold">KCAL</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ workoutMetrics.calories.toLocaleString() }}
          </span>
        </div>
        <div class="mt-2 text-xs text-amber-400 font-medium">
          <span>~{{ Math.round(workoutMetrics.calories / (kpis.activityCount || 1)) }} kcal / session</span>
        </div>
      </div>

      <!-- Average Heart Rate -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average HR</span>
          <span class="p-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold">BPM</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight mono-font">
            {{ workoutMetrics.avgHr > 0 ? `${workoutMetrics.avgHr} bpm` : '--' }}
          </span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          <span>Peak: {{ workoutMetrics.peakHr > 0 ? `${workoutMetrics.peakHr} bpm` : '--' }}</span>
        </div>
      </div>

      <!-- Active Consistency Days -->
      <div class="glass-panel p-4 sm:p-5 relative overflow-hidden group col-span-2 sm:col-span-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Days</span>
          <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold">DAYS</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mono-font">
            {{ kpis.activeDays }}
          </span>
        </div>
        <div class="mt-2 text-xs text-emerald-400 font-medium">
          <span>{{ ((kpis.activeDays / 320) * 100).toFixed(0) }}% year consistency</span>
        </div>
      </div>
    </div>

    <!-- Default Executive KPIs for All / Run / Ride / Walk -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      
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
    <div v-show="store.sportFilter !== 'Workout'" class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Cumulative {{ store.unitSystem === 'metric' ? 'Distance (KM)' : 'Distance (Miles)' }} Progression
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Day 1 to 365
            </span>
          </h3>
          <p class="text-xs text-slate-400">
            Compare your {{ store.currentYear }} accumulation curve against historical benchmark years.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span class="w-3 h-0.5 bg-orange-500 inline-block"></span>
          <span class="text-orange-400 font-bold">{{ store.currentYear }} (Current)</span>
        </div>
      </div>

      <div ref="cumulativeChartRef" class="w-full h-80 sm:h-96"></div>
    </div>

    <!-- Middle Split: Monthly Volume Breakdown & Goal Pacer -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Monthly Volume Breakdown (with Distance vs Active Hours toggle) -->
      <div class="glass-panel p-5 sm:p-6 lg:col-span-2">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 class="text-base font-bold text-white tracking-tight">Monthly Volume Breakdown</h3>
            <p class="text-xs text-slate-400">
              Monthly {{ monthlyMetric === 'distance' ? 'distance totals' : 'active training hours' }} for {{ store.currentYear }}
            </p>
          </div>

          <!-- Metric Toggle -->
          <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              @click="toggleMonthlyMetric('distance')"
              :class="monthlyMetric === 'distance' ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-colors"
            >
              Distance
            </button>
            <button
              @click="toggleMonthlyMetric('time')"
              :class="monthlyMetric === 'time' ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-colors"
            >
              Active Hours
            </button>
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
            <div v-if="workoutMetrics.sessionsCount > 0" class="flex items-center justify-between text-slate-400">
              <span class="flex items-center gap-1.5">🏋️ Total Gym Workouts</span>
              <span class="font-bold text-purple-400 mono-font">{{ workoutMetrics.sessionsCount }} sessions ({{ workoutMetrics.totalHours }}h)</span>
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

        <!-- Heatmap Legend -->
        <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          <span class="w-2.5 h-2.5 rounded-sm bg-slate-850 border border-slate-800"></span>
          <span class="w-2.5 h-2.5 rounded-sm" :class="store.sportFilter === 'Workout' ? 'bg-purple-950/70' : 'bg-orange-950/70'"></span>
          <span class="w-2.5 h-2.5 rounded-sm" :class="store.sportFilter === 'Workout' ? 'bg-purple-700' : 'bg-orange-700'"></span>
          <span class="w-2.5 h-2.5 rounded-sm" :class="store.sportFilter === 'Workout' ? 'bg-purple-500' : 'bg-orange-500'"></span>
          <span>More</span>
        </div>
      </div>

      <div class="overflow-x-auto pb-2">
        <div class="inline-grid grid-flow-col gap-1.5" style="grid-template-rows: repeat(7, minmax(0, 1fr));">
          <div
            v-for="(day, idx) in yearHeatmapDays"
            :key="idx"
            :title="getHeatmapTooltip(day)"
            class="w-3.5 h-3.5 rounded-sm cursor-pointer transition-transform hover:scale-125 hover:z-10"
            :class="getDayColor(day)"
          ></div>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Jan 1</span>
        <span>Jul 1</span>
        <span>Dec 31</span>
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

const monthlyMetric = ref<'distance' | 'time'>('distance');

function toggleMonthlyMetric(metric: 'distance' | 'time') {
  monthlyMetric.value = metric;
  renderMonthlyChart();
}

const kpis = computed(() => store.thisYearKPIs);

// Workout-specific metrics for the current year
const workoutMetrics = computed(() => {
  const acts = store.thisYearActivities.filter(a => a.sport === 'Workout');
  const calories = acts.reduce((acc, a) => acc + (a.calories || 0), 0);
  const totalMins = acts.reduce((acc, a) => acc + Math.round(a.movingTimeSec / 60), 0);
  const hrActs = acts.filter(a => a.avgHeartRate !== null && a.avgHeartRate > 0);
  const avgHr = hrActs.length > 0 ? Math.round(hrActs.reduce((acc, a) => acc + (a.avgHeartRate || 0), 0) / hrActs.length) : 0;
  const peakHr = hrActs.reduce((max, a) => Math.max(max, a.maxHeartRate || a.avgHeartRate || 0), 0);

  return {
    sessionsCount: acts.length,
    totalHours: (totalMins / 60).toFixed(1),
    calories,
    avgHr,
    peakHr
  };
});

const goalPct = computed(() => {
  if (store.annualDistanceGoal <= 0) return 0;
  return Math.min(100, Math.round((kpis.value.distance / store.annualDistanceGoal) * 100));
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
  const days: { date: string; distance: number; timeMinutes: number; count: number }[] = [];
  const distMap: Record<string, number> = {};
  const timeMap: Record<string, number> = {};
  const countMap: Record<string, number> = {};

  for (const act of store.thisYearActivities) {
    const key = toLocalDateKey(act.date);
    const dist = store.unitSystem === 'metric' ? act.distanceKm : act.distanceMiles;
    distMap[key] = (distMap[key] || 0) + dist;
    timeMap[key] = (timeMap[key] || 0) + Math.round(act.movingTimeSec / 60);
    countMap[key] = (countMap[key] || 0) + 1;
  }

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const cur = new Date(start);

  while (cur <= end) {
    const key = toLocalDateKey(cur);
    days.push({
      date: key,
      distance: parseFloat((distMap[key] || 0).toFixed(1)),
      timeMinutes: timeMap[key] || 0,
      count: countMap[key] || 0,
    });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
});

function getDayColor(day: { distance: number; timeMinutes: number; count: number }): string {
  if (day.count === 0 && day.distance <= 0 && day.timeMinutes <= 0) return 'bg-slate-850 hover:bg-slate-700';

  if (store.sportFilter === 'Workout') {
    if (day.timeMinutes < 45) return 'bg-purple-950/70 border border-purple-900/50';
    if (day.timeMinutes < 75) return 'bg-purple-700 border border-purple-600/50';
    return 'bg-purple-500 shadow-sm shadow-purple-500/30';
  }

  const score = day.distance > 0 ? day.distance : (day.timeMinutes / 6);
  if (score < 8) return 'bg-orange-950/70 border border-orange-900/50';
  if (score < 18) return 'bg-orange-700 border border-orange-600/50';
  return 'bg-orange-500 shadow-sm shadow-orange-500/30';
}

function getHeatmapTooltip(day: { date: string; distance: number; timeMinutes: number; count: number }): string {
  if (day.count === 0) return `${day.date}: No activities`;
  const parts: string[] = [`${day.date}: ${day.count} workout${day.count > 1 ? 's' : ''}`];
  if (day.distance > 0) parts.push(`${day.distance} ${store.unitSystem === 'metric' ? 'km' : 'mi'}`);
  if (day.timeMinutes > 0) parts.push(`${day.timeMinutes} mins`);
  return parts.join(' • ');
}

// Chart rendering
function renderCumulativeChart() {
  if (!cumulativeChartRef.value) return;
  if (!cumulativeChart) {
    cumulativeChart = echarts.init(cumulativeChartRef.value);
  }

  const { years, seriesByYear } = store.cumulativeProgress;
  const currentYear = store.currentYear;

  const colors = ['#64748B', '#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B'];
  let colorIdx = 0;

  const series = years.map((y) => {
    const isCurrent = y === currentYear;
    const data = seriesByYear[y] ? seriesByYear[y].slice(0, 365) : [];
    
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
      textStyle: { color: '#F1F5F9' },
      valueFormatter: (value: any) => `${value} ${store.unitSystem === 'metric' ? 'km' : 'mi'}`,
    },
    grid: {
      top: '8%',
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 365 }, (_, i) => `Day ${i + 1}`),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94A3B8',
        interval: 30,
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
  const workoutMonthly = new Array(12).fill(0);
  const otherMonthly = new Array(12).fill(0);

  const isTime = monthlyMetric.value === 'time';

  for (const act of store.thisYearActivities) {
    const m = act.month;
    const val = isTime
      ? act.movingTimeSec / 3600
      : (store.unitSystem === 'metric' ? act.distanceKm : act.distanceMiles);

    if (act.sport === 'Run') runMonthly[m] += val;
    else if (act.sport === 'Ride') rideMonthly[m] += val;
    else if (act.sport === 'Workout') workoutMonthly[m] += val;
    else otherMonthly[m] += val;
  }

  const unitLabel = isTime ? 'hrs' : (store.unitSystem === 'metric' ? 'km' : 'mi');

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F1F5F9' },
      valueFormatter: (value: any) => `${value} ${unitLabel}`,
    },
    legend: {
      textStyle: { color: '#94A3B8' },
      bottom: 0,
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '14%',
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
      name: isTime ? 'Hours' : (store.unitSystem === 'metric' ? 'KM' : 'Miles'),
      nameTextStyle: { color: '#94A3B8' },
      splitLine: { lineStyle: { color: '#1E293B' } },
      axisLabel: { color: '#94A3B8' },
    },
    series: [
      {
        name: 'Running',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#FC4C02' },
        data: runMonthly.map(v => parseFloat(v.toFixed(1))),
      },
      {
        name: 'Cycling',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#0EA5E9' },
        data: rideMonthly.map(v => parseFloat(v.toFixed(1))),
      },
      {
        name: 'Workouts',
        type: 'bar',
        stack: 'total',
        itemStyle: { color: '#8B5CF6' },
        data: workoutMonthly.map(v => parseFloat(v.toFixed(1))),
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
