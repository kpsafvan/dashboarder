export type SportType = 'Run' | 'Ride' | 'Swim' | 'Walk' | 'Hike' | 'Workout' | 'Other';
export type SportFilter = 'All' | 'Run' | 'Ride' | 'Workout' | 'Walk' | 'Hike' | 'Swim' | 'Other';
export type UnitSystem = 'metric' | 'imperial';
export type DateRangeFilter = 'this_year' | 'last_year' | 'lifetime' | 'last_90' | 'last_30' | 'custom';
export type ActiveTab = 'this_year' | 'lifetime' | 'fitness' | 'gear' | 'routes' | 'explorer';

export interface NormalizedActivity {
  id: string;
  date: Date;
  dateString: string;
  year: number;
  month: number; // 0-11
  dayOfYear: number; // 1-366
  dayOfWeek: number; // 0-6
  title: string;
  sport: SportType;
  description: string;
  
  // Distances & Times
  distanceMeters: number;
  distanceKm: number;
  distanceMiles: number;
  movingTimeSec: number;
  elapsedTimeSec: number;
  
  // Elevation
  elevationGainM: number;
  elevationGainFt: number;
  elevationLossM: number;
  
  // Speed & Pace
  avgSpeedMs: number;
  maxSpeedMs: number;
  speedKmh: number;
  speedMph: number;
  paceMinPerKm: number; // in decimal minutes (e.g. 5.5 = 5:30)
  paceMinPerMile: number;
  
  // Cardiovascular, Power & Caloric
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgWatts: number | null;
  maxWatts: number | null;
  weightedWatts: number | null; // NP
  kilojoules: number | null;
  calories: number | null;
  avgCadence: number | null;
  relativeEffort: number | null; // TRIMP or Strava relative effort
  
  // Flags & Metadata
  isCommute: boolean;
  gear: string;
  filename: string;
  athleteWeightKg: number | null;
  bikeWeightKg: number | null;
  
  // Optional GPS Track coordinates (e.g. from GPX)
  coordinates?: [number, number][]; // [lat, lng]
}

export interface YearStats {
  year: number;
  totalActivities: number;
  totalDistanceKm: number;
  totalDistanceMiles: number;
  totalElevationM: number;
  totalElevationFt: number;
  totalMovingTimeSec: number;
  totalCaloriesKcal: number;
  avgPaceMinKm: number;
  avgSpeedKmh: number;
  avgHeartRate: number | null;
}

export interface FitnessDataPoint {
  date: string;
  dayOfYear: number;
  fitness: number; // CTL (42-day rolling)
  fatigue: number; // ATL (7-day rolling)
  form: number; // TSB = CTL - ATL
  stress: number; // TSS or TRIMP for the day
  relativeEffortSum: number;
}

export interface HeartRateZone {
  zone: string;
  label: string;
  minBpm: number;
  maxBpm: number;
  timeMinutes: number;
  percentage: number;
  color: string;
}

export interface GearSummary {
  name: string;
  sport: SportType;
  totalDistanceKm: number;
  totalDistanceMiles: number;
  targetDistanceKm: number;
  percentageUsed: number;
  activityCount: number;
  firstUsed: Date;
  lastUsed: Date;
  status: 'healthy' | 'warning' | 'retire';
}

export interface PersonalRecord {
  id: string;
  label: string;
  sport: SportType;
  activityTitle: string;
  date: string;
  value: string;
  numericValue: number;
}

export interface BestEffortItem {
  rank: number;
  activityId: string;
  activityTitle: string;
  sport: SportType;
  date: string;
  rawDate: Date;
  year: number;
  value: string;
  numericValue: number;
  secondaryLabel: string;
  secondaryValue: string;
  extraInfo?: string;
  activity: NormalizedActivity;
}

export interface BestEffortCategory {
  id: string;
  name: string;
  shortName: string;
  categoryGroup: 'running' | 'endurance' | 'workout' | 'intensity';
  sport: SportType | 'All';
  metricType: 'time' | 'distance' | 'elevation' | 'duration' | 'calories' | 'hr';
  benchmarkDistanceMeters?: number;
  unit: string;
  description: string;
  items: BestEffortItem[];
  prItem?: BestEffortItem;
  yearBests: { year: number; item: BestEffortItem }[];
}
