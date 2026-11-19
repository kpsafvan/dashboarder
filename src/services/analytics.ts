import type {
  NormalizedActivity,
  FitnessDataPoint,
  YearStats,
  HeartRateZone,
  GearSummary,
  PersonalRecord,
  UnitSystem,
} from '../types/strava';

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Banister Impulse-Response Fitness & Freshness Model
 * Time constants: Fitness (CTL) = 42 days, Fatigue (ATL) = 7 days.
 * Form (TSB) = CTL - ATL
 */
export function computeBanisterFitnessModel(
  activities: NormalizedActivity[],
  maxHr = 190,
  ftp = 250
): FitnessDataPoint[] {
  if (activities.length === 0) return [];

  // Group daily stress
  const dailyStress: Record<string, { stress: number; effortSum: number; count: number }> = {};

  const firstDate = new Date(activities[0].date);
  const lastDate = new Date(activities[activities.length - 1].date);
  
  // Normalize dates to midnight
  firstDate.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);

  // Calculate stress for each activity
  for (const act of activities) {
    const key = toLocalDateKey(act.date);
    if (!dailyStress[key]) {
      dailyStress[key] = { stress: 0, effortSum: 0, count: 0 };
    }

    let stress = 0;
    // 1. If Strava relative effort is present, use it as baseline
    if (act.relativeEffort && act.relativeEffort > 0) {
      stress = act.relativeEffort;
    } 
    // 2. Cycling Power TSS: (t * NP * IF) / (FTP * 3600) * 100
    else if (act.weightedWatts && act.weightedWatts > 0 && act.movingTimeSec > 0) {
      const np = act.weightedWatts;
      const ifactor = np / ftp;
      stress = ((act.movingTimeSec * np * ifactor) / (ftp * 3600)) * 100;
    } 
    // 3. Heart Rate TRIMP: based on Morton / Banister model
    else if (act.avgHeartRate && act.avgHeartRate > 60 && act.movingTimeSec > 0) {
      const hrRatio = Math.min(1.0, Math.max(0.4, (act.avgHeartRate - 50) / (maxHr - 50)));
      const minutes = act.movingTimeSec / 60;
      stress = minutes * hrRatio * 0.64 * Math.exp(1.92 * hrRatio);
    } 
    // 4. Fallback based on moving duration & sport intensity
    else if (act.movingTimeSec > 0) {
      const minutes = act.movingTimeSec / 60;
      const factor = act.sport === 'Run' ? 1.0 : (act.sport === 'Ride' ? 0.6 : (act.sport === 'Workout' ? 0.75 : 0.4));
      stress = minutes * factor;
    }

    dailyStress[key].stress += Math.round(stress);
    dailyStress[key].effortSum += (act.relativeEffort || Math.round(stress));
    dailyStress[key].count++;
  }

  // Iterate day by day from firstDate to lastDate
  const result: FitnessDataPoint[] = [];
  let ctl = 0;
  let atl = 0;

  const ctlDecay = 1 - Math.exp(-1 / 42);
  const atlDecay = 1 - Math.exp(-1 / 7);

  const cur = new Date(firstDate);
  while (cur <= lastDate) {
    const dateKey = toLocalDateKey(cur);
    const dayData = dailyStress[dateKey] || { stress: 0, effortSum: 0, count: 0 };

    ctl = ctl + (dayData.stress - ctl) * ctlDecay;
    atl = atl + (dayData.stress - atl) * atlDecay;
    const tsb = ctl - atl;

    // Day of year
    const startYear = new Date(cur.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((cur.getTime() - startYear.getTime()) / (1000 * 60 * 60 * 24));

    result.push({
      date: dateKey,
      dayOfYear,
      fitness: parseFloat(ctl.toFixed(1)),
      fatigue: parseFloat(atl.toFixed(1)),
      form: parseFloat(tsb.toFixed(1)),
      stress: dayData.stress,
      relativeEffortSum: dayData.effortSum,
    });

    cur.setDate(cur.getDate() + 1);
  }

  return result;
}

/**
 * Cumulative progression per year (Day 1 to 365/366)
 */
