const fs = require('fs');
const path = require('path');

// Target output path
const outCsvPath = path.join(__dirname, '..', 'sample_data', 'activities.csv');

const sports = [
  { type: 'Run', weight: 0.55 },
  { type: 'Ride', weight: 0.30 },
  { type: 'Walk', weight: 0.08 },
  { type: 'Hike', weight: 0.04 },
  { type: 'Swim', weight: 0.03 }
];

const shoes = [
  { name: 'Nike Pegasus 40', targetKm: 750, startYear: 2024, endYear: 2025 },
  { name: 'Saucony Endorphin Pro 3', targetKm: 500, startYear: 2024, endYear: 2026 },
  { name: 'Asics Gel-Kayano 30', targetKm: 800, startYear: 2025, endYear: 2026 }
];

const bikes = [
  { name: 'Canyon Ultimate CF SLX', targetKm: 10000 },
  { name: 'Trek Checkpoint ALR 5', targetKm: 6000 }
];

const runTitles = [
  'Morning Easy Run', 'Intervals 6x1000m', 'Sunday Long Run', 'Lunchtime Shakeout',
  'Threshold 2x20min', 'Recovery Jog', 'Parkrun 5K', 'Half Marathon Pace Test',
  'Hilly Trail Exploration', 'Evening Progression Run'
];

const rideTitles = [
  'Morning Coffee Ride', 'Endurance 80K Solo', 'Group Ride with the Squad',
  'Sweetspot Intervals 3x15m', 'Hilly Century Ride', 'Zone 2 Base Miles',
  'Quick Post-Work Spin', 'Gran Fondo Simulation'
];

