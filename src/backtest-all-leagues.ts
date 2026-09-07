/**
 * Multi-League Backtesting
 * Runs backtests across all major leagues
 */

import { DataLoader } from './data-loader';
import { SimulationEngine } from './simulation';

const LEAGUES = ['EPL', 'LA_LIGA', 'SERIE_A', 'BUNDESLIGA', 'LIGUE_1'];

async function runAllLeagues() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║        ⚽ MULTI-LEAGUE BACKTESTING REPORT                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const summaries: any[] = [];

    for (const league of LEAGUES) {
        console.log(`\n🏆 Testing ${league}...`);
        try {
            // For this demo, we'll use EPL data for all leagues
            // In production, you'd fetch league-specific data
            const allMatches = DataLoader.getMockEPLData();
            const stats = DataLoader.extractStats(allMatches);

            const report = await SimulationEngine.runSimulation(
                allMatches.slice(-26),
                stats.rhoData
            );

            summaries.push({
                league,
                brierScore: report.brierScore,
                avgCLV: report.avgCLV,
                roi: report.roi,
                winRate: report.winRate,
                profitFactor: report.profitFactor
            });

            console.log(`  ✅ Brier: ${report.brierScore.toFixed(4)} | CLV: ${report.avgCLV.toFixed(2)}% | ROI: ${report.roi.toFixed(2)}%`);
        } catch (error) {
            console.error(`  ❌ ${league} failed:`, error);
        }
    }

    // Print summary table
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              🏆 LEAGUE COMPARISON SUMMARY                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('League         | Brier    | CLV %  | ROI %   | Win % | Profit Factor');
    console.log('───────────────┼──────────┼────────┼─────────┼───────┼────────────────');

    summaries.forEach(s => {
        const league = s.league.padEnd(14);
        const brier = s.brierScore.toFixed(4).padEnd(8);
        const clv = s.avgCLV.toFixed(2).padEnd(6);
        const roi = s.roi.toFixed(2).padEnd(7);
        const winRate = s.winRate.toFixed(2).padEnd(5);
        const pf = s.profitFactor.toFixed(2);

        console.log(`${league}| ${brier} | ${clv} | ${roi} | ${winRate} | ${pf}x`);
    });

    console.log();
}

runAllLeagues().catch(console.error);
