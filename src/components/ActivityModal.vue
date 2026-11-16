<template>
  <div v-if="activity" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
      
      <!-- Close Button -->
      <button
        @click="store.setSelectedActivity(null)"
        class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <XIcon class="w-5 h-5" />
      </button>

      <!-- Activity Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider" :class="getSportTagClass(activity.sport)">
            {{ activity.sport }}
          </span>
          <span class="text-xs text-slate-400">{{ activity.dateString }}</span>
          <span v-if="activity.isCommute" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            Commute
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {{ activity.title }}
        </h2>
      </div>

      <!-- Core Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        
        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Distance</span>
          <span class="text-xl font-extrabold text-white mono-font">
            {{ store.unitSystem === 'metric' ? `${activity.distanceKm} km` : `${activity.distanceMiles} mi` }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Moving Time</span>
          <span class="text-xl font-extrabold text-white mono-font">
            {{ formatSec(activity.movingTimeSec) }}
          </span>
          <span class="text-[10px] text-slate-500 block mt-0.5">Elapsed: {{ formatSec(activity.elapsedTimeSec) }}</span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Elevation Gain</span>
          <span class="text-xl font-extrabold text-white mono-font">
            {{ store.unitSystem === 'metric' ? `${activity.elevationGainM} m` : `${activity.elevationGainFt} ft` }}
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Avg Pace / Speed</span>
          <span class="text-xl font-extrabold text-orange-400 mono-font">
            <span v-if="activity.sport === 'Run' || activity.sport === 'Walk'">
              {{ formatPaceVal(activity.paceMinPerKm) }}
            </span>
            <span v-else-if="activity.sport === 'Ride'">
              {{ activity.speedKmh }} km/h
            </span>
            <span v-else>--</span>
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Heart Rate</span>
          <span class="text-xl font-extrabold text-rose-400 mono-font">
            {{ activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : '--' }}
          </span>
          <span v-if="activity.maxHeartRate" class="text-[10px] text-slate-500 block mt-0.5">
            Max: {{ activity.maxHeartRate }} bpm
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Relative Effort</span>
          <span class="text-xl font-extrabold text-amber-400 mono-font">
            {{ activity.relativeEffort || '--' }}
          </span>
        </div>

      </div>

      <!-- Additional Details: Power, Cadence, Gear -->
      <div class="space-y-2 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        <div v-if="activity.avgWatts" class="flex items-center justify-between text-slate-400">
          <span>Cycling Power</span>
          <span class="text-white font-mono font-semibold">
            Avg: {{ activity.avgWatts }}W | Weighted: {{ activity.weightedWatts || '--' }}W | Max: {{ activity.maxWatts || '--' }}W
          </span>
        </div>
        <div v-if="activity.avgCadence" class="flex items-center justify-between text-slate-400">
          <span>Cadence</span>
          <span class="text-white font-mono font-semibold">
            {{ activity.avgCadence }} {{ activity.sport === 'Run' ? 'spm' : 'rpm' }}
          </span>
        </div>
        <div v-if="activity.gear" class="flex items-center justify-between text-slate-400">
          <span>Gear Used</span>
          <span class="text-white font-semibold">{{ activity.gear }}</span>
        </div>
        <div v-if="activity.filename" class="flex items-center justify-between text-slate-400">
          <span>File Track</span>
          <span class="text-slate-500 font-mono text-[11px] truncate max-w-[260px]">{{ activity.filename }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStravaStore } from '../stores/stravaStore';
import { X as XIcon } from 'lucide-vue-next';
import { formatDuration, formatPace } from '../services/analytics';

const store = useStravaStore();

const activity = computed(() => store.selectedActivity);

function formatSec(seconds: number) {
  return formatDuration(seconds);
}

function formatPaceVal(minKm: number) {
  return formatPace(minKm, store.unitSystem);
}

function getSportTagClass(sport: string) {
  if (sport === 'Run') return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
  if (sport === 'Ride') return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  if (sport === 'Swim') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
  return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
}
</script>
