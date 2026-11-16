<template>
  <div class="space-y-6">
    
    <!-- Top Summary Banner -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Gear & Equipment Lifecycle
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Prevent overuse injuries and component failures with real-time mileage odometers.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold border border-slate-700">
            👟 {{ shoes.length }} Shoes Tracked
          </span>
          <span class="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold border border-slate-700">
            🚴 {{ bikes.length }} Bikes Tracked
          </span>
        </div>
      </div>
    </div>

    <!-- Running Shoes Section -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
          👟 Running Shoes (Target: 750 km lifespan)
        </h3>
      </div>

      <div v-if="shoes.length === 0" class="text-center py-8 text-slate-500 text-xs">
        No running shoes detected in your export's Gear column.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in shoes"
          :key="item.name"
          class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <h4 class="text-sm font-bold text-white tracking-tight">{{ item.name }}</h4>
              <span
                class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md"
                :class="getStatusBadgeClass(item.status)"
              >
                {{ item.status === 'retire' ? 'RETIRE' : (item.status === 'warning' ? 'HIGH WEAR' : 'HEALTHY') }}
              </span>
            </div>

            <div class="flex items-baseline justify-between text-xs text-slate-400 mb-1">
              <span>Mileage</span>
              <span class="font-bold text-white mono-font">
                {{ item.totalDistanceKm }} / {{ item.targetDistanceKm }} km ({{ item.percentageUsed }}%)
              </span>
            </div>

            <!-- Lifecycle Bar -->
            <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="getProgressBarClass(item.status)"
                :style="{ width: `${Math.min(100, item.percentageUsed)}%` }"
              ></div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>{{ item.activityCount }} runs logged</span>
            <span>Last used: {{ item.lastUsed.toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bikes & Cycling Equipment Section -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
          🚴 Bikes & Drivetrain Components (Target: 8,000 km lifespan)
        </h3>
      </div>

      <div v-if="bikes.length === 0" class="text-center py-8 text-slate-500 text-xs">
        No bikes detected in your export's Gear column.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in bikes"
          :key="item.name"
          class="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <h4 class="text-base font-bold text-white tracking-tight">{{ item.name }}</h4>
                <p class="text-xs text-slate-400">Total Odometer</p>
              </div>
              <span
                class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md"
                :class="getStatusBadgeClass(item.status)"
              >
                {{ item.status === 'retire' ? 'OVERHAUL' : (item.status === 'warning' ? 'MAINTENANCE' : 'GOOD') }}
              </span>
            </div>

            <div class="flex items-baseline justify-between text-xs text-slate-400 mb-1">
              <span>Chain & Component Wear</span>
              <span class="font-bold text-white mono-font">
                {{ item.totalDistanceKm.toLocaleString() }} / {{ item.targetDistanceKm.toLocaleString() }} km ({{ item.percentageUsed }}%)
              </span>
            </div>

            <!-- Lifecycle Bar -->
            <div class="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="getProgressBarClass(item.status)"
                :style="{ width: `${Math.min(100, item.percentageUsed)}%` }"
              ></div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{{ item.activityCount }} rides logged</span>
            <span>First active: {{ item.firstUsed.toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStravaStore } from '../../stores/stravaStore';

const store = useStravaStore();

const gearList = computed(() => store.gearSummaries);

const shoes = computed(() => gearList.value.filter(g => g.sport === 'Run' || g.sport === 'Walk'));
const bikes = computed(() => gearList.value.filter(g => g.sport === 'Ride' || g.sport === 'Other'));

function getStatusBadgeClass(status: string) {
  if (status === 'retire') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  if (status === 'warning') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
}

function getProgressBarClass(status: string) {
  if (status === 'retire') return 'bg-gradient-to-r from-rose-500 to-red-600';
  if (status === 'warning') return 'bg-gradient-to-r from-amber-500 to-orange-500';
  return 'bg-gradient-to-r from-emerald-500 to-teal-400';
}
</script>
