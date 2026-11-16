import Papa from 'papaparse';
import JSZip from 'jszip';
import type { NormalizedActivity, SportType } from '../types/strava';

function cleanHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function parseSportType(rawType: string): SportType {
  const t = (rawType || '').toLowerCase().trim();
  if (t.includes('run')) return 'Run';
  if (t.includes('ride') || t.includes('cycle') || t.includes('bike')) return 'Ride';
  if (t.includes('swim')) return 'Swim';
  if (t.includes('walk')) return 'Walk';
  if (t.includes('hike')) return 'Hike';
  return 'Other';
}

function parseNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? fallback : num;
}

function parseNullableNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function normalizeRawRow(raw: Record<string, any>): NormalizedActivity | null {
  // Build a mapped lookup by cleaned header
  const map: Record<string, any> = {};
  for (const [key, val] of Object.entries(raw)) {
    map[cleanHeader(key)] = val;
  }

  const rawId = map['activityid'] || map['id'] || String(Math.random());
  const rawDateStr = map['activitydate'] || map['date'] || map['startdate'] || '';
  if (!rawDateStr) return null;

  const date = new Date(rawDateStr);
  if (isNaN(date.getTime())) return null;

  const title = map['activityname'] || map['name'] || map['title'] || 'Workout';
  const rawSport = map['activitytype'] || map['type'] || 'Other';
  const sport = parseSportType(rawSport);
  const description = map['activitydescription'] || map['description'] || '';

  const distanceMeters = parseNumber(map['distance']);
  const movingTimeSec = parseNumber(map['movingtime']);
  const elapsedTimeSec = parseNumber(map['elapsedtime']) || movingTimeSec;

  const elevationGainM = parseNumber(map['elevationgain'] || map['totalgrade']);
  const elevationLossM = parseNumber(map['elevationloss']);

  const avgSpeedMs = parseNumber(map['averagespeed'] || map['avgspeed']);
  const maxSpeedMs = parseNumber(map['maxspeed']);

  // Speed and Pace conversions
  const speedKmh = avgSpeedMs * 3.6;
  const speedMph = speedKmh * 0.621371;

  // Pace in min/km
  let paceMinPerKm = 0;
  if (avgSpeedMs > 0.1) {
    paceMinPerKm = 1000 / avgSpeedMs / 60;
  } else if (distanceMeters > 0 && movingTimeSec > 0) {
    paceMinPerKm = (movingTimeSec / 60) / (distanceMeters / 1000);
  }
  const paceMinPerMile = paceMinPerKm * 1.60934;

  const avgHeartRate = parseNullableNumber(map['averageheartrate'] || map['avghr'] || map['heartrate']);
  const maxHeartRate = parseNullableNumber(map['maxheartrate'] || map['maxhr']);

  const avgWatts = parseNullableNumber(map['averagewatts'] || map['avgwatts'] || map['watts']);
  const maxWatts = parseNullableNumber(map['maxwatts']);
  const weightedWatts = parseNullableNumber(map['weightedaveragepower'] || map['normalizedpower'] || map['weightedwatts']);
  const kilojoules = parseNullableNumber(map['kilojoules'] || map['work']);
  const avgCadence = parseNullableNumber(map['averagecadence'] || map['avgcadence'] || map['cadence']);
  const relativeEffort = parseNullableNumber(map['relativeeffort'] || map['effort'] || map['sufferscore'] || map['trimp']);

  const isCommute = String(map['commute'] || '').toLowerCase() === 'true';
  const gear = (map['activitygear'] || map['gear'] || '').trim();
  const filename = map['filename'] || '';
  const athleteWeightKg = parseNullableNumber(map['athleteweight']);
  const bikeWeightKg = parseNullableNumber(map['bikeweight']);

  return {
    id: String(rawId),
    date,
    dateString: date.toLocaleDateString(),
    year: date.getFullYear(),
    month: date.getMonth(),
    dayOfYear: getDayOfYear(date),
    dayOfWeek: date.getDay(),
    title,
    sport,
    description,
    distanceMeters,
    distanceKm: parseFloat((distanceMeters / 1000).toFixed(2)),
    distanceMiles: parseFloat((distanceMeters / 1609.34).toFixed(2)),
    movingTimeSec,
    elapsedTimeSec,
    elevationGainM: Math.round(elevationGainM),
    elevationGainFt: Math.round(elevationGainM * 3.28084),
    elevationLossM: Math.round(elevationLossM),
    avgSpeedMs,
    maxSpeedMs,
    speedKmh: parseFloat(speedKmh.toFixed(2)),
    speedMph: parseFloat(speedMph.toFixed(2)),
    paceMinPerKm: parseFloat(paceMinPerKm.toFixed(2)),
    paceMinPerMile: parseFloat(paceMinPerMile.toFixed(2)),
    avgHeartRate,
    maxHeartRate,
    avgWatts,
    maxWatts,
    weightedWatts,
    kilojoules,
    avgCadence,
    relativeEffort,
    isCommute,
    gear,
    filename,
    athleteWeightKg,
    bikeWeightKg,
  };
}

export function parseCsvText(csvText: string): Promise<NormalizedActivity[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const activities: NormalizedActivity[] = [];
        for (const row of results.data) {
          const item = normalizeRawRow(row);
          if (item) activities.push(item);
        }
        // Sort chronologically ascending
        activities.sort((a, b) => a.date.getTime() - b.date.getTime());
        resolve(activities);
      },
      error: (err: any) => {
        reject(err);
      }
    });
  });
}

export async function parseStravaFile(file: File): Promise<{ activities: NormalizedActivity[]; routeCoordinates?: Record<string, [number, number][]> }> {
  const fileName = file.name.toLowerCase();

  // If standard CSV
  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    const activities = await parseCsvText(text);
    return { activities };
  }

  // If ZIP archive
  if (fileName.endsWith('.zip')) {
    const zip = await JSZip.loadAsync(file);
    
    // Find activities.csv inside zip
    let csvFile: JSZip.JSZipObject | null = null;
    for (const relativePath in zip.files) {
      if (relativePath.toLowerCase().endsWith('activities.csv')) {
        csvFile = zip.files[relativePath];
        break;
      }
    }

    if (!csvFile) {
      throw new Error('Could not find activities.csv inside the uploaded ZIP archive.');
    }

    const csvText = await csvFile.async('text');
    const activities = await parseCsvText(csvText);

    // Extract sample GPX coordinates from up to 25 GPX files for route preview
    const routeCoordinates: Record<string, [number, number][]> = {};
    let parsedCount = 0;

    for (const relativePath in zip.files) {
      if (parsedCount >= 25) break;
      if (relativePath.toLowerCase().endsWith('.gpx') && !zip.files[relativePath].dir) {
        try {
          const gpxText = await zip.files[relativePath].async('text');
          const coords = parseGpxCoordinates(gpxText);
          if (coords.length > 0) {
            routeCoordinates[relativePath] = coords;
            parsedCount++;
          }
        } catch (e) {
          // Ignore individual gpx read errors
        }
      }
    }

    return { activities, routeCoordinates };
  }

  throw new Error('Unsupported file format. Please upload a Strava .csv or .zip file.');
}

export function parseGpxCoordinates(gpxXml: string): [number, number][] {
  const coords: [number, number][] = [];
  const regex = /<trkpt\s+[^>]*lat=["']([^"']+)["']\s+[^>]*lon=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(gpxXml)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      coords.push([lat, lon]);
    }
  }
  return coords;
}
