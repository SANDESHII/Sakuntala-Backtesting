/**
 * Type definitions for backtesting framework
 */

export interface TeamStats {
    name: string;
    goalsScored: number;
    goalsConceded: number;
    avgXG: number;
    avgXGA: number;
    npxG: number;
    defensiveStability: number;
    form: number[];
    cleanSheets: number;
    dataPurity: number;
    redCardPropensity: number;
    clinicalEdge: number;
    homeAwayBias: number;
}

export interface MatchHistory {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeGoals: number | null;
    awayGoals: number | null;
    homeXG?: number;
    awayXG?: number;
    homeRedCards?: number;
    awayRedCards?: number;
    homeShotsOnTarget?: number;
    awayShotsOnTarget?: number;
    league: string;
    weight?: number;
    isVerified?: boolean;
}

export interface RhoData {
    rho: number;
    sigmaRho: number;
}

export interface AnalysisResult {
    probability: number;
    summary: string;
    homeStats: TeamStats;
    awayStats: TeamStats;
    homeXG: number;
    awayXG: number;
    minimumExpectancy: number;
    potentialCeiling: number;
    predictionType: 'OVER_15' | 'UNDER_35';
    predictionLabel: string;
    marketOdds: number;
    marketImpliedProb: number;
    edge: number;
    recommendedStake: number;
    verdict: 'EXECUTE_BET' | 'NO_BET';
    purity: number;
    signalStrength: number;
    context: any;
    dataSource: string;
    surety: {
        confidenceScore: number;
        edgeValue: number;
        groundingCitations?: any[];
    };
}

export interface SimulationMatch {
    match: MatchHistory;
    prediction: AnalysisResult;
    actualScore: [number, number];
    actualOutcome: boolean;
    brierScore: number;
    clv: number;
    modelOdds: number;
    marketOdds: number;
    roi: number;
    stakeUsed: number;
    profitLoss: number;
}

export interface SimulationReport {
    totalMatches: number;
    simulationPeriod: { from: string; to: string };
    overAccuracy: number;
    underAccuracy: number;
    overUnderMatches: number;
    brierScore: number;
    calibrationRMSE: number;
    avgCLV: number;
    positiveClvCount: number;
    clvWinRate: number;
    cumulativeClv: number;
    totalBets: number;
    winBets: number;
    lossBets: number;
    winRate: number;
    totalStaked: number;
    totalProfit: number;
    roi: number;
    profitFactor: number;
    edgeSegments: Array<{
        segment: string;
        count: number;
        accuracy: number;
        avgClv: number;
        roi: number;
    }>;
    matches: SimulationMatch[];
}
