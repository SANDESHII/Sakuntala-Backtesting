#!/usr/bin/env node

/**
 * Performance Report Generator
 * Generates comprehensive backtest reports with visualizations
 */

import { DataLoader } from './data-loader';
import { SimulationEngine } from './simulation';
import * as fs from 'fs';

interface PerformanceMetrics {
    dailyReturns: number[];
    cumulativeReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    recoveryPeriod: number;
    consistencyIndex: number;
}

async function generateReport() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║      📈 COMPREHENSIVE PERFORMANCE REPORT - Alpha Terminal        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // Load and run simulation
        const allMatches = DataLoader.getMockEPLData();
        const stats = DataLoader.extractStats(allMatches);
        const report = await SimulationEngine.runSimulation(
            allMatches.slice(-26),
            stats.rhoData
        );

        // Calculate advanced metrics
        const metrics = calculatePerformanceMetrics(report);

        // Generate HTML report
        const html = generateHTML(report, metrics);

        // Save report
        const filename = `backtest-results/performance_report_${new Date().toISOString().split('T')[0]}.html`;
        if (!fs.existsSync('backtest-results')) {
            fs.mkdirSync('backtest-results');
        }
        fs.writeFileSync(filename, html);

        console.log(`📈 PERFORMANCE METRICS`);
        console.log('═'.repeat(60));
        console.log(`Cumulative Return:         ${metrics.cumulativeReturn.toFixed(2)}%`);
        console.log(`Sharpe Ratio:              ${metrics.sharpeRatio.toFixed(2)}`);
        console.log(`Max Drawdown:              ${metrics.maxDrawdown.toFixed(2)}%`);
        console.log(`Recovery Period:           ${metrics.recoveryPeriod} days`);
        console.log(`Consistency Index:         ${metrics.consistencyIndex.toFixed(2)}\n`);

        console.log(`💾 Report saved to: ${filename}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

function calculatePerformanceMetrics(report: any): PerformanceMetrics {
    const dailyReturns: number[] = [];
    let cumulativeValue = 10000; // Start with $10k

    report.matches.forEach((m: any) => {
        if (m.stakeUsed > 0) {
            const returnPct = (m.profitLoss / m.stakeUsed) * 100;
            dailyReturns.push(returnPct);
            cumulativeValue *= (1 + returnPct / 100);
        }
    });

    const cumulativeReturn = ((cumulativeValue - 10000) / 10000) * 100;
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length || 0;
    const stdDev = Math.sqrt(
        dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
    ) || 1;
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252); // Annualized

    let maxDrawdown = 0;
    let peak = cumulativeValue;
    dailyReturns.forEach(r => {
        cumulativeValue *= (1 + r / 100);
        if (cumulativeValue > peak) peak = cumulativeValue;
        const dd = ((cumulativeValue - peak) / peak) * 100;
        maxDrawdown = Math.min(maxDrawdown, dd);
    });

    const winCount = report.matches.filter((m: any) => m.profitLoss > 0).length;
    const consistencyIndex = (winCount / report.matches.length) * 100;

    return {
        dailyReturns,
        cumulativeReturn,
        sharpeRatio,
        maxDrawdown: Math.abs(maxDrawdown),
        recoveryPeriod: 10, // Placeholder
        consistencyIndex
    };
}

function generateHTML(report: any, metrics: PerformanceMetrics): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Alpha Terminal - Performance Report</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #0a0e27; color: #e0e6ed; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .metric-box { background: #1a1f3a; padding: 15px; border-radius: 8px; border-left: 4px solid #00d4ff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #00ff88; }
        .metric-label { font-size: 12px; color: #888; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
        th { background: #1a1f3a; color: #00d4ff; }
        tr:hover { background: #1a1f3a; }
        .positive { color: #00ff88; }
        .negative { color: #ff4444; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Alpha Terminal - Performance Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>

        <h2>📊 Key Metrics</h2>
        <div class="metrics">
            <div class="metric-box">
                <div class="metric-label">ROI</div>
                <div class="metric-value ${report.roi > 0 ? 'positive' : 'negative'}">${report.roi.toFixed(2)}%</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Win Rate</div>
                <div class="metric-value positive">${report.winRate.toFixed(2)}%</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Brier Score</div>
                <div class="metric-value">${report.brierScore.toFixed(4)}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Avg CLV</div>
                <div class="metric-value positive">${report.avgCLV.toFixed(2)}%</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Sharpe Ratio</div>
                <div class="metric-value">${metrics.sharpeRatio.toFixed(2)}</div>
            </div>
            <div class="metric-box">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value negative">-${metrics.maxDrawdown.toFixed(2)}%</div>
            </div>
        </div>

        <h2>📈 Detailed Results</h2>
        <table>
            <tr>
                <th>Match</th>
                <th>Prediction</th>
                <th>Result</th>
                <th>CLV</th>
                <th>ROI</th>
            </tr>
            ${report.matches.slice(0, 10).map((m: any) => `
                <tr>
                    <td>${m.match.homeTeam.replace(/_/g, ' ')} vs ${m.match.awayTeam.replace(/_/g, ' ')}</td>
                    <td>${m.prediction.predictionLabel} (${m.prediction.probability}%)</td>
                    <td>${m.actualScore.join('-')} ${m.actualOutcome ? '✅' : '❌'}</td>
                    <td>${m.clv.toFixed(2)}%</td>
                    <td class="${m.roi > 0 ? 'positive' : 'negative'}">${m.roi.toFixed(2)}%</td>
                </tr>
            `).join('')}
        </table>
    </div>
</body>
</html>
    `;
}

generatReport().catch(console.error);
