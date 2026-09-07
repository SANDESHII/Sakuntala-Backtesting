/**
 * Core Simulation Engine
 * Runs predictions and calculates CLV, Brier Score, ROI
 */

import {
    MatchHistory,
    TeamStats,
    AnalysisResult,
    SimulationMatch,
    SimulationReport,
    RhoData
} from './types';
import { DixonColes, MonteCarloSimulator } from './math-engine';
import { LEAGUE_CONFIGS, DATA_CONSTANTS, BAYESIAN_CONFIG } from './constants';

export class SimulationEngine {
    /**
     * Calculate match probability using Dixon-Coles model
     */
    static calculateMatchProb(
        homeTeam: string,
        awayTeam: string,
        homeXG: number,
        awayXG: number,
        rhoData: RhoData,
        config = LEAGUE_CONFIGS.EPL
    ): {
        overProb: number;
        underProb: number;
        homeXG: number;
        awayXG: number;
    } {
        const matrix = DixonColes.calculateScoreMatrix(homeXG, awayXG, rhoData.rho);
        const overProb = DixonColes.calculateOverUnder(matrix, 1.5);
        const underProb = 1 - DixonColes.calculateOverUnder(matrix, 3.5);

        return {
            overProb,
            underProb,
            homeXG,
            awayXG
        };
    }

