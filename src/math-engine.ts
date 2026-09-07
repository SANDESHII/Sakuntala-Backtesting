/**
 * Dixon-Coles Probability Engine
 * Calculates match probabilities based on expected goals (xG)
 */

export class DixonColes {
    /**
     * Poisson probability: P(X=k) where X ~ Poisson(lambda)
     */
    static poisson(k: number, lambda: number): number {
        if (lambda <= 0) return k === 0 ? 1 : 0;
        if (k < 0) return 0;
        
        let logFact = 0;
        for (let i = 2; i <= k; i++) logFact += Math.log(i);
        
        return Math.exp(k * Math.log(lambda) - logFact - lambda);
    }

    /**
     * Tau adjustment: Correlation between home/away goals
     */
    static tau(x: number, y: number, lambda: number, mu: number, rho: number): number {
        let v = 1;
        if (x === 0 && y === 0) v = 1 - lambda * mu * rho;
        else if (x === 0 && y === 1) v = 1 + lambda * rho;
        else if (x === 1 && y === 0) v = 1 + mu * rho;
        else if (x === 1 && y === 1) v = 1 - rho;
        return v > 0 ? v : 0.0001;
    }

    /**
     * Calculate full score probability matrix
     */
    static calculateScoreMatrix(
        homeLambda: number,
        awayMu: number,
        rho: number = -0.11,
        maxScore: number = 8
    ): number[][] {
        const matrix = Array.from({ length: maxScore + 1 }, (_, h) =>
            Array.from({ length: maxScore + 1 }, (_, a) =>
                this.poisson(h, homeLambda) *
                this.poisson(a, awayMu) *
                this.tau(h, a, homeLambda, awayMu, rho)
            )
        );

        const sum = matrix.reduce((acc, row) => acc + row.reduce((ra, p) => ra + p, 0), 0);
        return matrix.map(row => row.map(p => p / (sum || 1)));
    }

    /**
     * Calculate Over/Under probability
     */
    static calculateOverUnder(matrix: number[][], threshold: number): number {
        return matrix.reduce(
            (acc, row, h) =>
                acc + row.reduce((ra, p, a) => ra + (h + a > threshold ? p : 0), 0),
            0
        );
    }

    /**
     * Fit rho (correlation) to historical data using MLE
     */
    static fitRho(
        matches: Array<{
            x: number;
            y: number;
            lambda: number;
            mu: number;
            weight?: number;
        }>
    ): { rho: number; sigmaRho: number } {
        let rho = -0.11;
        let finalCurvature = 0;

        for (let i = 0; i < 50; i++) {
            let gradient = 0;
            let curvature = 0;

            for (const { x, y, lambda: l, mu: m, weight = 1.0 } of matches) {
                const t = this.tau(x, y, l, m, rho);
                let d1 = 0,
                    d2 = 0;

                if (x === 0 && y === 0) {
                    d1 = (-l * m) / t;
                    d2 = -(l * m) ** 2 / (t * t);
                } else if (x === 0 && y === 1) {
                    d1 = l / t;
                    d2 = -(l * l) / (t * t);
                } else if (x === 1 && y === 0) {
                    d1 = m / t;
                    d2 = -(m * m) / (t * t);
                } else if (x === 1 && y === 1) {
                    d1 = -1 / t;
                    d2 = 1 / (t * t);
                }

                gradient += d1 * weight;
                curvature += d2 * weight;
            }

            finalCurvature = curvature;
            if (Math.abs(curvature) < 1e-10) break;

            const delta = gradient / curvature;
            rho = Math.max(-0.25, Math.min(0.25, rho - delta));

            if (Math.abs(delta) < 1e-6) break;
        }

        return {
            rho,
            sigmaRho: finalCurvature < 0 ? Math.sqrt(-1 / finalCurvature) : 0.05
        };
    }
}

/**
 * Monte Carlo simulation for confidence intervals
 */
export class MonteCarloSimulator {
    static run(
        homeLambda: number,
        awayMu: number,
        threshold: number = 1.5,
        isUnder: boolean = false,
        rho: number = -0.11,
        iterations: number = 10000
    ): { mean: number; median: number; confidenceInterval: [number, number] } {
        const matrix = DixonColes.calculateScoreMatrix(homeLambda, awayMu, rho);
        const outcomes: { hit: boolean; p: number }[] = [];

        for (let h = 0; h <= 8; h++) {
            for (let a = 0; a <= 8; a++) {
                outcomes.push({
                    hit: isUnder ? h + a < threshold : h + a > threshold,
                    p: matrix[h][a]
                });
            }
        }

        let hits = 0;
        for (let i = 0; i < iterations; i++) {
            const rand = Math.random();
            let cumulative = 0;

            for (const outcome of outcomes) {
                cumulative += outcome.p;
                if (rand <= cumulative) {
                    if (outcome.hit) hits++;
                    break;
                }
            }
        }

        const mean = hits / iterations;
        const ci95 = 1.96 * Math.sqrt((mean * (1 - mean)) / iterations);

        return {
            mean,
            median: mean,
            confidenceInterval: [Math.max(0, mean - ci95), Math.min(1, mean + ci95)]
        };
    }
}
