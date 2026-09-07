/**
 * Constants for backtesting framework
 */

export const LEAGUE_CONFIGS: Record<string, { goalRate: number; homeAdvantage: number }> = {
    EPL: { goalRate: 1.02, homeAdvantage: 0.28 },
    LA_LIGA: { goalRate: 0.94, homeAdvantage: 0.32 },
    SERIE_A: { goalRate: 0.98, homeAdvantage: 0.25 },
    BUNDESLIGA: { goalRate: 1.05, homeAdvantage: 0.30 },
    LIGUE_1: { goalRate: 0.96, homeAdvantage: 0.26 }
};

export const LEAGUE_CONVERSION_RATES: Record<string, number> = {
    EPL: 0.33,
    LA_LIGA: 0.31,
    SERIE_A: 0.29,
    BUNDESLIGA: 0.35,
    LIGUE_1: 0.30,
    STANDARD: 0.31
};

export const DATA_CONSTANTS = {
    SHRINKAGE_K: 12,
    DEFAULT_LEAGUE_AVG: 1.35,
    MIN_STABILITY: 0.1,
    MAX_STABILITY: 0.9,
    RECENCY_DECAY: 0.00385,
    MATCH_LIMIT: 2000,
    SYNC_THRESHOLD: 200,
    RHO_SAMPLE_SIZE: 500,
    MOMENTUM_CAP: 0.15
};

export const BAYESIAN_CONFIG = {
    BASE_TRUST: 0.23,
    PURITY_SCALE: 0.4
};

export const BACKTEST_CONFIG = {
    SAMPLE_SIZE: 300,
    SEGMENTS: [
        { segment: 'Low Edge (0-3%)', min: 0, max: 3, count: 0, hits: 0 },
        { segment: 'Mid Edge (3-7%)', min: 3, max: 7, count: 0, hits: 0 },
        { segment: 'High Edge (7-12%)', min: 7, max: 12, count: 0, hits: 0 },
        { segment: 'Extreme (12%+)', min: 12, max: 100, count: 0, hits: 0 }
    ]
};
