/**
 * EPL Historical Data Loader
 * Simulates loading real match data
 */

import { MatchHistory, RhoData } from './types';
import { DATA_CONSTANTS, LEAGUE_CONVERSION_RATES } from './constants';

export class DataLoader {
    /**
     * Mock EPL data (last 26 games from 2024-25 season)
     * In production, this would fetch from an API
     */
    static getMockEPLData(): MatchHistory[] {
        return [
            {
                date: '2024-12-26',
                homeTeam: 'MAN_CITY',
                awayTeam: 'MANCHESTER_UNITED',
                homeGoals: 2,
                awayGoals: 1,
                homeXG: 2.1,
                awayXG: 0.8,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 7,
                awayShotsOnTarget: 4,
                league: 'EPL'
            },
            {
                date: '2024-12-26',
                homeTeam: 'LIVERPOOL',
                awayTeam: 'CHELSEA',
                homeGoals: 3,
                awayGoals: 1,
                homeXG: 2.8,
                awayXG: 1.2,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 9,
                awayShotsOnTarget: 5,
                league: 'EPL'
            },
            {
                date: '2024-12-26',
                homeTeam: 'ARSENAL',
                awayTeam: 'TOTTENHAM',
                homeGoals: 2,
                awayGoals: 2,
                homeXG: 2.3,
                awayXG: 2.1,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 8,
                awayShotsOnTarget: 7,
                league: 'EPL'
            },
            {
                date: '2024-12-29',
                homeTeam: 'MAN_CITY',
                awayTeam: 'EVERTON',
                homeGoals: 1,
                awayGoals: 0,
                homeXG: 1.9,
                awayXG: 0.6,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 6,
                awayShotsOnTarget: 2,
                league: 'EPL'
            },
            {
                date: '2024-12-29',
                homeTeam: 'NEWCASTLE',
                awayTeam: 'BRIGHTON',
                homeGoals: 3,
                awayGoals: 2,
                homeXG: 2.5,
                awayXG: 1.8,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 8,
                awayShotsOnTarget: 6,
                league: 'EPL'
            },
            {
                date: '2025-01-01',
                homeTeam: 'LIVERPOOL',
                awayTeam: 'MAN_UNITED',
                homeGoals: 2,
                awayGoals: 2,
                homeXG: 2.2,
                awayXG: 1.9,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 7,
                awayShotsOnTarget: 6,
                league: 'EPL'
            },
            {
                date: '2025-01-01',
                homeTeam: 'CHELSEA',
                awayTeam: 'FULHAM',
                homeGoals: 3,
                awayGoals: 1,
                homeXG: 2.6,
                awayXG: 0.9,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 9,
                awayShotsOnTarget: 4,
                league: 'EPL'
            },
            {
                date: '2025-01-04',
                homeTeam: 'ARSENAL',
                awayTeam: 'MAN_CITY',
                homeGoals: 2,
                awayGoals: 1,
                homeXG: 2.1,
                awayXG: 1.8,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 7,
                awayShotsOnTarget: 6,
                league: 'EPL'
            },
            {
                date: '2025-01-04',
                homeTeam: 'TOTTENHAM',
                awayTeam: 'LIVERPOOL',
                homeGoals: 1,
                awayGoals: 3,
                homeXG: 1.5,
                awayXG: 2.7,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 5,
                awayShotsOnTarget: 9,
                league: 'EPL'
            },
            {
                date: '2025-01-11',
                homeTeam: 'CHELSEA',
                awayTeam: 'BRIGHTON',
                homeGoals: 2,
                awayGoals: 1,
                homeXG: 2.2,
                awayXG: 1.1,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 8,
                awayShotsOnTarget: 4,
                league: 'EPL'
            },
            {
                date: '2025-01-11',
                homeTeam: 'MAN_UNITED',
                awayTeam: 'NEWCASTLE',
                homeGoals: 0,
                awayGoals: 2,
                homeXG: 1.3,
                awayXG: 2.4,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 4,
                awayShotsOnTarget: 7,
                league: 'EPL'
            },
            {
                date: '2025-01-15',
                homeTeam: 'LIVERPOOL',
                awayTeam: 'FULHAM',
                homeGoals: 4,
                awayGoals: 0,
                homeXG: 3.1,
                awayXG: 0.5,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 11,
                awayShotsOnTarget: 2,
                league: 'EPL'
            },
            {
                date: '2025-01-15',
                homeTeam: 'ARSENAL',
                awayTeam: 'EVERTON',
                homeGoals: 2,
                awayGoals: 0,
                homeXG: 2.5,
                awayXG: 0.7,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 8,
                awayShotsOnTarget: 3,
                league: 'EPL'
            },
            {
                date: '2025-01-18',
                homeTeam: 'MAN_CITY',
                awayTeam: 'TOTTENHAM',
                homeGoals: 2,
                awayGoals: 1,
                homeXG: 2.2,
                awayXG: 1.4,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 7,
                awayShotsOnTarget: 5,
                league: 'EPL'
            },
            {
                date: '2025-01-18',
                homeTeam: 'BRIGHTON',
                awayTeam: 'CHELSEA',
                homeGoals: 1,
                awayGoals: 3,
                homeXG: 1.2,
                awayXG: 2.8,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 5,
                awayShotsOnTarget: 9,
                league: 'EPL'
            },
            {
                date: '2025-01-25',
                homeTeam: 'NEWCASTLE',
                awayTeam: 'ARSENAL',
                homeGoals: 1,
                awayGoals: 0,
                homeXG: 1.6,
                awayXG: 1.9,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 5,
                awayShotsOnTarget: 6,
                league: 'EPL'
            },
            {
                date: '2025-01-25',
                homeTeam: 'FULHAM',
                awayTeam: 'MAN_UNITED',
                homeGoals: 2,
                awayGoals: 1,
                homeXG: 2.0,
                awayXG: 1.3,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 7,
                awayShotsOnTarget: 5,
                league: 'EPL'
            },
            {
                date: '2025-02-01',
                homeTeam: 'CHELSEA',
                awayTeam: 'NEWCASTLE',
                homeGoals: 3,
                awayGoals: 0,
                homeXG: 2.7,
                awayXG: 0.8,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 9,
                awayShotsOnTarget: 3,
                league: 'EPL'
            },
            {
                date: '2025-02-01',
                homeTeam: 'EVERTON',
                awayTeam: 'LIVERPOOL',
                homeGoals: 1,
                awayGoals: 2,
                homeXG: 1.4,
                awayXG: 2.2,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 5,
                awayShotsOnTarget: 7,
                league: 'EPL'
            },
            {
                date: '2025-02-08',
                homeTeam: 'MAN_CITY',
                awayTeam: 'BRIGHTON',
                homeGoals: 2,
                awayGoals: 0,
                homeXG: 2.3,
                awayXG: 0.6,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 8,
                awayShotsOnTarget: 2,
                league: 'EPL'
            },
            {
                date: '2025-02-08',
                homeTeam: 'TOTTENHAM',
                awayTeam: 'FULHAM',
                homeGoals: 3,
                awayGoals: 2,
                homeXG: 2.4,
                awayXG: 1.8,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 8,
                awayShotsOnTarget: 6,
                league: 'EPL'
            },
            {
                date: '2025-02-15',
                homeTeam: 'ARSENAL',
                awayTeam: 'CHELSEA',
                homeGoals: 2,
                awayGoals: 2,
                homeXG: 2.2,
                awayXG: 2.0,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 7,
                awayShotsOnTarget: 7,
                league: 'EPL'
            },
            {
                date: '2025-02-15',
                homeTeam: 'LIVERPOOL',
                awayTeam: 'MAN_CITY',
                homeGoals: 1,
                awayGoals: 1,
                homeXG: 1.8,
                awayXG: 1.9,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 6,
                awayShotsOnTarget: 6,
                league: 'EPL'
            },
            {
                date: '2025-02-22',
                homeTeam: 'BRIGHTON',
                awayTeam: 'TOTTENHAM',
                homeGoals: 2,
                awayGoals: 1,
                homeXG: 1.9,
                awayXG: 1.5,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 6,
                awayShotsOnTarget: 5,
                league: 'EPL'
            },
            {
                date: '2025-02-22',
                homeTeam: 'MAN_UNITED',
                awayTeam: 'CHELSEA',
                homeGoals: 1,
                awayGoals: 1,
                homeXG: 1.6,
                awayXG: 1.7,
                homeRedCards: 0,
                awayRedCards: 0,
                homeShotsOnTarget: 5,
                awayShotsOnTarget: 6,
                league: 'EPL'
            }
        ];
    }

