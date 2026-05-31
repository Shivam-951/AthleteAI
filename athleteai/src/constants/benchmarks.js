export const NATIONAL_BENCHMARKS = {
  '100m': {
    U16: { male: 11.8, female: 13.2 }, U18: { male: 11.2, female: 12.6 },
    U20: { male: 10.8, female: 12.0 }, Open: { male: 10.5, female: 11.6 },
  },
  '200m': { U20: { male: 22.0, female: 24.5 }, Open: { male: 21.0, female: 23.5 } },
  '400m': { U20: { male: 48.0, female: 54.0 }, Open: { male: 46.5, female: 52.0 } },
  '800m': { U20: { male: 112,  female: 128  }, Open: { male: 107,  female: 122  } },
  '5000m':{ U20: { male: 870,  female: 1020 }, Open: { male: 840,  female: 980  } },
}
export function getPercentile(event, ageGroup, gender, timeSeconds) {
  const bench = NATIONAL_BENCHMARKS[event]?.[ageGroup]?.[gender]
  if (!bench) return null
  const diff = bench - timeSeconds
  if (diff >= 0) return Math.min(99, Math.round(50 + (diff / bench) * 500))
  return Math.max(1, Math.round(50 + (diff / bench) * 500))
}
