// This service simulates a big data analytics backend.
// It generates pseudo-random but deterministic data based on the district name.
// This ensures that for the same district, we always get the same data, but
// different districts will have different data, creating a realistic simulation.

// A simple hashing function to convert a string (district name) into a number.
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// A pseudo-random number generator that can be seeded.
const seededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export interface CropPerformance {
  name: string;
  yield: number; // in Tonnes per Hectare
  trend: 'up' | 'down';
}

export interface PestAlert {
  pest: string;
  crop: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface AnalyticsData {
  cropPerformance: CropPerformance[];
  pestAlerts: PestAlert[];
  recommendations: string[];
}

const ALL_CROPS = ["Paddy", "Coconut", "Rubber", "Banana", "Pepper", "Ginger"];
const ALL_PESTS = ["Leaf Spot", "Root Rot", "Stem Borer", "Mealybug", "Fruit Fly"];
const SEVERITIES: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

export const getDistrictAnalytics = (district: string): AnalyticsData => {
  const seed = simpleHash(district);
  const random = (offset: number) => seededRandom(seed + offset);

  // Generate Crop Performance data
  const cropPerformance: CropPerformance[] = ALL_CROPS.slice(0, 4).map((crop, i) => {
    const yieldValue = parseFloat((2.5 + random(i) * 2.5).toFixed(1)); // Yield between 2.5 and 5.0
    return {
      name: crop,
      yield: yieldValue,
      trend: random(i + 10) > 0.5 ? 'up' : 'down',
    };
  });

  // Generate Pest Alert data
  const pestAlerts: PestAlert[] = [];
  const usedPests = new Set<string>();
  for (let i = 0; i < 3; i++) {
    let pest = ALL_PESTS[Math.floor(random(i + 20) * ALL_PESTS.length)];
    // Ensure unique pests
    while(usedPests.has(pest)) {
        pest = ALL_PESTS[Math.floor(random(i + 20 + pest.length) * ALL_PESTS.length)];
    }
    usedPests.add(pest);

    const crop = ALL_CROPS[Math.floor(random(i + 30) * ALL_CROPS.length)];
    const severity = SEVERITIES[Math.floor(random(i + 40) * SEVERITIES.length)];
    pestAlerts.push({ pest, crop, severity });
  }

  // Generate dynamic recommendations based on the data
  const recommendations: string[] = [];
  const highAlert = pestAlerts.find(p => p.severity === 'High');
  if (highAlert) {
    recommendations.push(`High alert for ${highAlert.pest} on ${highAlert.crop} crops. Recommend immediate inspection.`);
  }

  const highYieldCrop = cropPerformance.reduce((prev, current) => (prev.yield > current.yield) ? prev : current);
  recommendations.push(`Favorable conditions for ${highYieldCrop.name} cultivation noted. Consider expanding.`);

  const lowYieldCrop = cropPerformance.find(c => c.trend === 'down');
  if (lowYieldCrop) {
    recommendations.push(`Monitor ${lowYieldCrop.name} crops closely for potential issues due to declining yield trends.`);
  } else {
    recommendations.push("Market prices are stable. Plan harvest and sales accordingly.")
  }

  return {
    cropPerformance,
    pestAlerts,
    recommendations,
  };
};
