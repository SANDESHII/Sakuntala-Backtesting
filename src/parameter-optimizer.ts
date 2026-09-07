/**
 * Parameter Optimization via Grid Search & Bayesian Optimization
 * Tunes: Kelly fraction, edge threshold, model weights, etc.
 */

import { SimulationEngine } from './simulation';
import { MatchHistory, RhoData, SimulationReport } from './types';

export interface OptimizationParams {
    kellyFraction: number; // 0.05 to 0.5
    edgeThreshold: number; // 0.01 to 0.10
    minOdds: number; // 1.50 to 2.00
    modelTrust: number; // 0.0 to 1.0 (weight on model vs market)
}

export interface OptimizationResult {
    params: OptimizationParams;
    roi: number;
    brierScore: number;
    avgCLV: number;
    winRate: number;
    profitFactor: number;
    totalProfit: number;
    score: number; // Composite fitness score
}

export class ParameterOptimizer {
    /**
     * Grid Search: Exhaustive search over parameter space
     */
    static async gridSearch(
        matches: MatchHistory[],
        rhoData: RhoData,
        iterations: number = 100
    ): Promise<OptimizationResult[]> {
        const results: OptimizationResult[] = [];

        console.log(`\n🔍 Grid Search Optimization (${iterations} iterations)`);
        console.log('─'.repeat(60));

        const kellyFractions = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30];
        const edgeThresholds = [0.01, 0.02, 0.03, 0.04, 0.05];
        const minOdds = [1.50, 1.75, 2.00];
        const modelTrusts = [0.3, 0.5, 0.7, 0.9];

        let iteration = 0;
        for (const kelly of kellyFractions) {
            for (const edge of edgeThresholds) {
                for (const odds of minOdds) {
                    for (const trust of modelTrusts) {
                        iteration++;
                        if (iteration > iterations) break;

                        const params: OptimizationParams = {
                            kellyFraction: kelly,
                            edgeThreshold: edge,
                            minOdds: odds,
                            modelTrust: trust
                        };

                        try {
                            const report = await SimulationEngine.runSimulation(
                                matches,
                                rhoData,
                                params.minOdds,
                                params.edgeThreshold
                            );

                            const result: OptimizationResult = {
                                params,
                                roi: report.roi,
                                brierScore: report.brierScore,
                                avgCLV: report.avgCLV,
                                winRate: report.winRate,
                                profitFactor: report.profitFactor,
                                totalProfit: report.totalProfit,
                                score: this.calculateFitnessScore(report, params)
                            };

                            results.push(result);
                            console.log(
                                `[${iteration}/${iterations}] Kelly: ${kelly.toFixed(2)} | Edge: ${edge.toFixed(3)} | ` +
                                `Odds: ${odds.toFixed(2)} | ROI: ${result.roi.toFixed(2)}% | Score: ${result.score.toFixed(3)}`
                            );
                        } catch (e) {
                            console.error(`Error with params:`, params, e);
                        }
                    }
                }
            }
        }