    /**
     * Main simulation runner for a set of matches
     */
    static async runSimulation(
        matches: MatchHistory[],
        rhoData: RhoData,
        minOdds: number = 1.50,
        edgeThreshold: number = 0.025
    ): Promise<SimulationReport> {
        if (matches.length === 0) {
            throw new Error('No matches provided for simulation');
        }

        const results: SimulationMatch[] = [];
        let totalBrierScore = 0;
        let totalCLV = 0;
        let positiveClvCount = 0;
        let winBets = 0;
        let totalBets = 0;
        let totalStaked = 0;
        let totalProfit = 0;

        for (const match of matches) {
            try {
                // 1. Generate prediction
                const homeXG = match.homeXG || 1.35;
                const awayXG = match.awayXG || 1.25;

                const prob = this.calculateMatchProb(
                    match.homeTeam,
                    match.awayTeam,
                    homeXG,
                    awayXG,
                    rhoData
                );

                // Randomly select Over 1.5 or Under 3.5 based on probability
                const predictionType = prob.overProb > prob.underProb ? 'OVER_15' : 'UNDER_35';
                const modelProb =
                    predictionType === 'OVER_15' ? prob.overProb : prob.underProb;

                // 2. Evaluate outcome
                const totalGoals = (match.homeGoals || 0) + (match.awayGoals || 0);
                const isOver15 = totalGoals > 1.5;
                const isUnder35 = totalGoals < 3.5;
                const actualOutcome = predictionType === 'OVER_15' ? isOver15 : isUnder35;

                // 3. Calculate Brier Score
                const brierScore = Math.pow(modelProb - (actualOutcome ? 1 : 0), 2);
                totalBrierScore += brierScore;

                // 4. Calculate CLV
                const modelOdds = 1 / modelProb; // Convert prob to odds
                const marketOdds = this.getClosingOdds(match, predictionType); // Simulated closing odds
                const marketProb = 1 / marketOdds;
                const clv = ((modelProb - marketProb) / marketProb) * 100;

                // 5. Betting decision
                const edge = Math.abs(modelProb - marketProb);
                let stake = 0;
                let roi = 0;
                let profitLoss = 0;
                let bet = false;

                if (edge > edgeThreshold && marketOdds >= minOdds && Math.abs(clv) > 2) {
                    bet = true;
                    totalBets++;

                    stake = 100 * edge; // Stake proportional to edge
                    totalStaked += stake;

                    if (actualOutcome) {
                        profitLoss = stake * (marketOdds - 1);
                        winBets++;
                    } else {
                        profitLoss = -stake;
                    }

                    totalProfit += profitLoss;
                    roi = (profitLoss / stake) * 100;
                }

                if (Math.abs(clv) > 2) {
                    positiveClvCount++;
                    totalCLV += clv;
                }

                results.push({
                    match,
                    prediction: {
                        probability: Math.round(modelProb * 100),
                        summary: `${predictionType}: ${Math.round(modelProb * 100)}% | Market: ${Math.round(marketProb * 100)}%`,
                        homeStats: {} as TeamStats,
                        awayStats: {} as TeamStats,
                        homeXG,
                        awayXG,
                        minimumExpectancy: 0,
                        potentialCeiling: 0,
                        predictionType: predictionType as 'OVER_15' | 'UNDER_35',
                        predictionLabel: predictionType === 'OVER_15' ? 'Over 1.5 Goals' : 'Under 3.5 Goals',
                        marketOdds,
                        marketImpliedProb: Math.round(marketProb * 100),
                        edge: Math.round(edge * 100),
                        recommendedStake: stake,
                        verdict: bet ? 'EXECUTE_BET' : 'NO_BET',
                        purity: 85,
                        signalStrength: modelProb,
                        context: {},
                        dataSource: 'LIVE',
                        surety: {
                            confidenceScore: modelProb,
                            edgeValue: Math.round(edge * 100)
                        }
                    },
                    actualScore: [match.homeGoals || 0, match.awayGoals || 0],
                    actualOutcome,
                    brierScore,
                    clv,
                    modelOdds,
                    marketOdds,
                    roi,
                    stakeUsed: stake,
                    profitLoss
                });
            } catch (e) {
                console.error(`Failed to process ${match.homeTeam} vs ${match.awayTeam}:`, e);
            }
        }

        // 6. Aggregate metrics
        const avgBrierScore = totalBrierScore / matches.length;
        const clvWinRate = winBets > 0 ? (winBets / totalBets) * 100 : 0;

        // Edge segments
        const edgeSegments = [
            { segment: 'Low Edge (0-3%)', min: 0, max: 3, count: 0, hits: 0, clvSum: 0 },
            { segment: 'Mid Edge (3-7%)', min: 3, max: 7, count: 0, hits: 0, clvSum: 0 },
            { segment: 'High Edge (7-12%)', min: 7, max: 12, count: 0, hits: 0, clvSum: 0 },
            { segment: 'Extreme (12%+)', min: 12, max: 100, count: 0, hits: 0, clvSum: 0 }
        ];

        results.forEach(r => {
            const edge = r.prediction.edge;
            const seg = edgeSegments.find(s => edge >= s.min && edge < s.max);
            if (seg) {
                seg.count++;
                if (r.actualOutcome) seg.hits++;
                seg.clvSum += r.clv;
            }
        });

        return {
            totalMatches: matches.length,
            simulationPeriod: {
                from: matches[0].date,
                to: matches[matches.length - 1].date
            },
            overAccuracy: this.calculateSegmentAccuracy(results, 'OVER_15'),
            underAccuracy: this.calculateSegmentAccuracy(results, 'UNDER_35'),
            overUnderMatches: results.length,
            brierScore: avgBrierScore,
            calibrationRMSE: Math.sqrt(avgBrierScore),
            avgCLV: positiveClvCount > 0 ? totalCLV / positiveClvCount : 0,
            positiveClvCount,
            clvWinRate,
            cumulativeClv: totalCLV,
            totalBets,
            winBets,
            lossBets: totalBets - winBets,
            winRate: totalBets > 0 ? (winBets / totalBets) * 100 : 0,
            totalStaked,
            totalProfit,
            roi: totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0,
            profitFactor: this.calculateProfitFactor(results),
            edgeSegments: edgeSegments.map(seg => ({
                segment: seg.segment,
                count: seg.count,
                accuracy: seg.count > 0 ? (seg.hits / seg.count) * 100 : 0,
                avgClv: seg.count > 0 ? seg.clvSum / seg.count : 0,
                roi: seg.count > 0 ? ((seg.hits / seg.count) * 100 - 100) / 100 * 100 : 0
            })),
            matches: results
        };
    }

    private static calculateSegmentAccuracy(
        results: SimulationMatch[],
        type: 'OVER_15' | 'UNDER_35'
    ): number {
        const segment = results.filter(r => r.prediction.predictionType === type);
        if (segment.length === 0) return 0;
        const correct = segment.filter(r => r.actualOutcome).length;
        return (correct / segment.length) * 100;
    }

    private static calculateProfitFactor(results: SimulationMatch[]): number {
        let grossProfit = 0;
        let grossLoss = 0;
        results.forEach(r => {
            if (r.profitLoss > 0) grossProfit += r.profitLoss;
            else grossLoss += Math.abs(r.profitLoss);
        });
        return grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    }

    /**
     * Simulate closing odds based on market behavior
     */
    private static getClosingOdds(match: MatchHistory, predictionType: 'OVER_15' | 'UNDER_35'): number {
        const totalGoals = (match.homeGoals || 0) + (match.awayGoals || 0);
        const baselineOdds = predictionType === 'OVER_15' ? 1.90 : 1.85;
        const variance = 0.1;
        return baselineOdds + (Math.random() - 0.5) * variance;
    }
}