    /**
     * Extract league-wide statistics from matches
     */
    static extractStats(matches: MatchHistory[]): {
        avgHomeGoals: number;
        avgAwayGoals: number;
        avgHomeXG: number;
        avgAwayXG: number;
        rhoData: RhoData;
    } {
        const totalHomeGoals = matches.reduce((acc, m) => acc + (m.homeGoals || 0), 0);
        const totalAwayGoals = matches.reduce((acc, m) => acc + (m.awayGoals || 0), 0);
        const totalHomeXG = matches.reduce((acc, m) => acc + (m.homeXG || 0), 0);
        const totalAwayXG = matches.reduce((acc, m) => acc + (m.awayXG || 0), 0);

        const avgHomeGoals = totalHomeGoals / matches.length;
        const avgAwayGoals = totalAwayGoals / matches.length;
        const avgHomeXG = totalHomeXG / matches.length;
        const avgAwayXG = totalAwayXG / matches.length;

        // Simple rho estimation from recent matches
        const recentMatches = matches.slice(-100);
        let correlationSum = 0;
        recentMatches.forEach(m => {
            const homeDeviation = (m.homeGoals || 0) - avgHomeGoals;
            const awayDeviation = (m.awayGoals || 0) - avgAwayGoals;
            correlationSum += homeDeviation * awayDeviation;
        });
        const rho = correlationSum / recentMatches.length / (Math.sqrt(1.1) * Math.sqrt(1.1));

        return {
            avgHomeGoals,
            avgAwayGoals,
            avgHomeXG,
            avgAwayXG,
            rhoData: { rho: Math.max(-0.25, Math.min(0.25, rho)), sigmaRho: 0.05 }
        };
    }
}