export function computeCumulativeYearData(
  activities: NormalizedActivity[],
  unit: UnitSystem = 'metric'
): { years: number[]; seriesByYear: Record<number, number[]> } {
  const years = Array.from(new Set(activities.map(a => a.year))).sort((a, b) => a - b);
  const seriesByYear: Record<number, number[]> = {};

  for (const y of years) {
    seriesByYear[y] = new Array(366).fill(0);
  }

  // Group activities by year and dayOfYear
  for (const act of activities) {
    const dayIdx = Math.min(365, Math.max(0, act.dayOfYear - 1));
    const dist = unit === 'metric' ? act.distanceKm : act.distanceMiles;
    if (seriesByYear[act.year]) {
      seriesByYear[act.year][dayIdx] += dist;
    }
  }

  // Calculate cumulative running sum for each year
  for (const y of years) {
    let running = 0;
    const arr = seriesByYear[y];
    for (let i = 0; i < arr.length; i++) {
      running += arr[i];
      arr[i] = parseFloat(running.toFixed(1));
    }
  }

  return { years, seriesByYear };
}

/**
 * Compute master Year-over-Year statistics
 */
export function computeYearStats(
  activities: NormalizedActivity[],
  unit: UnitSystem = 'metric'
): YearStats[] {
  const grouped: Record<number, NormalizedActivity[]> = {};

  for (const act of activities) {
    if (!grouped[act.year]) grouped[act.year] = [];
    grouped[act.year].push(act);
  }

  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  return years.map(year => {
    const acts = grouped[year];
    const totalActivities = acts.length;
    const totalDistanceKm = acts.reduce((acc, a) => acc + a.distanceKm, 0);
    const totalDistanceMiles = acts.reduce((acc, a) => acc + a.distanceMiles, 0);
    const totalElevationM = acts.reduce((acc, a) => acc + a.elevationGainM, 0);
    const totalElevationFt = acts.reduce((acc, a) => acc + a.elevationGainFt, 0);
    const totalMovingTimeSec = acts.reduce((acc, a) => acc + a.movingTimeSec, 0);

    // Approximate calories (Running ~ 65 kcal/km, Cycling ~ 25 kcal/km)
    const totalCaloriesKcal = Math.round(
      acts.reduce((acc, a) => {
        if (a.kilojoules) return acc + a.kilojoules;
        const rate = a.sport === 'Run' ? 65 : (a.sport === 'Ride' ? 28 : 40);
        return acc + a.distanceKm * rate;
      }, 0)
    );

    // Average Pace in min/km for runs
    const runActs = acts.filter(a => a.sport === 'Run' && a.distanceKm > 0 && a.movingTimeSec > 0);
    const totalRunDist = runActs.reduce((acc, a) => acc + a.distanceKm, 0);
    const totalRunTime = runActs.reduce((acc, a) => acc + a.movingTimeSec, 0);
    const avgPaceMinKm = totalRunDist > 0 ? (totalRunTime / 60) / totalRunDist : 0;

    // Average Speed in km/h for rides
    const rideActs = acts.filter(a => a.sport === 'Ride' && a.distanceKm > 0 && a.movingTimeSec > 0);
    const totalRideDist = rideActs.reduce((acc, a) => acc + a.distanceKm, 0);
    const totalRideTime = rideActs.reduce((acc, a) => acc + a.movingTimeSec, 0);
    const avgSpeedKmh = totalRideTime > 0 ? (totalRideDist / (totalRideTime / 3600)) : 0;

    // Heart Rate
    const hrActs = acts.filter(a => a.avgHeartRate !== null && a.avgHeartRate > 0);
    const avgHeartRate = hrActs.length > 0
      ? Math.round(hrActs.reduce((acc, a) => acc + (a.avgHeartRate || 0), 0) / hrActs.length)
      : null;

    return {
      year,
      totalActivities,
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(1)),
      totalDistanceMiles: parseFloat(totalDistanceMiles.toFixed(1)),
      totalElevationM,
      totalElevationFt,
      totalMovingTimeSec,
      totalCaloriesKcal,
      avgPaceMinKm: parseFloat(avgPaceMinKm.toFixed(2)),
      avgSpeedKmh: parseFloat(avgSpeedKmh.toFixed(1)),
      avgHeartRate,
    };
  });
}

/**
 * Compute Heart Rate Zone Breakdown
 */
