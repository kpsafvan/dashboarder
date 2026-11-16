<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <XIcon class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
          <SettingsIcon class="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-white tracking-tight">Athlete Settings</h2>
          <p class="text-xs text-slate-400">Personalize training zones & targets</p>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="space-y-4">
        <!-- Max Heart Rate -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Max Heart Rate (BPM)
          </label>
          <input
            v-model.number="store.maxHeartRate"
            type="number"
            min="120"
            max="230"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
          />
          <p class="text-[11px] text-slate-500 mt-1">Used to calculate HR Zones (Z1-Z5) and TRIMP stress scores.</p>
        </div>

        <!-- FTP -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Functional Threshold Power / FTP (Watts)
          </label>
          <input
            v-model.number="store.ftp"
            type="number"
            min="100"
            max="500"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
          />
          <p class="text-[11px] text-slate-500 mt-1">Used for cycling Training Stress Score (TSS) calculation.</p>
        </div>

        <!-- Annual Goal -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Annual Distance Target ({{ store.unitSystem === 'metric' ? 'Kilometers' : 'Miles' }})
          </label>
          <input
            v-model.number="store.annualDistanceGoal"
            type="number"
            min="100"
            max="20000"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
          />
          <p class="text-[11px] text-slate-500 mt-1">Tracks your pace trajectory on the This Year tab.</p>
        </div>

        <!-- Units -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">
            Units System
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="setUnit('metric')"
              :class="[
                'py-2 rounded-xl text-xs font-semibold border transition-all',
                store.unitSystem === 'metric'
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              Metric (km, m, km/h)
            </button>
            <button
              @click="setUnit('imperial')"
              :class="[
                'py-2 rounded-xl text-xs font-semibold border transition-all',
                store.unitSystem === 'imperial'
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              Imperial (miles, ft, mph)
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
        <button
          @click="save"
          class="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-colors shadow-md shadow-orange-500/20"
        >
          Save Settings
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useStravaStore } from '../stores/stravaStore';
import type { UnitSystem } from '../types/strava';
import {
  X as XIcon,
  Settings as SettingsIcon,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
const store = useStravaStore();

function setUnit(unit: UnitSystem) {
  store.unitSystem = unit;
}

function save() {
  store.saveSettings();
  emit('close');
}
</script>
