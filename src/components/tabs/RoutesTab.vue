<template>
  <div class="space-y-6">
    
    <div class="glass-panel p-5 sm:p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🗺️ Route GPS Tracks & Personal Heatmap
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Displaying GPS telemetry parsed from your Strava export archive.
          </p>
        </div>
        <div class="text-xs text-slate-400">
          <span class="font-bold text-orange-400 mono-font">{{ Object.keys(store.routeCoordinates).length }}</span> routes loaded
        </div>
      </div>
    </div>

    <!-- Map & Route Selector Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Interactive Leaflet Map Container -->
      <div class="glass-panel p-2 lg:col-span-3 overflow-hidden relative min-h-[480px]">
        <div ref="mapContainerRef" class="w-full h-full min-h-[480px] rounded-xl z-10"></div>
        
        <!-- Empty GPS hint overlay if no tracks -->
        <div
          v-if="Object.keys(store.routeCoordinates).length === 0"
          class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center"
        >
          <div class="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            🗺️
          </div>
          <h3 class="text-base font-bold text-white mb-1">No GPS Tracks in Current Session</h3>
          <p class="text-xs text-slate-400 max-w-md">
            To view interactive route lines and heatmaps, upload your complete <span class="text-orange-400">Strava export .zip</span> (which contains raw GPX/FIT tracks) or click <span class="text-orange-400">"Load Demo Data"</span>!
          </p>
          <button
            @click="store.loadDemoData()"
            class="mt-4 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20"
          >
            Load Demo Route Track
          </button>
        </div>
      </div>

      <!-- Route Selector List -->
      <div class="glass-panel p-5 flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-white tracking-tight mb-3">Available Tracks</h3>
          
          <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            <button
              v-for="(coords, routeName) in store.routeCoordinates"
              :key="routeName"
              @click="focusRoute(routeName)"
              :class="[
                'w-full text-left p-3 rounded-xl border text-xs transition-colors block',
                selectedRouteKey === routeName
                  ? 'bg-orange-500/10 border-orange-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              ]"
            >
              <div class="font-bold text-white truncate">{{ routeName }}</div>
              <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>📍 {{ coords.length }} GPS waypoints</span>
              </div>
            </button>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          Dark CartoDB tiles rendered client-side with Leaflet.
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import { useStravaStore } from '../../stores/stravaStore';

const store = useStravaStore();

const mapContainerRef = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let currentPolyline: L.Polyline | null = null;
const selectedRouteKey = ref<string | null>(null);

function initMap() {
  if (!mapContainerRef.value || map) return;

  // Initialize leaflet map
  map = L.map(mapContainerRef.value, {
    zoomControl: true,
  }).setView([37.7749, -122.4194], 13);

  // CartoDB Dark Matter tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  plotDefaultRoute();
}

function plotDefaultRoute() {
  if (!map) return;
  const routeKeys = Object.keys(store.routeCoordinates);
  if (routeKeys.length > 0) {
    focusRoute(routeKeys[0]);
  }
}

function focusRoute(routeName: string) {
  if (!map) return;
  selectedRouteKey.value = routeName;
  const coords = store.routeCoordinates[routeName];
  if (!coords || coords.length === 0) return;

  if (currentPolyline) {
    map.removeLayer(currentPolyline);
  }

  // Draw vibrant Strava orange route polyline
  currentPolyline = L.polyline(coords, {
    color: '#FC4C02',
    weight: 4,
    opacity: 0.9,
    lineJoin: 'round',
  }).addTo(map);

  map.fitBounds(currentPolyline.getBounds(), { padding: [30, 30] });
}

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

watch(
  () => store.routeCoordinates,
  () => {
    plotDefaultRoute();
  },
  { deep: true }
);
</script>
