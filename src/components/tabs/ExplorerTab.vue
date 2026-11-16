<template>
  <div class="space-y-6">
    
    <!-- Header & Search Controls -->
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🔍 Activity Explorer
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Search, sort, and inspect every workout in your training history.
          </p>
        </div>

        <!-- Search Input -->
        <div class="flex items-center gap-2">
          <div class="relative w-full md:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, workout name..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <SearchIcon class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <!-- Sort Select -->
          <select
            v-model="sortBy"
            class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="dist_desc">Highest Distance</option>
            <option value="elev_desc">Biggest Climb</option>
            <option value="time_desc">Longest Duration</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="glass-panel p-4 sm:p-6">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400">
              <th class="py-3 px-3 font-semibold">Date</th>
              <th class="py-3 px-3 font-semibold">Activity</th>
              <th class="py-3 px-3 font-semibold">Sport</th>
              <th class="py-3 px-3 font-semibold text-right">Distance</th>
              <th class="py-3 px-3 font-semibold text-right">Time</th>
              <th class="py-3 px-3 font-semibold text-right">Elevation</th>
              <th class="py-3 px-3 font-semibold text-right">Pace / Speed</th>
              <th class="py-3 px-3 font-semibold text-right">Avg HR</th>
              <th class="py-3 px-3 font-semibold text-right">Effort</th>
              <th class="py-3 px-3 font-semibold">Gear</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="act in paginatedActivities"
              :key="act.id"
              @click="store.setSelectedActivity(act)"
              class="hover:bg-slate-800/50 cursor-pointer transition-colors text-slate-300"
            >
              <td class="py-3 px-3 font-sans text-slate-400 whitespace-nowrap">
                {{ act.dateString }}
              </td>
              <td class="py-3 px-3 font-sans font-bold text-white max-w-[200px] truncate" :title="act.title">
                {{ act.title }}
              </td>
              <td class="py-3 px-3 font-sans">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold" :class="getSportTagClass(act.sport)">
                  {{ act.sport }}
                </span>
              </td>
              <td class="py-3 px-3 text-right font-semibold text-white whitespace-nowrap">
                {{ store.unitSystem === 'metric' ? `${act.distanceKm} km` : `${act.distanceMiles} mi` }}
              </td>
              <td class="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                {{ formatSec(act.movingTimeSec) }}
              </td>
              <td class="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                {{ store.unitSystem === 'metric' ? `${act.elevationGainM} m` : `${act.elevationGainFt} ft` }}
              </td>
              <td class="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                <span v-if="act.sport === 'Run' || act.sport === 'Walk'">
                  {{ formatPaceVal(act.paceMinPerKm) }}
                </span>
                <span v-else-if="act.sport === 'Ride'">
                  {{ act.speedKmh }} km/h
                </span>
                <span v-else>--</span>
              </td>
              <td class="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                <span v-if="act.avgHeartRate" class="text-rose-400">{{ act.avgHeartRate }} bpm</span>
                <span v-else class="text-slate-600">--</span>
              </td>
              <td class="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                <span v-if="act.relativeEffort" class="text-orange-400 font-bold">{{ act.relativeEffort }}</span>
                <span v-else class="text-slate-600">--</span>
              </td>
              <td class="py-3 px-3 font-sans text-[11px] text-slate-400 max-w-[140px] truncate">
                {{ act.gear || '--' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing <span class="font-bold text-white">{{ startIndex + 1 }}</span> to
          <span class="font-bold text-white">{{ Math.min(filteredList.length, startIndex + pageSize) }}</span> of
          <span class="font-bold text-white">{{ filteredList.length }}</span> workouts
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-slate-200 transition-colors"
          >
            Previous
          </button>
          <span class="px-2 font-mono">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-slate-200 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStravaStore } from '../../stores/stravaStore';
import { Search as SearchIcon } from 'lucide-vue-next';
import { formatDuration, formatPace } from '../../services/analytics';

const store = useStravaStore();

const searchQuery = ref('');
const sortBy = ref('date_desc');
const currentPage = ref(1);
const pageSize = ref(20);

const filteredList = computed(() => {
  let list = [...store.filteredActivities];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(a => a.title.toLowerCase().includes(q) || a.gear.toLowerCase().includes(q));
  }

  // Sorting
  if (sortBy.value === 'date_desc') {
    list.sort((a, b) => b.date.getTime() - a.date.getTime());
  } else if (sortBy.value === 'date_asc') {
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
  } else if (sortBy.value === 'dist_desc') {
    list.sort((a, b) => b.distanceKm - a.distanceKm);
  } else if (sortBy.value === 'elev_desc') {
    list.sort((a, b) => b.elevationGainM - a.elevationGainM);
  } else if (sortBy.value === 'time_desc') {
    list.sort((a, b) => b.movingTimeSec - a.movingTimeSec);
  }

  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize.value));
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);

const paginatedActivities = computed(() => {
  return filteredList.value.slice(startIndex.value, startIndex.value + pageSize.value);
});

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
  if (sport === 'Hike') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
}
</script>
