<template>
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      
      <!-- Brand & Status -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/10">
          <svg class="w-6 h-6 fill-current text-orange-500" viewBox="0 0 24 24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.98 15.827h4.173"/>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Dashboarder
              <span class="text-[10px] uppercase tracking-wider font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                Pro
              </span>
            </h1>
          </div>
          <p class="text-xs text-slate-400">
            <span v-if="store.hasData" class="text-emerald-400 font-medium">
              ● {{ store.activities.length.toLocaleString() }} activities loaded
            </span>
            <span v-else class="text-amber-400 font-medium">
              ○ No data loaded (Upload CSV or Load Demo)
            </span>
          </p>
        </div>
      </div>

      <!-- Sport Filter Pills -->
      <div v-if="store.hasData" class="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
        <button
          v-for="sport in sports"
          :key="sport.value"
          @click="store.setSportFilter(sport.value)"
          :class="[
            'px-3 py-1.5 rounded-lg font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap',
            store.sportFilter === sport.value
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          ]"
        >
          <span>{{ sport.icon }}</span>
          <span>{{ sport.label }}</span>
        </button>
      </div>

      <!-- Controls: Units, Upload, Settings, Reset -->
      <div class="flex items-center gap-2">
        <!-- Metric / Imperial Toggle -->
        <button
          @click="store.toggleUnitSystem()"
          class="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1"
          title="Toggle Metric (KM) / Imperial (Miles)"
        >
          <span :class="store.unitSystem === 'metric' ? 'text-orange-400 font-bold' : 'text-slate-500'">KM</span>
          <span class="text-slate-600">/</span>
          <span :class="store.unitSystem === 'imperial' ? 'text-orange-400 font-bold' : 'text-slate-500'">MI</span>
        </button>

        <!-- Settings Modal Trigger -->
        <button
          @click="$emit('open-settings')"
          class="p-2 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Athlete Settings (Max HR, FTP, Goals)"
        >
          <SettingsIcon class="w-4 h-4" />
        </button>

        <!-- Upload CSV/ZIP Button -->
        <button
          @click="$emit('open-upload')"
          class="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-orange-500/20"
        >
          <UploadCloudIcon class="w-4 h-4" />
          <span>Upload Export</span>
        </button>

        <!-- Clear / Reset -->
        <button
          v-if="store.hasData"
          @click="confirmClear"
          class="p-2 rounded-lg border border-slate-800 hover:border-red-900/50 bg-slate-950/70 hover:bg-red-950/30 text-slate-400 hover:text-red-400 transition-colors"
          title="Clear uploaded data"
        >
          <Trash2Icon class="w-4 h-4" />
        </button>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { useStravaStore } from '../stores/stravaStore';
import type { SportFilter } from '../types/strava';
import {
  UploadCloud as UploadCloudIcon,
  Settings as SettingsIcon,
  Trash2 as Trash2Icon
} from 'lucide-vue-next';

defineEmits(['open-upload', 'open-settings']);

const store = useStravaStore();

const sports: { label: string; value: SportFilter; icon: string }[] = [
  { label: 'All', value: 'All', icon: '⚡' },
  { label: 'Run', value: 'Run', icon: '🏃' },
  { label: 'Ride', value: 'Ride', icon: '🚴' },
  { label: 'Workout', value: 'Workout', icon: '🏋️' },
  { label: 'Walk', value: 'Walk', icon: '🚶' },
  { label: 'Hike', value: 'Hike', icon: '🥾' },
  { label: 'Swim', value: 'Swim', icon: '🏊' },
];

function confirmClear() {
  if (confirm('Are you sure you want to clear your loaded Strava data from your browser?')) {
    store.clearData();
  }
}
</script>
