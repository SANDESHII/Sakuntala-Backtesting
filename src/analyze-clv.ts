/**
 * CLV Deep-Dive Analysis
 * Analyzes Closing Line Value patterns and opportunities
 */

import { DataLoader } from './data-loader';
import { SimulationEngine } from './simulation';

async function analyzeCLV() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           💰 CLOSING LINE VALUE (CLV) ANALYSIS                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // Load and run simulation
        const allMatches = DataLoader.getMockEPLData();
        const stats = DataLoader.extractStats(allMatches);
        const report = await SimulationEngine.runSimulation(
            allMatches.slice(-26),
            stats.rhoData
        );

        // Analyze CLV patterns
        const matches = report.matches.sort((a: any, b: any) => b.clv - a.clv);

        console.log('📊 TOP 10 HIGHEST CLV OPPORTUNITIES');
        console.log('─────────────────────────────────────────────────────────────');
        matches.slice(0, 10).forEach((m: any, i: number) => {
            const homeTeam = m.match.homeTeam.replace(/_/g, ' ');
            const awayTeam = m.match.awayTeam.replace(/_/g, ' ');
            const outcome = m.actualOutcome ? '✅' : '❌';
            console.log(
                `${i + 1}. ${homeTeam} vs ${awayTeam} | CLV: ${m.clv.toFixed(2)}% | Result: ${m.actualScore[0]}-${m.actualScore[1]} ${outcome}`
            );
        });

        console.log('\n📊 TOP 10 LOWEST CLV OPPORTUNITIES');
        console.log('─────────────────────────────────────────────────────────────');
        matches.slice(-10).reverse().forEach((m: any, i: number) => {
            const homeTeam = m.match.homeTeam.replace(/_/g, ' ');
            const awayTeam = m.match.awayTeam.replace(/_/g, ' ');
            const outcome = m.actualOutcome ? '✅' : '❌';
            console.log(
                `${i + 1}. ${homeTeam} vs ${awayTeam} | CLV: ${m.clv.toFixed(2)}% | Result: ${m.actualScore[0]}-${m.actualScore[1]} ${outcome}`
            );
        });

        // CLV distribution
        console.log('\n📈 CLV DISTRIBUTION');
        console.log('─────────────────────────────────────────────────────────────');
        const positiveCLV = matches.filter((m: any) => m.clv > 0);
        const negativeCLV = matches.filter((m: any) => m.clv <= 0);
        const positiveCLVWins = positiveCLV.filter((m: any) => m.actualOutcome);
        const negativeCLVWins = negativeCLV.filter((m: any) => m.actualOutcome);

        console.log(`Positive CLV Bets:    ${positiveCLV.length} (${(positiveCLV.length / matches.length * 100).toFixed(1)}%)`);
        console.log(`  ├─ Wins:            ${positiveCLVWins.length} (${(positiveCLVWins.length / Math.max(1, positiveCLV.length) * 100).toFixed(1)}%)`);
        console.log(`  └─ Avg CLV:         ${(positiveCLV.reduce((a: any, m: any) => a + m.clv, 0) / Math.max(1, positiveCLV.length)).toFixed(2)}%`);
        console.log(`\nNegative CLV Bets:    ${negativeCLV.length} (${(negativeCLV.length / matches.length * 100).toFixed(1)}%)`);
        console.log(`  ├─ Wins:            ${negativeCLVWins.length} (${(negativeCLVWins.length / Math.max(1, negativeCLV.length) * 100).toFixed(1)}%)`);
        console.log(`  └─ Avg CLV:         ${(negativeCLV.reduce((a: any, m: any) => a + m.clv, 0) / Math.max(1, negativeCLV.length)).toFixed(2)}%`);

        console.log('\n✅ CLV analysis complete!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

analyzeCLV().catch(console.error);
