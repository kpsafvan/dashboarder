import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import { get, set, del } from 'idb-keyval';
import type {
  NormalizedActivity,
  SportFilter,
  UnitSystem,
  ActiveTab,
  YearStats,
  FitnessDataPoint,
  HeartRateZone,
  GearSummary,
  PersonalRecord,
} from '../types/strava';
import { parseStravaFile, parseCsvText } from '../services/parser';
import {
  computeBanisterFitnessModel,
  computeCumulativeYearData,
  computeYearStats,
  computeHeartRateZones,
  computeGearSummaries,
  computePersonalRecords,
} from '../services/analytics';

const DB_ACTIVITIES_KEY = 'strava_dashboard_activities';
const DB_ROUTES_KEY = 'strava_dashboard_routes';
const DB_SETTINGS_KEY = 'strava_dashboard_settings';

function toCloneable<T>(val: T): any {
  try {
    return JSON.parse(JSON.stringify(toRaw(val)));
  } catch {
    return toRaw(val);
  }
}

export const useStravaStore = defineStore('strava', {
  state: () => ({
    activities: [] as NormalizedActivity[],
    routeCoordinates: {} as Record<string, [number, number][]>,
    isLoading: false,
    error: null as string | null,
    
    // UI Navigation & Filters
    activeTab: 'this_year' as ActiveTab,
    sportFilter: 'All' as SportFilter,
    unitSystem: 'metric' as UnitSystem,
    
    // Athlete settings
    maxHeartRate: 190,
    ftp: 250,
    annualDistanceGoal: 2000, // in km
    
    // Modal inspection
    selectedActivity: null as NormalizedActivity | null,
  }),

  getters: {
    hasData: (state): boolean => state.activities.length > 0,

    yearsPresent: (state): number[] => {
      const setYears = new Set(state.activities.map((a) => a.year));
      return Array.from(setYears).sort((a, b) => b - a);
    },

    currentYear: (state): number => {
      if (state.activities.length === 0) return new Date().getFullYear();
      const years = Array.from(new Set(state.activities.map((a) => a.year))).sort((a, b) => b - a);
      return years[0];
    },

    filteredActivities: (state): NormalizedActivity[] => {
      if (state.sportFilter === 'All') {
        return state.activities;
      }
      return state.activities.filter((a) => a.sport === state.sportFilter);
    },

    thisYearActivities(): NormalizedActivity[] {
      const year = this.currentYear;
      return this.filteredActivities.filter((a) => a.year === year);
    },

    previousYearActivities(): NormalizedActivity[] {
      const year = this.currentYear - 1;
      return this.filteredActivities.filter((a) => a.year === year);
    },

    thisYearKPIs(): {
      distance: number;
      elevation: number;
      movingTimeSec: number;
      activityCount: number;
      activeDays: number;
      distanceDeltaPct: number;
      elevationDeltaPct: number;
    } {
      const acts = this.thisYearActivities;
      const prevActs = this.previousYearActivities;

      const dist = acts.reduce((acc, a) => acc + (this.unitSystem === 'metric' ? a.distanceKm : a.distanceMiles), 0);
      const elev = acts.reduce((acc, a) => acc + (this.unitSystem === 'metric' ? a.elevationGainM : a.elevationGainFt), 0);
      const time = acts.reduce((acc, a) => acc + a.movingTimeSec, 0);
      const activeDays = new Set(acts.map((a) => a.dateString)).size;

      // Calculate same day-of-year comparison with previous year
      const maxDayOfYear = acts.reduce((max, a) => Math.max(max, a.dayOfYear), 0) || 365;
      const prevYtdActs = prevActs.filter((a) => a.dayOfYear <= maxDayOfYear);
      const prevDist = prevYtdActs.reduce((acc, a) => acc + (this.unitSystem === 'metric' ? a.distanceKm : a.distanceMiles), 0);
      const prevElev = prevYtdActs.reduce((acc, a) => acc + (this.unitSystem === 'metric' ? a.elevationGainM : a.elevationGainFt), 0);

      const distanceDeltaPct = prevDist > 0 ? Math.round(((dist - prevDist) / prevDist) * 100) : 0;
      const elevationDeltaPct = prevElev > 0 ? Math.round(((elev - prevElev) / prevElev) * 100) : 0;

      return {
        distance: parseFloat(dist.toFixed(1)),
        elevation: Math.round(elev),
        movingTimeSec: time,
        activityCount: acts.length,
        activeDays,
        distanceDeltaPct,
        elevationDeltaPct,
      };
    },

    lifetimeKPIs(): {
      distance: number;
      elevation: number;
      movingTimeSec: number;
      activityCount: number;
      calories: number;
      earthCircumferencePct: number;
      everestClimbCount: number;
    } {
      const acts = this.filteredActivities;
      const distKm = acts.reduce((acc, a) => acc + a.distanceKm, 0);
      const dist = this.unitSystem === 'metric' ? distKm : distKm * 0.621371;
      const elevM = acts.reduce((acc, a) => acc + a.elevationGainM, 0);
      const elev = this.unitSystem === 'metric' ? elevM : elevM * 3.28084;
      const time = acts.reduce((acc, a) => acc + a.movingTimeSec, 0);
      const calories = acts.reduce((acc, a) => {
        if (a.kilojoules) return acc + a.kilojoules;
        const rate = a.sport === 'Run' ? 65 : (a.sport === 'Ride' ? 28 : 40);
        return acc + Math.round(a.distanceKm * rate);
      }, 0);

      // Earth circumference = 40,075 km
      const earthCircumferencePct = parseFloat(((distKm / 40075) * 100).toFixed(1));
      // Mt Everest = 8,848 m
      const everestClimbCount = parseFloat((elevM / 8848).toFixed(1));

      return {
        distance: parseFloat(dist.toFixed(1)),
        elevation: Math.round(elev),
        movingTimeSec: time,
        activityCount: acts.length,
        calories,
        earthCircumferencePct,
        everestClimbCount,
      };
    },

    fitnessData(): FitnessDataPoint[] {
      return computeBanisterFitnessModel(this.filteredActivities, this.maxHeartRate, this.ftp);
    },

    currentFitnessStatus(): {
      ctl: number;
      atl: number;
      tsb: number;
      label: string;
      color: string;
    } {
      const data = this.fitnessData;
      if (data.length === 0) {
        return { ctl: 0, atl: 0, tsb: 0, label: 'No Data', color: '#64748B' };
      }
      const latest = data[data.length - 1];
      let label = 'Optimal Building';
      let color = '#10B981'; // Green

      if (latest.form > 15) {
        label = 'Fresh / Transition';
        color = '#3B82F6'; // Blue
      } else if (latest.form < -30) {
        label = 'High Risk / Overreaching';
        color = '#EF4444'; // Red
      } else if (latest.form < -10) {
        label = 'Optimal / Building';
        color = '#10B981'; // Green
      } else {
        label = 'Maintenance / Neutral';
        color = '#F59E0B'; // Amber
      }

      return {
        ctl: latest.fitness,
        atl: latest.fatigue,
        tsb: latest.form,
        label,
        color,
      };
    },

    cumulativeProgress(): { years: number[]; seriesByYear: Record<number, number[]> } {
      return computeCumulativeYearData(this.filteredActivities, this.unitSystem);
    },

    yearStats(): YearStats[] {
      return computeYearStats(this.filteredActivities, this.unitSystem);
    },

    heartRateZones(): HeartRateZone[] {
      return computeHeartRateZones(this.filteredActivities, this.maxHeartRate);
    },

    gearSummaries(): GearSummary[] {
      return computeGearSummaries(this.activities, this.unitSystem);
    },

    personalRecords(): PersonalRecord[] {
      return computePersonalRecords(this.activities, this.unitSystem);
    },
  },

  actions: {
    async init() {
      try {
        const storedActs = await get<NormalizedActivity[]>(DB_ACTIVITIES_KEY);
        const storedRoutes = await get<Record<string, [number, number][]>>(DB_ROUTES_KEY);
        const storedSettings = await get<any>(DB_SETTINGS_KEY);

        if (storedSettings) {
          if (storedSettings.unitSystem) this.unitSystem = storedSettings.unitSystem;
          if (storedSettings.maxHeartRate) this.maxHeartRate = storedSettings.maxHeartRate;
          if (storedSettings.ftp) this.ftp = storedSettings.ftp;
          if (storedSettings.annualDistanceGoal) this.annualDistanceGoal = storedSettings.annualDistanceGoal;
        }

        if (storedActs && Array.isArray(storedActs) && storedActs.length > 0) {
          // Re-hydrate Date instances
          this.activities = storedActs.map((a) => ({
            ...a,
            date: new Date(a.date),
          }));
          if (storedRoutes) {
            this.routeCoordinates = storedRoutes;
          }
        }
      } catch (err) {
        console.error('Failed to restore from IndexedDB:', err);
      }
    },

    async saveSettings() {
      try {
        await set(DB_SETTINGS_KEY, {
          unitSystem: this.unitSystem,
          maxHeartRate: this.maxHeartRate,
          ftp: this.ftp,
          annualDistanceGoal: this.annualDistanceGoal,
        });
      } catch (err) {
        console.warn('Could not save settings to IndexedDB:', err);
      }
    },

    async loadFile(file: File) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await parseStravaFile(file);
        this.activities = result.activities;
        if (result.routeCoordinates) {
          this.routeCoordinates = result.routeCoordinates;
        }
        try {
          await set(DB_ACTIVITIES_KEY, toCloneable(result.activities));
          await set(DB_ROUTES_KEY, toCloneable(result.routeCoordinates || {}));
        } catch (idbErr) {
          console.warn('Could not cache to IndexedDB:', idbErr);
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to process file.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async loadDemoData() {
      this.isLoading = true;
      this.error = null;
      try {
        // Fetch generated sample activities CSV
        const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
        const res = await fetch(`${baseUrl}sample_data/activities.csv`);
        if (!res.ok) {
          throw new Error('Could not load sample_data/activities.csv. Please ensure it is present in public/sample_data.');
        }
        const csvText = await res.text();
        const activities = await parseCsvText(csvText);
        this.activities = activities;
        
        // Add sample route coordinates
        const demoRoutes: Record<string, [number, number][]> = {
          'sample_run': [
            [37.7749, -122.4194],
            [37.7755, -122.4182],
            [37.7768, -122.4168],
            [37.7782, -122.4150],
            [37.7795, -122.4132],
            [37.7810, -122.4110],
            [37.7830, -122.4080],
            [37.7850, -122.4050],
            [37.7840, -122.4020],
            [37.7800, -122.4050],
            [37.7760, -122.4100],
            [37.7749, -122.4194]
          ]
        };
        this.routeCoordinates = demoRoutes;

        try {
          await set(DB_ACTIVITIES_KEY, toCloneable(activities));
          await set(DB_ROUTES_KEY, toCloneable(demoRoutes));
        } catch (idbErr) {
          console.warn('Could not cache to IndexedDB:', idbErr);
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to load demo dataset.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async clearData() {
      this.activities = [];
      this.routeCoordinates = {};
      try {
        await del(DB_ACTIVITIES_KEY);
        await del(DB_ROUTES_KEY);
      } catch (err) {
        console.warn('Could not clear IndexedDB:', err);
      }
    },

    setSportFilter(sport: SportFilter) {
      this.sportFilter = sport;
    },

    toggleUnitSystem() {
      this.unitSystem = this.unitSystem === 'metric' ? 'imperial' : 'metric';
      this.saveSettings();
    },

    setActiveTab(tab: ActiveTab) {
      this.activeTab = tab;
    },

    setSelectedActivity(activity: NormalizedActivity | null) {
      this.selectedActivity = activity;
    },
  },
});
