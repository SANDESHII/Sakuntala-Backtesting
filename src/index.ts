/**
 * Main Entry Point
 * Runs the complete backtesting pipeline
 */

import { DataLoader } from './data-loader';
import { SimulationEngine } from './simulation';
import * as fs from 'fs';

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     🎯 ALPHA TERMINAL - BACKTESTING FRAMEWORK v1.0            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // Load data
        console.log('📊 Loading EPL data...');
        const allMatches = DataLoader.getMockEPLData();
        const stats = DataLoader.extractStats(allMatches);
        console.log(`✅ Loaded ${allMatches.length} matches\n`);

        // Run simulation
        console.log('🎮 Running simulation on last 26 games...');
        const report = await SimulationEngine.runSimulation(
            allMatches.slice(-26),
            stats.rhoData
        );

        // Print results
        printFullReport(report);

        // Save to file
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `backtest-results/report_${timestamp}.json`;
        if (!fs.existsSync('backtest-results')) {
            fs.mkdirSync('backtest-results');
        }
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${filename}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

function printFullReport(report: any) {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           📈 SIMULATION RESULTS REPORT                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📅 Period: ${report.simulationPeriod.from} → ${report.simulationPeriod.to}`);
    console.log(`🎮 Total Matches: ${report.totalMatches}\n`);

    // ACCURACY METRICS
    console.log('┌─ 📊 PREDICTION ACCURACY');
    console.log(`│  Over 1.5:     ${report.overAccuracy.toFixed(2)}%`);
    console.log(`│  Under 3.5:    ${report.underAccuracy.toFixed(2)}%`);
    console.log(`│  Brier Score:  ${report.brierScore.toFixed(4)}`);
    console.log(`│  RMSE:         ${report.calibrationRMSE.toFixed(4)}`);
    console.log('└─\n');

    // CLV METRICS
    console.log('┌─ 💰 CLOSING LINE VALUE');
    console.log(`│  Avg CLV:      ${report.avgCLV.toFixed(2)}%`);
    console.log(`│  Positive CLV: ${report.positiveClvCount}/${report.totalMatches}`);
    console.log(`│  Win Rate:     ${report.clvWinRate.toFixed(2)}%`);
    console.log(`│  Cumulative:   ${report.cumulativeClv.toFixed(2)}%`);
    console.log('└─\n');

    // BETTING PERFORMANCE
    console.log('┌─ 🎲 BETTING PERFORMANCE');
    console.log(`│  Bets Placed:  ${report.totalBets}`);
    console.log(`│  Win Rate:     ${report.winRate.toFixed(2)}%`);
    console.log(`│  Record:       ${report.winBets}W - ${report.lossBets}L`);
    console.log(`│  Staked:       ${report.totalStaked.toFixed(2)} units`);
    console.log(`│  Profit/Loss:  ${report.totalProfit > 0 ? '+' : ''}${report.totalProfit.toFixed(2)} units`);
    console.log(`│  ROI:          ${report.roi.toFixed(2)}%`);
    console.log(`│  Profit Factor:${report.profitFactor.toFixed(2)}x`);
    console.log('└─\n');

    // EDGE SEGMENTS
    console.log('┌─ 🎯 PERFORMANCE BY EDGE');
    report.edgeSegments.forEach((seg: any) => {
        console.log(`│  ${seg.segment}`);
        console.log(`│    • Count: ${seg.count} | Acc: ${seg.accuracy.toFixed(1)}% | CLV: ${seg.avgClv.toFixed(2)}%`);
    });
    console.log('└─\n');

    // ASSESSMENT
    console.log('┌─ 🔍 MODEL ASSESSMENT');
    const assessment = generateAssessment(report);
    assessment.forEach((line: string) => console.log(`│  ${line}`));
    console.log('└─\n');
}

function generateAssessment(report: any): string[] {
    const lines = [];

    // Brier Score assessment
    if (report.brierScore < 0.20) {
        lines.push('✅ Excellent calibration');
    } else if (report.brierScore < 0.23) {
        lines.push('✅ Good calibration');
    } else if (report.brierScore < 0.25) {
        lines.push('⚠️  Fair calibration (near random)');
    } else {
        lines.push('❌ Poor calibration (worse than random)');
    }

    // CLV assessment
    if (report.avgCLV > 5) {
        lines.push(`✅ Strong CLV edge (${report.avgCLV.toFixed(2)}%)`);
    } else if (report.avgCLV > 2) {
        lines.push(`⚠️  Moderate CLV (${report.avgCLV.toFixed(2)}%)`);
    } else if (report.avgCLV > 0) {
        lines.push(`⚠️  Weak CLV (${report.avgCLV.toFixed(2)}%)`);
    } else {
        lines.push(`❌ Negative CLV (${report.avgCLV.toFixed(2)}%)`);
    }

    // ROI assessment
    if (report.roi > 10) {
        lines.push(`✅ Strong ROI (${report.roi.toFixed(2)}%)`);
    } else if (report.roi > 0) {
        lines.push(`⚠️  Positive ROI (${report.roi.toFixed(2)}%)`);
    } else {
        lines.push(`❌ Negative ROI (${report.roi.toFixed(2)}%)`);
    }

    // Win rate assessment
    if (report.winRate > 55) {
        lines.push(`✅ Solid win rate (${report.winRate.toFixed(2)}%)`);
    } else if (report.winRate > 50) {
        lines.push(`⚠️  Slight edge (${report.winRate.toFixed(2)}%)`);
    } else {
        lines.push(`❌ Below break-even (${report.winRate.toFixed(2)}%)`);
    }

    return lines;
}

main().catch(console.error);
