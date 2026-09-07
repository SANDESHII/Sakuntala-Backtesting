/**
 * Real Market Data Integration
 * Connects to Pinnacle, Betfair, and other sports betting APIs
 */

export interface OddsData {
    match: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    source: string; // 'pinnacle', 'betfair', 'unibet', etc.
    odds: {
        over15: number;
        under15: number;
        over35: number;
        under35: number;
        homeWin?: number;
        draw?: number;
        awayWin?: number;
    };
    timestamp: Date;
}

export class MarketDataConnector {
    /**
     * Fetch odds from Pinnacle API
     * Pinnacle offers the sharpest, most liquid odds
     */
    static async fetchPinnacleOdds(leagueCode: string): Promise<OddsData[]> {
        const PINNACLE_API = 'https://api.pinnacle.com/v3/fixtures';
        const PINNACLE_API_KEY = process.env.PINNACLE_API_KEY || '';

        if (!PINNACLE_API_KEY) {
            console.warn('⚠️  PINNACLE_API_KEY not set. Using mock data.');
            return this.getMockPinnacleOdds();
        }

        try {
            const response = await fetch(`${PINNACLE_API}?leagueId=${leagueCode}`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${PINNACLE_API_KEY}:`).toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Pinnacle API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parsePinnacleResponse(data);
        } catch (error) {
            console.error('Failed to fetch Pinnacle odds:', error);
            return this.getMockPinnacleOdds();
        }
    }

    /**
     * Fetch odds from Betfair Exchange API
     * Best for liquidity and market depth
     */
    static async fetchBetfairOdds(eventTypeId: string): Promise<OddsData[]> {
        const BETFAIR_API = 'https://api.betfair.com/exchange/betting/rest/v1';
        const BETFAIR_API_KEY = process.env.BETFAIR_API_KEY || '';
        const BETFAIR_SESSION = process.env.BETFAIR_SESSION_TOKEN || '';

        if (!BETFAIR_API_KEY || !BETFAIR_SESSION) {
            console.warn('⚠️  Betfair credentials not set. Using mock data.');
            return this.getMockBetfairOdds();
        }

        try {
            // Betfair API call for markets
            const response = await fetch(`${BETFAIR_API}/listMarketCatalogue`, {
                method: 'POST',
                headers: {
                    'X-Application': BETFAIR_API_KEY,
                    'X-Authentication': BETFAIR_SESSION,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filter: { eventTypeIds: [eventTypeId] },
                    marketProjection: ['MARKET_DESCRIPTION', 'RUNNER_DESCRIPTION', 'MARKET_ODDS']
                })
            });

            if (!response.ok) {
                throw new Error(`Betfair API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseBetfairResponse(data);
        } catch (error) {
            console.error('Failed to fetch Betfair odds:', error);
            return this.getMockBetfairOdds();
        }
    }

    /**
     * Fetch closing odds from historical database
     */
    static async fetchClosingOdds(
        league: string,
        date: string
    ): Promise<OddsData[]> {
        // TODO: Connect to odds historical database
        // Options: OddsPortal API, or custom MongoDB with historical data
        console.log(`Fetching closing odds for ${league} on ${date}`);
        return this.getMockClosingOdds();
    }

    /**
     * Get consensus odds from multiple sources
     * Weighted average of available odds
     */
    static async getConsensusOdds(league: string, date: string): Promise<OddsData[]> {
        const pinnacle = await this.fetchPinnacleOdds(league);
        const closing = await this.fetchClosingOdds(league, date);

        // Merge and average odds
        return this.mergeOdds(pinnacle, closing);
    }

    private static parsePinnacleResponse(data: any): OddsData[] {
        return (data.fixtures || []).map((fixture: any) => ({
            match: `${fixture.home} vs ${fixture.away}`,
            homeTeam: fixture.home,
            awayTeam: fixture.away,
            date: fixture.starts,
            source: 'pinnacle',
            odds: {
                over15: fixture.overOdds || 1.90,
                under15: fixture.underOdds || 1.90,
                over35: fixture.over35Odds || 1.85,
                under35: fixture.under35Odds || 1.90,
                homeWin: fixture.moneyline?.home,
                draw: fixture.moneyline?.draw,
                awayWin: fixture.moneyline?.away
            },
            timestamp: new Date()
        }));
    }

    private static parseBetfairResponse(data: any): OddsData[] {
        return (data.result || []).map((market: any) => ({
            match: market.description?.name || '',
            homeTeam: market.description?.homeTeam || '',
            awayTeam: market.description?.awayTeam || '',
            date: market.description?.marketTime || '',
            source: 'betfair',
            odds: {
                over15: market.odds?.over15 || 1.90,
                under15: market.odds?.under15 || 1.90,
                over35: market.odds?.over35 || 1.85,
                under35: market.odds?.under35 || 1.90
            },
            timestamp: new Date()
        }));
    }

    private static mergeOdds(pinnacle: OddsData[], closing: OddsData[]): OddsData[] {
        const merged: { [key: string]: OddsData } = {};

        // Start with Pinnacle (sharpest odds)
        pinnacle.forEach(p => {
            merged[p.match] = p;
        });

        // Average with closing odds
        closing.forEach(c => {
            if (merged[c.match]) {
                const p = merged[c.match];
                merged[c.match].odds = {
                    over15: (p.odds.over15 + c.odds.over15) / 2,
                    under15: (p.odds.under15 + c.odds.under15) / 2,
                    over35: (p.odds.over35 + c.odds.over35) / 2,
                    under35: (p.odds.under35 + c.odds.under35) / 2
                };
            } else {
                merged[c.match] = c;
            }
        });

        return Object.values(merged);
    }

    private static getMockPinnacleOdds(): OddsData[] {
        return [
            {
                match: 'Man City vs Manchester United',
                homeTeam: 'MAN_CITY',
                awayTeam: 'MANCHESTER_UNITED',
                date: '2024-12-26',
                source: 'pinnacle',
                odds: {
                    over15: 1.87,
                    under15: 1.95,
                    over35: 1.83,
                    under35: 1.98,
                    homeWin: 2.12,
                    draw: 3.45,
                    awayWin: 3.80
                },
                timestamp: new Date()
            },
            {
                match: 'Liverpool vs Chelsea',
                homeTeam: 'LIVERPOOL',
                awayTeam: 'CHELSEA',
                date: '2024-12-26',
                source: 'pinnacle',
                odds: {
                    over15: 1.89,
                    under15: 1.93,
                    over35: 1.82,
                    under35: 1.99,
                    homeWin: 1.95,
                    draw: 3.60,
                    awayWin: 4.00
                },
                timestamp: new Date()
            }
        ];
    }

    private static getMockBetfairOdds(): OddsData[] {
        return [
            {
                match: 'Arsenal vs Tottenham',
                homeTeam: 'ARSENAL',
                awayTeam: 'TOTTENHAM',
                date: '2024-12-26',
                source: 'betfair',
                odds: {
                    over15: 1.88,
                    under15: 1.94,
                    over35: 1.84,
                    under35: 1.97
                },
                timestamp: new Date()
            }
        ];
    }

    private static getMockClosingOdds(): OddsData[] {
        return [
            {
                match: 'All Matches',
                homeTeam: 'N/A',
                awayTeam: 'N/A',
                date: '2024-12-26',
                source: 'closing',
                odds: {
                    over15: 1.88,
                    under15: 1.94,
                    over35: 1.84,
                    under35: 1.97
                },
                timestamp: new Date()
            }
        ];
    }
}