export function computeHeartRateZones(
  activities: NormalizedActivity[],
  maxHr = 190
): HeartRateZone[] {
  const zones = [
    { zone: 'Z1', label: 'Active Recovery', min: 0.50, max: 0.60, color: '#3B82F6' },
    { zone: 'Z2', label: 'Aerobic Endurance', min: 0.60, max: 0.70, color: '#10B981' },
    { zone: 'Z3', label: 'Tempo', min: 0.70, max: 0.80, color: '#F59E0B' },
    { zone: 'Z4', label: 'Threshold', min: 0.80, max: 0.90, color: '#F97316' },
    { zone: 'Z5', label: 'Anaerobic / VO2 Max', min: 0.90, max: 1.05, color: '#EF4444' },
  ];

  const zoneMinutes = [0, 0, 0, 0, 0];
  let totalHrMinutes = 0;

  for (const act of activities) {
    if (!act.avgHeartRate || act.movingTimeSec <= 0) continue;
    const durationMin = act.movingTimeSec / 60;
    const hr = act.avgHeartRate;
    const ratio = hr / maxHr;

    totalHrMinutes += durationMin;

    if (ratio < 0.60) zoneMinutes[0] += durationMin;
    else if (ratio < 0.70) zoneMinutes[1] += durationMin;
    else if (ratio < 0.80) zoneMinutes[2] += durationMin;
    else if (ratio < 0.90) zoneMinutes[3] += durationMin;
    else zoneMinutes[4] += durationMin;
  }

  return zones.map((z, idx) => {
    const mins = Math.round(zoneMinutes[idx]);
    const percentage = totalHrMinutes > 0 ? parseFloat(((mins / totalHrMinutes) * 100).toFixed(1)) : 0;
    return {
      zone: z.zone,
      label: z.label,
      minBpm: Math.round(z.min * maxHr),
      maxBpm: Math.round(z.max * maxHr),
      timeMinutes: mins,
      percentage,
      color: z.color,
    };
  });
}

/**
 * Compute Gear summaries and wear percentage
 */
export function computeGearSummaries(
  activities: NormalizedActivity[],
  unit: UnitSystem = 'metric'
): GearSummary[] {
  const map: Record<string, {
    acts: NormalizedActivity[];
    sport: NormalizedActivity['sport'];
  }> = {};

  for (const act of activities) {
    if (!act.gear) continue;
    if (!map[act.gear]) {
      map[act.gear] = { acts: [], sport: act.sport };
    }
    map[act.gear].acts.push(act);
  }

  const summaries: GearSummary[] = [];

  for (const [name, data] of Object.entries(map)) {
    const totalKm = data.acts.reduce((acc, a) => acc + a.distanceKm, 0);
    const totalMiles = totalKm * 0.621371;

    // Target wear lifespan: 750 km for shoes, 8,000 km for bikes
    const targetKm = data.sport === 'Run' || data.sport === 'Walk' ? 750 : 8000;
    const percentageUsed = Math.min(150, Math.round((totalKm / targetKm) * 100));

    data.acts.sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstUsed = data.acts[0].date;
    const lastUsed = data.acts[data.acts.length - 1].date;

    let status: 'healthy' | 'warning' | 'retire' = 'healthy';
    if (percentageUsed >= 100) status = 'retire';
    else if (percentageUsed >= 75) status = 'warning';

    summaries.push({
      name,
      sport: data.sport,
      totalDistanceKm: parseFloat(totalKm.toFixed(1)),
      totalDistanceMiles: parseFloat(totalMiles.toFixed(1)),
      targetDistanceKm: targetKm,
      percentageUsed,
      activityCount: data.acts.length,
      firstUsed,
      lastUsed,
      status,
    });
  }

  // Sort by highest distance first
  return summaries.sort((a, b) => b.totalDistanceKm - a.totalDistanceKm);
}

/**
 * Compute Personal Records (PRs) & Hall of Fame
 */
