/**
 * Optimization Runner Script
 * Runs grid search and Bayesian optimization on your module
 */

import { DataLoader } from './data-loader';
import { ParameterOptimizer } from './parameter-optimizer';
import * as fs from 'fs';

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║      🔍 PARAMETER OPTIMIZATION - Alpha Terminal v1.0           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // Load data
        console.log('📊 Loading EPL data...');
        const allMatches = DataLoader.getMockEPLData();
        const stats = DataLoader.extractStats(allMatches);
        const lastNMatches = allMatches.slice(-26);
        console.log(`✅ Loaded ${lastNMatches.length} matches\n`);

        // Run optimization
        const optimizationMethod = process.argv[2] || 'bayesian';

        console.log(`🚀 Starting ${optimizationMethod} optimization...\n`);

        let results;
        if (optimizationMethod === 'grid') {
            results = await ParameterOptimizer.gridSearch(lastNMatches, stats.rhoData, 50);
        } else {
            results = await ParameterOptimizer.bayesianOptimization(lastNMatches, stats.rhoData, 30);
        }

        // Print results
        ParameterOptimizer.printResults(results);

        // Save to file
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `backtest-results/optimization_${optimizationMethod}_${timestamp}.json`;
        if (!fs.existsSync('backtest-results')) {
            fs.mkdirSync('backtest-results');
        }
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`💾 Results saved to: ${filename}\n`);

        // Print best parameters
        if (results.length > 0) {
            const best = results[0];
            console.log('🎆 BEST PARAMETERS FOUND:');
            console.log('═'.repeat(60));
            console.log(`Kelly Fraction:     ${best.params.kellyFraction.toFixed(3)}`);
            console.log(`Edge Threshold:     ${best.params.edgeThreshold.toFixed(4)}`);
            console.log(`Min Odds:           ${best.params.minOdds.toFixed(2)}`);
            console.log(`Model Trust:        ${best.params.modelTrust.toFixed(2)}`);
            console.log(`\nExpected Performance:`);
            console.log(`ROI:                ${best.roi.toFixed(2)}%`);
            console.log(`Win Rate:           ${best.winRate.toFixed(2)}%`);
            console.log(`Profit Factor:      ${best.profitFactor.toFixed(2)}x`);
            console.log(`Brier Score:        ${best.brierScore.toFixed(4)}`);
            console.log(`\nFitness Score:      ${best.score.toFixed(3)} ⭐\n`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main().catch(console.error);
