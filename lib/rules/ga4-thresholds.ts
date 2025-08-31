export interface GA4Thresholds {
  bounceRate: {
    high: number;      // > 60% = hög bounce rate
    normal: {
      min: number;     // 40%
      max: number;     // 60%
    };
    suspicious: number; // < 25% = misstänkt låg
  };
  conversionRate: {
    low: number;       // < 2% = låg konvertering
    good: number;      // > 5% = bra konvertering
    excellent: number; // > 10% = excellent konvertering
  };
  sessionDuration: {
    short: number;     // < 30 sekunder = kort session
    good: number;      // > 2 minuter = bra session
    excellent: number; // > 5 minuter = excellent session
  };
  pageViews: {
    low: number;       // < 1.5 = låg page views per session
    good: number;      // > 2.5 = bra page views per session
    excellent: number; // > 4 = excellent page views per session
  };
  traffic: {
    significant: number; // > 100 sessioner = signifikant trafik
    high: number;        // > 1000 sessioner = hög trafik
  };
}

export const DEFAULT_GA4_THRESHOLDS: GA4Thresholds = {
  bounceRate: {
    high: 60,           // > 60% = hög bounce rate
    normal: {
      min: 40,          // 40-60% = normalt
      max: 60
    },
    suspicious: 25      // < 25% = misstänkt låg
  },
  conversionRate: {
    low: 2,             // < 2% = låg konvertering
    good: 5,            // > 5% = bra konvertering
    excellent: 10       // > 10% = excellent konvertering
  },
  sessionDuration: {
    short: 30,          // < 30 sekunder = kort session
    good: 120,          // > 2 minuter = bra session
    excellent: 300      // > 5 minuter = excellent session
  },
  pageViews: {
    low: 1.5,           // < 1.5 = låg page views per session
    good: 2.5,          // > 2.5 = bra page views per session
    excellent: 4        // > 4 = excellent page views per session
  },
  traffic: {
    significant: 100,   // > 100 sessioner = signifikant trafik
    high: 1000          // > 1000 sessioner = hög trafik
  }
};

export function getBounceRateAnalysis(bounceRate: number, thresholds: GA4Thresholds = DEFAULT_GA4_THRESHOLDS): {
  level: 'high' | 'normal' | 'suspicious';
  description: string;
  recommendation: string;
} {
  if (bounceRate > thresholds.bounceRate.high) {
    return {
      level: 'high',
      description: `Hög bounce rate på ${bounceRate.toFixed(1)}% (över ${thresholds.bounceRate.high}%)`,
      recommendation: 'Optimera innehållet och användarupplevelsen för att minska bounce rate'
    };
  } else if (bounceRate < thresholds.bounceRate.suspicious) {
    return {
      level: 'suspicious',
      description: `Misstänkt låg bounce rate på ${bounceRate.toFixed(1)}% (under ${thresholds.bounceRate.suspicious}%)`,
      recommendation: 'Kontrollera att spårningen fungerar korrekt - så låg bounce rate kan tyda på mätfel'
    };
  } else {
    return {
      level: 'normal',
      description: `Normal bounce rate på ${bounceRate.toFixed(1)}% (${thresholds.bounceRate.normal.min}-${thresholds.bounceRate.normal.max}%)`,
      recommendation: 'Bounce rate är inom normalt område, men kan fortfarande optimeras'
    };
  }
}

export function getConversionRateAnalysis(conversionRate: number, thresholds: GA4Thresholds = DEFAULT_GA4_THRESHOLDS): {
  level: 'low' | 'good' | 'excellent';
  description: string;
  recommendation: string;
} {
  if (conversionRate >= thresholds.conversionRate.excellent) {
    return {
      level: 'excellent',
      description: `Excellent konverteringsgrad på ${conversionRate.toFixed(1)}% (över ${thresholds.conversionRate.excellent}%)`,
      recommendation: 'Utmärkt prestanda! Fokusera på att skala upp framgångsrika kanaler'
    };
  } else if (conversionRate >= thresholds.conversionRate.good) {
    return {
      level: 'good',
      description: `Bra konverteringsgrad på ${conversionRate.toFixed(1)}% (${thresholds.conversionRate.good}-${thresholds.conversionRate.excellent}%)`,
      recommendation: 'Bra prestanda, men det finns fortfarande utrymme för förbättring'
    };
  } else {
    return {
      level: 'low',
      description: `Låg konverteringsgrad på ${conversionRate.toFixed(1)}% (under ${thresholds.conversionRate.good}%)`,
      recommendation: 'Fokusera på att förbättra konverteringsgraden genom optimering av landningssidor och användarupplevelse'
    };
  }
}