export function computePersonalRecords(
  activities: NormalizedActivity[],
  unit: UnitSystem = 'metric'
): PersonalRecord[] {
  const prs: PersonalRecord[] = [];

  const runs = activities.filter(a => a.sport === 'Run');
  const rides = activities.filter(a => a.sport === 'Ride');

  // 1. Longest Run
  if (runs.length > 0) {
    const longestRun = [...runs].sort((a, b) => b.distanceKm - a.distanceKm)[0];
    prs.push({
      id: 'longest_run',
      label: 'Longest Run',
      sport: 'Run',
      activityTitle: longestRun.title,
      date: longestRun.dateString,
      value: unit === 'metric' ? `${longestRun.distanceKm} km` : `${longestRun.distanceMiles} mi`,
      numericValue: longestRun.distanceKm,
    });
  }

  // 2. Longest Ride
  if (rides.length > 0) {
    const longestRide = [...rides].sort((a, b) => b.distanceKm - a.distanceKm)[0];
    prs.push({
      id: 'longest_ride',
      label: 'Longest Ride',
      sport: 'Ride',
      activityTitle: longestRide.title,
      date: longestRide.dateString,
      value: unit === 'metric' ? `${longestRide.distanceKm} km` : `${longestRide.distanceMiles} mi`,
      numericValue: longestRide.distanceKm,
    });
  }

  // 3. Fastest 5K / 10K / Half Marathon (based on activities with distance >= target)
  const distConfigs = [
    { label: 'Fastest 5K Run', minKm: 4.95, maxKm: 6.5 },
    { label: 'Fastest 10K Run', minKm: 9.8, maxKm: 12.0 },
    { label: 'Fastest Half Marathon', minKm: 20.8, maxKm: 23.0 },
  ];

  for (const cfg of distConfigs) {
    const matching = runs.filter(a => a.distanceKm >= cfg.minKm && a.distanceKm <= cfg.maxKm && a.paceMinPerKm > 2.5);
    if (matching.length > 0) {
      const fastest = [...matching].sort((a, b) => a.paceMinPerKm - b.paceMinPerKm)[0];
      const min = Math.floor(fastest.paceMinPerKm);
      const sec = Math.round((fastest.paceMinPerKm - min) * 60);
      const paceStr = `${min}:${sec < 10 ? '0' : ''}${sec} /km`;
      prs.push({
        id: cfg.label.toLowerCase().replace(/\s+/g, '_'),
        label: cfg.label,
        sport: 'Run',
        activityTitle: fastest.title,
        date: fastest.dateString,
        value: paceStr,
        numericValue: fastest.paceMinPerKm,
      });
    }
  }

  // 4. Highest Single-Day Climbing
  if (activities.length > 0) {
    const biggestClimb = [...activities].sort((a, b) => b.elevationGainM - a.elevationGainM)[0];
    prs.push({
      id: 'biggest_climb',
      label: 'Biggest Climb',
      sport: biggestClimb.sport,
      activityTitle: biggestClimb.title,
      date: biggestClimb.dateString,
      value: unit === 'metric' ? `${biggestClimb.elevationGainM} m` : `${biggestClimb.elevationGainFt} ft`,
      numericValue: biggestClimb.elevationGainM,
    });
  }

  // 5. Peak Power (Cycling)
  const powerActs = rides.filter(a => a.maxWatts !== null && a.maxWatts > 0);
  if (powerActs.length > 0) {
    const peakWatts = [...powerActs].sort((a, b) => (b.maxWatts || 0) - (a.maxWatts || 0))[0];
    prs.push({
      id: 'peak_watts',
      label: 'Peak Power',
      sport: 'Ride',
      activityTitle: peakWatts.title,
      date: peakWatts.dateString,
      value: `${peakWatts.maxWatts} W`,
      numericValue: peakWatts.maxWatts || 0,
    });
  }

  return prs;
}

/**
 * Format seconds to HH:MM:SS or HHh MMm
 */
export function formatDuration(seconds: number, compact = false): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (compact) {
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  }

  const hStr = hrs > 0 ? `${hrs}:` : '';
  const mStr = hrs > 0 ? (mins < 10 ? `0${mins}:` : `${mins}:`) : `${mins}:`;
  const sStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${hStr}${mStr}${sStr}`;
}

/**
 * Format pace in min/km or min/mi
 */
export function formatPace(decimalMinutes: number, unit: UnitSystem = 'metric'): string {
  if (!decimalMinutes || isNaN(decimalMinutes) || decimalMinutes <= 0 || decimalMinutes > 30) {
    return '--:--';
  }
  const min = Math.floor(decimalMinutes);
  const sec = Math.round((decimalMinutes - min) * 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec} /${unit === 'metric' ? 'km' : 'mi'}`;
}
