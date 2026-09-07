/**
 * EPL Backtesting Script
 * Runs simulation on last 26 EPL games
 */

import { DataLoader } from './data-loader';
import { SimulationEngine } from './simulation';

async function main() {
    console.log('\n🎯 ALPHA TERMINAL BACKTESTING - EPL');
    console.log('═══════════════════════════════════════════\n');

    try {
        // 1. Load data
        console.log('📊 Loading EPL historical data...');
        const allMatches = DataLoader.getMockEPLData();
        const lastNMatches = allMatches.slice(-26); // Last 26 games

        console.log(`✅ Loaded ${lastNMatches.length} matches`);
        console.log(`   Date range: ${lastNMatches[0].date} → ${lastNMatches[lastNMatches.length - 1].date}\n`);

        // 2. Extract league stats
        console.log('📈 Extracting league statistics...');
        const stats = DataLoader.extractStats(allMatches);
        console.log(`   Avg Home Goals: ${stats.avgHomeGoals.toFixed(2)}`);
        console.log(`   Avg Away Goals: ${stats.avgAwayGoals.toFixed(2)}`);
        console.log(`   Rho (correlation): ${stats.rhoData.rho.toFixed(4)}\n`);

        // 3. Run simulation
        console.log('🎮 Running simulation...');
        const report = await SimulationEngine.runSimulation(
            lastNMatches,
            stats.rhoData,
            1.50, // Min odds
            0.025 // Edge threshold (2.5%)
        );

        // 4. Print results
        printReport(report);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

function printReport(report: any) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║           🎯 REALTIME SIMULATION REPORT                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log(`📅 Period: ${report.simulationPeriod.from} → ${report.simulationPeriod.to}`);
    console.log(`🎮 Total Matches Analyzed: ${report.totalMatches}\n`);

    // ACCURACY SECTION
    console.log('📊 PREDICTION ACCURACY');
    console.log('───────────────────────────────────────');
    console.log(`  Over 1.5 Accuracy:     ${report.overAccuracy.toFixed(2)}%`);
    console.log(`  Under 3.5 Accuracy:    ${report.underAccuracy.toFixed(2)}%`);
    console.log(`  Brier Score:           ${report.brierScore.toFixed(4)} (lower is better, 0.25 = random)`);
    console.log(`  Calibration RMSE:      ${report.calibrationRMSE.toFixed(4)}\n`);

    // CLV SECTION
    console.log('💰 CLOSING LINE VALUE (CLV)');
    console.log('───────────────────────────────────────');
    console.log(`  Avg CLV:               ${report.avgCLV.toFixed(2)}%`);
    console.log(`  Positive CLV Bets:     ${report.positiveClvCount} of ${report.totalMatches}`);
    console.log(`  CLV Win Rate:          ${report.clvWinRate.toFixed(2)}%`);
    console.log(`  Cumulative CLV:        ${report.cumulativeClv.toFixed(2)}%\n`);

    // BETTING SECTION
    console.log('🎲 BETTING PERFORMANCE');
    console.log('───────────────────────────────────────');
    console.log(`  Total Bets Placed:     ${report.totalBets}`);
    console.log(`  Win Rate:              ${report.winRate.toFixed(2)}%`);
    console.log(`  Wins / Losses:         ${report.winBets}W - ${report.lossBets}L`);
    console.log(`  Total Staked:          ${report.totalStaked.toFixed(2)} units`);
    console.log(`  Total Profit/Loss:     ${report.totalProfit > 0 ? '+' : ''}${report.totalProfit.toFixed(2)} units`);
    console.log(`  ROI:                   ${report.roi.toFixed(2)}%`);
    console.log(`  Profit Factor:         ${report.profitFactor.toFixed(2)}x\n`);

    // EDGE SEGMENTS
    console.log('🎯 PERFORMANCE BY EDGE SIZE');
    console.log('───────────────────────────────────────');
    report.edgeSegments.forEach((seg: any) => {
        console.log(`  ${seg.segment}`);
        console.log(`    Count: ${seg.count} | Accuracy: ${seg.accuracy.toFixed(2)}% | Avg CLV: ${seg.avgClv.toFixed(2)}% | ROI: ${seg.roi.toFixed(2)}%`);
    });
    console.log();

    // INTERPRETATION
    console.log('📈 MODEL ASSESSMENT');
    console.log('───────────────────────────────────────');
    printAssessment(report);
    console.log();
}

function printAssessment(report: any) {
    const assessments = [];

    // Brier Score
    if (report.brierScore < 0.20) {
        assessments.push('✅ Excellent calibration (Brier < 0.20)');
    } else if (report.brierScore < 0.23) {
        assessments.push('✅ Good calibration (Brier 0.20-0.23)');
    } else if (report.brierScore < 0.25) {
        assessments.push('⚠️  Fair calibration (Brier 0.23-0.25, near random)');
    } else {
        assessments.push('❌ Poor calibration (Brier > 0.25, worse than random)');
    }

    // CLV
    if (report.avgCLV > 5) {
        assessments.push(`✅ Strong CLV (${report.avgCLV.toFixed(2)}% > 5%)`);
    } else if (report.avgCLV > 2) {
        assessments.push(`⚠️  Moderate CLV (${report.avgCLV.toFixed(2)}% > 2%)`);
    } else if (report.avgCLV > 0) {
        assessments.push(`⚠️  Weak CLV (${report.avgCLV.toFixed(2)}% > 0%)`);
    } else {
        assessments.push(`❌ Negative CLV (${report.avgCLV.toFixed(2)}% < 0%)`);
    }

    // ROI
    if (report.roi > 10) {
        assessments.push(`✅ Strong ROI (${report.roi.toFixed(2)}% > 10%)`);
    } else if (report.roi > 0) {
        assessments.push(`⚠️  Positive ROI (${report.roi.toFixed(2)}% > 0%)`);
    } else if (report.roi > -5) {
        assessments.push(`⚠️  Minor Loss (${report.roi.toFixed(2)}% > -5%)`);
    } else {
        assessments.push(`❌ Significant Loss (${report.roi.toFixed(2)}%)`);
    }

    // Win Rate
    if (report.winRate > 55) {
        assessments.push(`✅ Solid win rate (${report.winRate.toFixed(2)}% > 55%)`);
    } else if (report.winRate > 50) {
        assessments.push(`⚠️  Slight edge (${report.winRate.toFixed(2)}% > 50%)`);
    } else if (report.winRate > 0) {
        assessments.push(`❌ Below 50% (${report.winRate.toFixed(2)}%)`);
    }

    assessments.forEach(a => console.log(`  ${a}`));
}

main().catch(console.error);