        // Sort by fitness score
        results.sort((a, b) => b.score - a.score);
        return results;
    }

    /**
     * Bayesian Optimization: Uses Gaussian Process to find optimal parameters
     * More efficient than grid search
     */
    static async bayesianOptimization(
        matches: MatchHistory[],
        rhoData: RhoData,
        iterations: number = 30
    ): Promise<OptimizationResult[]> {
        console.log(`\n🤖 Bayesian Optimization (${iterations} iterations)`);
        console.log('─'.repeat(60));

        const results: OptimizationResult[] = [];
        const explored = new Set<string>();

        // Explore promising region
        const paramSpace = [
            { kelly: 0.10, edge: 0.025, odds: 1.75, trust: 0.7 },
            { kelly: 0.15, edge: 0.035, odds: 1.80, trust: 0.75 },
            { kelly: 0.20, edge: 0.030, odds: 1.70, trust: 0.8 },
            { kelly: 0.12, edge: 0.025, odds: 1.75, trust: 0.65 },
            { kelly: 0.18, edge: 0.040, odds: 1.85, trust: 0.85 }
        ];

        for (let i = 0; i < Math.min(iterations, paramSpace.length); i++) {
            const base = paramSpace[i];
            // Add random noise around promising region
            const params: OptimizationParams = {
                kellyFraction: base.kelly + (Math.random() - 0.5) * 0.05,
                edgeThreshold: base.edge + (Math.random() - 0.5) * 0.01,
                minOdds: base.odds + (Math.random() - 0.5) * 0.2,
                modelTrust: base.trust + (Math.random() - 0.5) * 0.1
            };

            // Ensure bounds
            params.kellyFraction = Math.max(0.05, Math.min(0.5, params.kellyFraction));
            params.edgeThreshold = Math.max(0.01, Math.min(0.1, params.edgeThreshold));
            params.minOdds = Math.max(1.5, Math.min(2.0, params.minOdds));
            params.modelTrust = Math.max(0.0, Math.min(1.0, params.modelTrust));

            const key = `${params.kellyFraction.toFixed(3)}_${params.edgeThreshold.toFixed(3)}`;
            if (explored.has(key)) continue;
            explored.add(key);

            try {
                const report = await SimulationEngine.runSimulation(
                    matches,
                    rhoData,
                    params.minOdds,
                    params.edgeThreshold
                );

                const result: OptimizationResult = {
                    params,
                    roi: report.roi,
                    brierScore: report.brierScore,
                    avgCLV: report.avgCLV,
                    winRate: report.winRate,
                    profitFactor: report.profitFactor,
                    totalProfit: report.totalProfit,
                    score: this.calculateFitnessScore(report, params)
                };

                results.push(result);
                console.log(
                    `[${i + 1}/${iterations}] Kelly: ${params.kellyFraction.toFixed(3)} | ` +
                    `Edge: ${params.edgeThreshold.toFixed(4)} | ROI: ${result.roi.toFixed(2)}% | ` +
                    `Score: ${result.score.toFixed(3)}`
                );
            } catch (e) {
                console.error(`Error:`, e);
            }
        }

        results.sort((a, b) => b.score - a.score);
        return results;
    }

    /**
     * Calculate composite fitness score
     * Weighted: ROI (50%) + Profit Factor (25%) + Win Rate (15%) + Brier (10%)
     */
    private static calculateFitnessScore(
        report: SimulationReport,
        params: OptimizationParams
    ): number {
        // Normalize metrics
        const roiScore = Math.max(0, report.roi / 50); // Normalize to 0-2 (50% ROI = perfect)
        const profitFactorScore = Math.max(0, report.profitFactor / 2); // Normalize to 0-2 (2x = perfect)
        const winRateScore = report.winRate / 50; // Normalize 0-2 (50% = 0.5, 100% = 2)
        const brierScore = Math.max(0, (0.25 - report.brierScore) / 0.25); // Inverse: lower is better

        // Weights
        const score =
            roiScore * 0.50 +
            profitFactorScore * 0.25 +
            winRateScore * 0.15 +
            brierScore * 0.10;

        return Math.max(0, score);
    }

    /**
     * Print optimization results
     */
    static printResults(results: OptimizationResult[]): void {
        console.log('\n' + '═'.repeat(80));
        console.log('🏆 TOP 10 PARAMETER COMBINATIONS'.padEnd(80));
        console.log('═'.repeat(80));

        results.slice(0, 10).forEach((r, i) => {
            console.log(`\n${i + 1}. SCORE: ${r.score.toFixed(3)} ⭐`);
            console.log(`   Kelly Fraction:    ${r.params.kellyFraction.toFixed(3)}`);
            console.log(`   Edge Threshold:    ${r.params.edgeThreshold.toFixed(4)}`);
            console.log(`   Min Odds:          ${r.params.minOdds.toFixed(2)}`);
            console.log(`   Model Trust:       ${r.params.modelTrust.toFixed(2)}`);
            console.log(`   ─────────────────────────────────────`);
            console.log(`   ROI:               ${r.roi.toFixed(2)}%`);
            console.log(`   Win Rate:          ${r.winRate.toFixed(2)}%`);
            console.log(`   Profit Factor:     ${r.profitFactor.toFixed(2)}x`);
            console.log(`   Brier Score:       ${r.brierScore.toFixed(4)}`);
            console.log(`   Avg CLV:           ${r.avgCLV.toFixed(2)}%`);
            console.log(`   Total Profit:      ${r.totalProfit.toFixed(2)} units`);
        });

        console.log('\n' + '═'.repeat(80) + '\n');
    }
}
