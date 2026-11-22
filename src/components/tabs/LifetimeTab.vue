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

    <!-- Strava Best Efforts & Top 10s Leaderboard Suite -->
    <div class="glass-panel p-5 sm:p-6">
      
      <!-- Section Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl">🏆</span>
            <h3 class="text-lg font-extrabold text-white tracking-tight">Strava Best Efforts & All-Time Top 10s</h3>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              PRs & Leaderboards
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Official benchmark PRs and all-time top 10 performances across your entire training history
          </p>
        </div>

        <!-- Category Group Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            v-for="grp in categoryGroups"
            :key="grp.id"
            @click="selectedGroup = grp.id"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap',
              selectedGroup === grp.id
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            ]"
          >
            <span>{{ grp.icon }}</span>
            <span>{{ grp.label }}</span>
          </button>
        </div>
      </div>

      <!-- Benchmark Category Selector Pills -->
      <div class="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-slate-800/60">
        <button
          v-for="cat in groupCategories"
          :key="cat.id"
          @click="selectedCategoryId = cat.id"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border',
            selectedCategoryId === cat.id
              ? 'bg-slate-800 text-orange-400 border-orange-500/50 shadow-sm'
              : 'bg-slate-950/50 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
          ]"
        >
          <span>{{ cat.name }}</span>
          <span
            :class="[
              'text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold',
              selectedCategoryId === cat.id ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-800 text-slate-400'
            ]"
          >
            {{ cat.items.length }}
          </span>
        </button>
      </div>

      <!-- Active Benchmark Content -->
      <div v-if="activeCategory" class="mt-5 space-y-6">
        
        <!-- Benchmark Hero / PR Spotlight -->
        <div v-if="activeCategory.prItem" class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 shrink-0">
              🥇
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  All-Time Personal Record (PR)
                </span>
                <span class="text-xs text-slate-400">{{ activeCategory.prItem.date }}</span>
              </div>
              <h4 class="text-lg font-bold text-white tracking-tight mt-1">
                {{ activeCategory.name }}: <span class="text-amber-400 font-mono font-extrabold">{{ activeCategory.prItem.value }}</span>
              </h4>
              <div class="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                <span class="font-medium text-slate-200">{{ activeCategory.prItem.activityTitle }}</span>
                <span class="text-slate-500">•</span>
                <span class="text-amber-300 font-mono">{{ activeCategory.prItem.secondaryLabel }}: {{ activeCategory.prItem.secondaryValue }}</span>
                <span v-if="activeCategory.prItem.extraInfo" class="text-slate-400">({{ activeCategory.prItem.extraInfo }})</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="openActivity(activeCategory.prItem.activity)"
              class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Inspect Activity</span>
              <span>↗</span>
            </button>
          </div>
        </div>

        <!-- Two Column Layout: Top 10 Table & Year-over-Year Progression -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Top 10 Ranked Leaderboard Table -->
          <div class="lg:col-span-2 overflow-x-auto">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top 10 All-Time Leaderboard
              </span>
              <span class="text-xs text-slate-500">
                Click any row to open activity details
              </span>
            </div>

            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400">
                  <th class="py-2.5 px-3 font-semibold w-12 text-center">Rank</th>
                  <th class="py-2.5 px-3 font-semibold">Effort / Value</th>
                  <th class="py-2.5 px-3 font-semibold">Gap to PR</th>
                  <th class="py-2.5 px-3 font-semibold">Activity</th>
                  <th class="py-2.5 px-3 font-semibold text-right">{{ activeCategory.items[0]?.secondaryLabel || 'Metric' }}</th>
                  <th class="py-2.5 px-3 font-semibold text-right">Date</th>
                  <th class="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-mono">
                <tr
                  v-for="item in activeCategory.items"
                  :key="item.activityId"
                  @click="openActivity(item.activity)"
                  :class="[
                    'cursor-pointer hover:bg-slate-800/50 transition-colors group',
                    item.rank === 1 ? 'bg-amber-500/5' : ''
                  ]"
                >
                  <!-- Rank Badge -->
                  <td class="py-3 px-3 text-center">
                    <span
                      v-if="item.rank === 1"
                      class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40"
                    >
                      🥇
                    </span>
                    <span
                      v-else-if="item.rank === 2"
                      class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 font-extrabold text-xs border border-slate-300/40"
                    >
                      🥈
                    </span>
                    <span
                      v-else-if="item.rank === 3"
                      class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-extrabold text-xs border border-amber-700/40"
                    >
                      🥉
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-850 text-slate-400 font-bold text-xs border border-slate-800"
                    >
                      #{{ item.rank }}
                    </span>
                  </td>

                  <!-- Effort Value -->
                  <td class="py-3 px-3">
                    <span :class="['font-extrabold text-sm', item.rank === 1 ? 'text-amber-400' : 'text-white']">
                      {{ item.value }}
                    </span>
                  </td>

                  <!-- Gap to PR -->
                  <td class="py-3 px-3 text-xs">
                    <span
                      v-if="item.rank === 1"
                      class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-400"
                    >
                      PR
                    </span>
                    <span v-else class="text-slate-400">
                      {{ formatDelta(activeCategory, item, activeCategory.prItem) }}
                    </span>
                  </td>

                  <!-- Activity Title & Details -->
                  <td class="py-3 px-3 font-sans">
                    <div class="font-bold text-slate-200 group-hover:text-orange-400 transition-colors truncate max-w-xs" :title="item.activityTitle">
                      {{ item.activityTitle }}
                    </div>
                    <div v-if="item.extraInfo" class="text-[11px] text-slate-500 truncate">
                      {{ item.extraInfo }}
                    </div>
                  </td>

                  <!-- Secondary Metric (Pace / Speed / Duration / HR) -->
                  <td class="py-3 px-3 text-right text-slate-300">
                    {{ item.secondaryValue }}
                  </td>

                  <!-- Date -->
                  <td class="py-3 px-3 text-right text-slate-400 font-sans text-xs whitespace-nowrap">
                    {{ item.date }}
                  </td>

                  <!-- Action Arrow -->
                  <td class="py-3 px-2 text-center text-slate-600 group-hover:text-orange-400 transition-colors">
                    ↗
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Right Column: Year-over-Year Progression & Benchmark Stats -->
          <div class="space-y-4">
            
            <!-- YoY Progression Card -->
            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>📅</span>
                  <span>Year-by-Year PR Progression</span>
                </span>
                <span class="text-[10px] text-slate-500 font-mono">
                  {{ activeCategory.yearBests.length }} active years
                </span>
              </div>

              <div v-if="activeCategory.yearBests.length > 0" class="space-y-2.5">
                <div
                  v-for="yb in activeCategory.yearBests"
                  :key="yb.year"
                  @click="openActivity(yb.item.activity)"
                  class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-orange-500/40 transition-all cursor-pointer group"
                >
                  <div class="flex items-center justify-between text-xs mb-1">
                    <div class="flex items-center gap-1.5 font-bold">
                      <span class="text-white">{{ yb.year }}</span>
                      <span
                        v-if="yb.item.numericValue === activeCategory.prItem?.numericValue"
                        class="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-extrabold uppercase"
                      >
                        👑 Best Ever
                      </span>
                    </div>
                    <span class="font-mono font-bold text-orange-400 group-hover:text-orange-300">
                      {{ yb.item.value }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span class="truncate max-w-[160px]">{{ yb.item.activityTitle }}</span>
                    <span>{{ yb.item.secondaryValue }}</span>
                  </div>
                </div>
              </div>

              <div v-else class="text-xs text-slate-500 py-3 text-center">
                No annual records recorded.
              </div>
            </div>

            <!-- Benchmark Context & Insights Card -->
            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>📊</span>
                <span>Benchmark Stats</span>
              </span>

              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span class="text-slate-400">Category Type</span>
                  <span class="font-bold text-white capitalize">{{ activeCategory.categoryGroup }}</span>
                </div>

                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span class="text-slate-400">Top 10 Entries</span>
                  <span class="font-bold text-white mono-font">{{ activeCategory.items.length }} efforts</span>
                </div>

                <div v-if="activeCategory.items.length > 1" class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span class="text-slate-400">10th vs 1st Spread</span>
                  <span class="font-bold text-orange-400 mono-font">
                    {{ formatDelta(activeCategory, activeCategory.items[activeCategory.items.length - 1], activeCategory.prItem) }}
                  </span>
                </div>
              </div>

              <p class="text-[11px] text-slate-400 leading-relaxed pt-1">
                {{ activeCategory.description }}.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- All-Time Hall of Fame / Personal Bests -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            ⭐ Quick Records Summary
          </h3>
          <p class="text-xs text-slate-400">Snapshot of primary milestones across sports</p>
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
import type { BestEffortCategory, BestEffortItem, NormalizedActivity } from '../../types/strava';

const store = useStravaStore();

const yoyChartRef = ref<HTMLDivElement | null>(null);
let yoyChart: echarts.ECharts | null = null;

const kpis = computed(() => store.lifetimeKPIs);
const yoyRows = computed(() => store.yearStats);
const records = computed(() => store.personalRecords);

// Best Efforts & Top 10s state
const selectedGroup = ref<'running' | 'endurance' | 'workout' | 'intensity'>('running');
const selectedCategoryId = ref<string>('run_5k');

const categoryGroups = [
  { id: 'running' as const, label: 'Running PRs', icon: '🏃' },
  { id: 'endurance' as const, label: 'Endurance & Distance', icon: '⚡' },
  { id: 'workout' as const, label: 'Workouts & Calories', icon: '🏋️' },
  { id: 'intensity' as const, label: 'Cardiac Intensity', icon: '❤️' },
];

const categories = computed(() => store.bestEffortsCategories);

const groupCategories = computed(() => {
  return categories.value.filter(c => c.categoryGroup === selectedGroup.value);
});

watch(
  groupCategories,
  (newCats) => {
    if (newCats.length > 0 && !newCats.some(c => c.id === selectedCategoryId.value)) {
      selectedCategoryId.value = newCats[0].id;
    }
  },
  { immediate: true }
);

const activeCategory = computed(() => {
  return (
    categories.value.find(c => c.id === selectedCategoryId.value) ||
    groupCategories.value[0] ||
    categories.value[0]
  );
});

function openActivity(act?: NormalizedActivity) {
  if (act) {
    store.setSelectedActivity(act);
  }
}

function formatDelta(cat: BestEffortCategory, item: BestEffortItem, prItem?: BestEffortItem): string {
  if (!prItem || item.rank === 1) return 'PR';
  if (cat.metricType === 'time') {
    const deltaSec = item.numericValue - prItem.numericValue;
    const m = Math.floor(deltaSec / 60);
    const s = deltaSec % 60;
    return `+${m > 0 ? `${m}m ` : ''}${s < 10 ? '0' : ''}${s}s`;
  } else if (cat.metricType === 'distance') {
    const deltaDist = prItem.numericValue - item.numericValue;
    return `-${deltaDist.toFixed(2)} ${cat.unit}`;
  } else if (cat.metricType === 'calories') {
    const deltaCal = prItem.numericValue - item.numericValue;
    return `-${deltaCal.toLocaleString()} kcal`;
  } else if (cat.metricType === 'hr') {
    const deltaHr = prItem.numericValue - item.numericValue;
    return `-${deltaHr} bpm`;
  }
  return '';
}

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
