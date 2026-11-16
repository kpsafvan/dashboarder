<template>
  <div class="border-b border-slate-800 bg-slate-900/40 px-4 lg:px-8 py-2">
    <div class="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="store.setActiveTab(tab.id)"
        :class="[
          'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap',
          store.activeTab === tab.id
            ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
        ]"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge"
          class="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider"
          :class="tab.badgeColor || 'bg-orange-500/20 text-orange-400 border border-orange-500/30'"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStravaStore } from '../stores/stravaStore';
import type { ActiveTab } from '../types/strava';

const store = useStravaStore();

const tabs: { id: ActiveTab; label: string; icon: string; badge?: string; badgeColor?: string }[] = [
  { id: 'this_year', label: `This Year (${store.currentYear})`, icon: '🏃' },
  { id: 'lifetime', label: 'Lifetime & YoY', icon: '🏆' },
  { id: 'fitness', label: 'Fitness & Freshness', icon: '⚡', badge: 'PRO' },
  { id: 'gear', label: 'Gear Tracker', icon: '👟' },
  { id: 'routes', label: 'Routes & Map', icon: '🗺️' },
  { id: 'explorer', label: 'Activity Explorer', icon: '🔍' },
];
</script>