const walkTitles = ['Evening Sunset Walk', 'Active Recovery Walk', 'Dog Walk in the Park'];
const hikeTitles = ['Mountain Summit Hike', 'Forest Ridge Trail', 'Scenic Weekend Trek'];
const swimTitles = ['Morning Pool Laps 2000m', 'Open Water Swim Session', 'Drills & Aerobic Swim'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

function formatDate(date) {
  // Format like Strava: "Jan 14, 2024, 7:15:30 AM" or ISO
  const options = {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

const headers = [
  'Activity ID', 'Activity Date', 'Activity Name', 'Activity Type', 'Activity Description',
  'Elapsed Time', 'Moving Time', 'Distance', 'Max Speed', 'Average Speed',
  'Elevation Gain', 'Elevation Loss', 'Elevation Low', 'Elevation High', 'Max Grade',
  'Average Grade', 'Average Heart Rate', 'Max Heart Rate', 'Average Cadence', 'Max Cadence',
  'Average Watts', 'Max Watts', 'Weighted Average Power', 'Kilojoules', 'Relative Effort',
  'Commute', 'Activity Gear', 'Filename', 'Athlete Weight', 'Bike Weight'
];

const rows = [];
let activityId = 10450000000;

// Start from Jan 1, 2024 up to Nov 16, 2026
const startDate = new Date(2024, 0, 1);
const endDate = new Date(2026, 10, 16);

let currentDate = new Date(startDate);

while (currentDate <= endDate) {
  // Determine if workout occurs today (4 to 5 days active per week on average)
  const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Sat
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  const workoutChance = isWeekend ? 0.85 : 0.65;

  if (Math.random() < workoutChance) {
    // Pick sport
    const rand = Math.random();
    let sport = 'Run';
    let cumulativeWeight = 0;
    for (const s of sports) {
      cumulativeWeight += s.weight;
      if (rand <= cumulativeWeight) {
        sport = s.type;
        break;
      }
    }

    // Seasonality multiplier: higher volume in summer/autumn
    const month = currentDate.getMonth(); // 0 - 11
    const seasonFactor = (month >= 4 && month <= 9) ? 1.25 : 0.95;

    let title = '';
    let distanceMeters = 0;
    let movingTimeSec = 0;
    let elapsedTimeSec = 0;
    let avgSpeedMs = 0;
    let maxSpeedMs = 0;
    let elevGainM = 0;
    let avgHr = 0;
    let maxHr = 0;
    let avgWatts = '';
    let maxWatts = '';
    let weightedWatts = '';
    let kilojoules = '';
    let avgCadence = '';
    let maxCadence = '';
    let relEffort = '';
    let gear = '';
    let isCommute = (sport === 'Ride' || sport === 'Run') && (dayOfWeek >= 1 && dayOfWeek <= 5) && (Math.random() < 0.12);

    const year = currentDate.getFullYear();

    if (sport === 'Run') {
      title = runTitles[getRandomInt(0, runTitles.length - 1)];
      const isLongRun = isWeekend && Math.random() < 0.55;
      const isSpeedwork = !isWeekend && (title.includes('Intervals') || title.includes('Threshold') || title.includes('5K'));

      const distanceKm = isLongRun ? getRandomFloat(16, 28) : (isSpeedwork ? getRandomFloat(8, 14) : getRandomFloat(5, 12));
      distanceMeters = Math.round(distanceKm * 1000 * seasonFactor);

      // Pace min/km: 4.2 to 5.8
      const paceMinPerKm = isSpeedwork ? getRandomFloat(4.1, 4.7) : (isLongRun ? getRandomFloat(5.0, 5.5) : getRandomFloat(5.1, 5.9));
      movingTimeSec = Math.round((distanceMeters / 1000) * paceMinPerKm * 60);
      elapsedTimeSec = movingTimeSec + getRandomInt(30, 240);

      avgSpeedMs = parseFloat((distanceMeters / movingTimeSec).toFixed(2));
      maxSpeedMs = parseFloat((avgSpeedMs * getRandomFloat(1.2, 1.45)).toFixed(2));

      elevGainM = Math.round((distanceMeters / 1000) * getRandomFloat(4, 18));
      avgHr = isSpeedwork ? getRandomInt(162, 178) : (isLongRun ? getRandomInt(148, 162) : getRandomInt(136, 152));
      maxHr = avgHr + getRandomInt(12, 22);

      avgCadence = getRandomInt(164, 178);
      maxCadence = avgCadence + getRandomInt(8, 16);

      // Relative effort estimation (Strava style)
      relEffort = Math.round((movingTimeSec / 60) * (avgHr / 150) ** 2 * 0.85);

      // Assign shoe based on year & type
      if (isSpeedwork) {
        gear = 'Saucony Endorphin Pro 3';
      } else if (year >= 2025) {
        gear = Math.random() < 0.65 ? 'Asics Gel-Kayano 30' : 'Nike Pegasus 40';
      } else {
        gear = 'Nike Pegasus 40';
      }
    } else if (sport === 'Ride') {
      title = rideTitles[getRandomInt(0, rideTitles.length - 1)];
      const isLongRide = isWeekend && Math.random() < 0.6;
      const distanceKm = isLongRide ? getRandomFloat(60, 110) : getRandomFloat(25, 55);
      distanceMeters = Math.round(distanceKm * 1000 * seasonFactor);

      // Speed 26 to 34 km/h
      const speedKmh = getRandomFloat(26.5, 33.5);
      avgSpeedMs = parseFloat((speedKmh / 3.6).toFixed(2));
      movingTimeSec = Math.round(distanceMeters / avgSpeedMs);
      elapsedTimeSec = movingTimeSec + getRandomInt(120, 900);
      maxSpeedMs = parseFloat((avgSpeedMs * getRandomFloat(1.4, 1.8)).toFixed(2));

      elevGainM = Math.round((distanceMeters / 1000) * getRandomFloat(8, 26));
      avgHr = getRandomInt(132, 160);
      maxHr = avgHr + getRandomInt(15, 30);

      avgWatts = getRandomInt(180, 245);
      maxWatts = avgWatts + getRandomInt(250, 550);
      weightedWatts = Math.round(avgWatts * getRandomFloat(1.08, 1.18));
      kilojoules = Math.round((avgWatts * movingTimeSec) / 1000);

      avgCadence = getRandomInt(80, 92);
      maxCadence = avgCadence + getRandomInt(18, 28);

      relEffort = Math.round((movingTimeSec / 60) * (avgHr / 140) ** 1.8 * 0.7);

      gear = Math.random() < 0.7 ? 'Canyon Ultimate CF SLX' : 'Trek Checkpoint ALR 5';
    } else if (sport === 'Walk') {
      title = walkTitles[getRandomInt(0, walkTitles.length - 1)];
      const distanceKm = getRandomFloat(3, 7);
      distanceMeters = Math.round(distanceKm * 1000);
      avgSpeedMs = getRandomFloat(1.2, 1.45);
      movingTimeSec = Math.round(distanceMeters / avgSpeedMs);
      elapsedTimeSec = movingTimeSec + getRandomInt(60, 300);
      maxSpeedMs = parseFloat((avgSpeedMs * 1.25).toFixed(2));
      elevGainM = getRandomInt(10, 60);
      avgHr = getRandomInt(95, 115);
      maxHr = avgHr + getRandomInt(10, 20);
      relEffort = getRandomInt(5, 18);
      gear = 'Asics Gel-Kayano 30';
    } else if (sport === 'Hike') {
      title = hikeTitles[getRandomInt(0, hikeTitles.length - 1)];
      const distanceKm = getRandomFloat(8, 16);
      distanceMeters = Math.round(distanceKm * 1000);
      avgSpeedMs = getRandomFloat(0.9, 1.25);
      movingTimeSec = Math.round(distanceMeters / avgSpeedMs);
      elapsedTimeSec = movingTimeSec + getRandomInt(600, 2400);
      maxSpeedMs = parseFloat((avgSpeedMs * 1.35).toFixed(2));
      elevGainM = getRandomInt(450, 1100);
      avgHr = getRandomInt(115, 138);
      maxHr = avgHr + getRandomInt(15, 25);
      relEffort = getRandomInt(40, 95);
    } else if (sport === 'Swim') {
      title = swimTitles[getRandomInt(0, swimTitles.length - 1)];
      const distanceKm = getRandomFloat(1.5, 3.2);
      distanceMeters = Math.round(distanceKm * 1000);
      avgSpeedMs = getRandomFloat(0.95, 1.2);
      movingTimeSec = Math.round(distanceMeters / avgSpeedMs);
      elapsedTimeSec = movingTimeSec + getRandomInt(180, 600);
      maxSpeedMs = parseFloat((avgSpeedMs * 1.15).toFixed(2));
      elevGainM = 0;
      avgHr = getRandomInt(128, 155);
      maxHr = avgHr + getRandomInt(15, 25);
      relEffort = getRandomInt(25, 60);
    }

    // Set time of day
    const hour = isWeekend ? getRandomInt(7, 10) : (Math.random() < 0.65 ? getRandomInt(6, 8) : getRandomInt(17, 19));
    const minute = getRandomInt(0, 59);
    const activityDate = new Date(currentDate);
    activityDate.setHours(hour, minute, getRandomInt(0, 59));

    activityId += getRandomInt(1000, 80000);
    const filename = `activities/${activityId}.gpx.gz`;

    const row = [
      activityId,
      formatDate(activityDate),
      `"${title}"`,
      sport,
      `""`,
      elapsedTimeSec,
      movingTimeSec,
      distanceMeters,
      maxSpeedMs,
      avgSpeedMs,
      elevGainM,
      elevGainM, // elevation loss
      getRandomInt(20, 80), // elevation low
      getRandomInt(100, 1200), // elevation high
      getRandomFloat(3.0, 14.0),
      getRandomFloat(0.5, 3.5),
      avgHr,
      maxHr,
      avgCadence,
      maxCadence,
      avgWatts,
      maxWatts,
      weightedWatts,
      kilojoules,
      relEffort,
      isCommute ? 'true' : 'false',
      gear ? `"${gear}"` : '',
      filename,
      72.5, // athlete weight in kg
      sport === 'Ride' ? 8.2 : '' // bike weight
    ];

    rows.push(row.join(','));
  }

  // Advance by 1 day
  currentDate.setDate(currentDate.getDate() + 1);
}

const csvContent = headers.join(',') + '\n' + rows.join('\n');
fs.writeFileSync(outCsvPath, csvContent, 'utf8');

console.log(`Generated ${rows.length} sample activities in ${outCsvPath}`);
