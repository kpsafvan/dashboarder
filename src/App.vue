<template>
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
    
    <!-- Top Navigation Header -->
    <Header
      @open-upload="showUploadModal = true"
      @open-settings="showSettingsModal = true"
    />

    <!-- Secondary Tabs Bar (only shown when data exists) -->
    <TabsNav v-if="store.hasData" />

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      
      <!-- Empty State / Welcome Hero -->
      <div v-if="!store.hasData" class="py-12 sm:py-16 text-center max-w-3xl mx-auto">
        <div class="inline-flex p-3 rounded-3xl bg-orange-500/10 border border-orange-500/30 text-orange-500 mb-6 shadow-xl shadow-orange-500/10 animate-bounce duration-1000">
          <svg class="w-12 h-12 fill-current" viewBox="0 0 24 24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.98 15.827h4.173"/>
          </svg>
        </div>

        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Strava Premium Analytics, <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            Unlocked 100% Free & Local
          </span>
        </h1>

        <p class="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your Strava <code class="text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-900/50">activities.csv</code> or complete export <code class="text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-900/50">.zip</code> to instantly generate Fitness & Freshness curves, multi-year progression comparisons, shoe odometers, and route maps.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            @click="showUploadModal = true"
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <UploadCloudIcon class="w-5 h-5" />
            <span>Upload Strava Export (.csv or .zip)</span>
          </button>

          <button
            @click="loadDemo"
            :disabled="store.isLoading"
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>⚡ Explore with Demo Data (3 Years)</span>
          </button>
        </div>

        <!-- Feature Cards Grid -->
        <div class="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          <div class="glass-panel p-5">
            <div class="text-2xl mb-2">⚡</div>
            <h3 class="text-sm font-bold text-white mb-1">Fitness & Freshness (CTL/ATL/TSB)</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Banister impulse-response model showing 42-day rolling Fitness, 7-day Fatigue, and Form zones.
            </p>
          </div>

          <div class="glass-panel p-5">
            <div class="text-2xl mb-2">📈</div>
            <h3 class="text-sm font-bold text-white mb-1">Cumulative Day 1–365 Curves</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Compare your year-to-date pace trajectory against every previous calendar year on the exact same date.
            </p>
          </div>

          <div class="glass-panel p-5">
            <div class="text-2xl mb-2">👟</div>
            <h3 class="text-sm font-bold text-white mb-1">Shoe & Bike Wear Odometers</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Track lifecycle status bars on running shoes (750 km limit) and bike drivetrains with retirement alerts.
            </p>
          </div>

          <div class="glass-panel p-5">
            <div class="text-2xl mb-2">🏆</div>
            <h3 class="text-sm font-bold text-white mb-1">Lifetime Hall of Fame</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              All-time career records: fastest 5K, 10K, Half Marathon, peak power wattage, and biggest mountain ascents.
            </p>
          </div>

          <div class="glass-panel p-5">
            <div class="text-2xl mb-2">🗺️</div>
            <h3 class="text-sm font-bold text-white mb-1">Route Maps & Heatmaps</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Extracts GPS coordinates from your archive's GPX files and plots interactive Dark Matter route maps.
            </p>
          </div>

          <div class="glass-panel p-5">
            <div class="text-2xl mb-2">🔒</div>
            <h3 class="text-sm font-bold text-white mb-1">100% Privacy Guaranteed</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Zero backend server storage. Everything runs locally in your browser with persistent IndexedDB storage.
            </p>
          </div>
        </div>

        <!-- How to get Strava export -->
        <div class="mt-12 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-left text-xs text-slate-400 max-w-2xl mx-auto">
          <h4 class="text-sm font-bold text-white mb-2 flex items-center gap-2">
            💡 How to get your Strava data export
          </h4>
          <ol class="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>Log in to <strong class="text-slate-200">Strava.com</strong> on your computer.</li>
            <li>Hover over your profile picture top-right and select <strong class="text-slate-200">Settings</strong>.</li>
            <li>Click <strong class="text-slate-200">My Account</strong> in the left sidebar menu.</li>
            <li>Scroll down to <strong class="text-slate-200">Download or Delete Your Account</strong> and click <strong class="text-orange-400">Get Started</strong>.</li>
            <li>Under section 2, click <strong class="text-orange-400">Request Your Archive</strong>. Strava will email you a download link containing your <code class="text-orange-300">activities.csv</code> and archive zip.</li>
          </ol>
        </div>

      </div>

      <!-- Active Dashboard Tabs -->
      <div v-else>
        <ThisYearTab v-if="store.activeTab === 'this_year'" />
        <LifetimeTab v-else-if="store.activeTab === 'lifetime'" />
        <FitnessTab v-else-if="store.activeTab === 'fitness'" />
        <GearTab v-else-if="store.activeTab === 'gear'" />
        <RoutesTab v-else-if="store.activeTab === 'routes'" />
        <ExplorerTab v-else-if="store.activeTab === 'explorer'" />
      </div>

    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <p>Dashboarder &copy; 2026. Free & Open-Source Universal Analytics & Strava Dashboard.</p>
    </footer>

    <!-- Modals -->
    <UploadModal
      :isOpen="showUploadModal"
      @close="showUploadModal = false"
    />

    <SettingsModal
      :isOpen="showSettingsModal"
      @close="showSettingsModal = false"
    />

    <ActivityModal />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStravaStore } from './stores/stravaStore';
import Header from './components/Header.vue';
import TabsNav from './components/TabsNav.vue';
import UploadModal from './components/UploadModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import ActivityModal from './components/ActivityModal.vue';

// Tab components
import ThisYearTab from './components/tabs/ThisYearTab.vue';
import LifetimeTab from './components/tabs/LifetimeTab.vue';
import FitnessTab from './components/tabs/FitnessTab.vue';
import GearTab from './components/tabs/GearTab.vue';
import RoutesTab from './components/tabs/RoutesTab.vue';
import ExplorerTab from './components/tabs/ExplorerTab.vue';

import { UploadCloud as UploadCloudIcon } from 'lucide-vue-next';

const store = useStravaStore();

const showUploadModal = ref(false);
const showSettingsModal = ref(false);

async function loadDemo() {
  await store.loadDemoData();
}

onMounted(() => {
  store.init();
});
</script>
