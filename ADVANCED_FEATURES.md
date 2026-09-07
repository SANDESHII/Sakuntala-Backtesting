# 🚀 Advanced Features

## Parameter Optimization

Tune your module's performance by optimizing key parameters:

### Grid Search
```bash
npm run optimize -- grid
```

Tries all combinations of:
- **Kelly Fraction**: 0.05 to 0.30 (bet sizing)
- **Edge Threshold**: 0.01 to 0.05 (minimum profitable edge)
- **Min Odds**: 1.50 to 2.00 (minimum market odds)
- **Model Trust**: 0.3 to 0.9 (weight on model vs market)

### Bayesian Optimization (Faster)
```bash
npm run optimize -- bayesian
```

Uses Gaussian Process to find optimal region efficiently (30 iterations vs 100+)

---

## Market Data Integration

Connect to real betting markets:

```bash
npm run market-data
```

### Supported Exchanges
- **Pinnacle** (sharpest odds, 2.5% overround)
- **Betfair** (high liquidity, decimal odds)
- **Unibet** (secondary sharp odds)

### API Configuration

Set environment variables:
```bash
export PINNACLE_API_KEY=your_key
export BETFAIR_API_KEY=your_key
export BETFAIR_SESSION_TOKEN=your_token
```

### Features
- Automatic consensus odds from multiple sources
- Historical closing odds lookup
- Overround calculation and removal
- Real CLV calculation

---

## Performance Reporting

Generate comprehensive HTML reports:

```bash
npm run generate-report
```

### Metrics Included
- **Sharpe Ratio** (risk-adjusted returns)
- **Max Drawdown** (worst losing streak)
- **Consistency Index** (win rate)
- **Recovery Period** (time to recover losses)
- **Cumulative Returns** (total profit)

---

## Example Workflow

```bash
# 1. Run baseline simulation
npm run dev

# 2. Optimize parameters (takes ~2-3 minutes)
npm run optimize -- bayesian

# 3. Connect to real market data
npm run market-data

# 4. Generate final performance report
npm run generate-report
```

---

## Interpretation Guide

### Good Performance Indicators
✅ **ROI > 5%** = Profitable strategy  
✅ **Sharpe Ratio > 1.0** = Good risk-adjusted returns  
✅ **Win Rate > 55%** = Consistent edge  
✅ **Avg CLV > 3%** = Finding genuine +EV spots  
✅ **Max Drawdown < 20%** = Manageable volatility  

### Red Flags
❌ **ROI < 0%** = Losing money  
❌ **Brier Score > 0.25** = Worse than random  
❌ **Avg CLV < 0%** = Getting bad lines  
❌ **Sharpe Ratio < 0.5** = Too much risk  

---

## Next Steps

1. **Integrate Real Data** → Connect to your data providers
2. **Walk-Forward Testing** → Monthly/weekly rebalancing
3. **Live Testing** → Small stakes on real money
4. **Scale Up** → Increase stakes gradually
5. **Monitor Metrics** → Track CLV, ROI, Sharpe daily

