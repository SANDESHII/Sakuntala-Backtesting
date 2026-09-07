# 🎯 Sakuntala Backtesting Framework

**Real-time simulation & backtesting for Alpha Terminal (Quantitative Football Prediction AI)**

This repo runs your Dixon-Coles + Neural xG module against historical EPL data to calculate:
- **CLV** (Closing Line Value) — Is your model finding +EV lines?
- **Brier Score** — How well-calibrated are your probabilities?
- **ROI** — What would your profit/loss be?
- **Win Rate** — Accuracy on Over 1.5 / Under 3.5 markets

---

## 📊 Quick Start

```bash
# Install dependencies
npm install

# Run EPL backtest (last 26 games)
npm run backtest:epl

# Run all leagues
npm run backtest:all

# Deep CLV analysis
npm run analyze:clv
```

---

## 📈 Expected Output

```
╔════════════════════════════════════════════════════════════════╗
║           🎯 REALTIME SIMULATION REPORT                       ║
╚════════════════════════════════════════════════════════════════╝

📊 PREDICTION ACCURACY
─────────────────────────────────────
  Over 1.5 Accuracy:     58.33%
  Under 3.5 Accuracy:    61.54%
  Brier Score:           0.2145 (lower is better)
  Calibration RMSE:      0.4632

💰 CLOSING LINE VALUE (CLV)
─────────────────────────────────────
  Avg CLV:               3.42%
  Positive CLV Bets:     18 of 26
  CLV Win Rate:          66.67%
  Cumulative CLV:        61.56%

🎲 BETTING PERFORMANCE
─────────────────────────────────────
  Total Bets Placed:     18
  Win Rate:              61.11%
  Wins / Losses:         11W - 7L
  Total Staked:          1800 units
  Total Profit/Loss:     +225.50 units
  ROI:                   12.53%
  Profit Factor:         2.35x

🎯 PERFORMANCE BY EDGE SIZE
─────────────────────────────────────
  Low Edge (0-3%)
    Count: 5 | Accuracy: 60.00% | Avg CLV: 1.23% | ROI: 5.20%
  Mid Edge (3-7%)
    Count: 8 | Accuracy: 62.50% | Avg CLV: 3.65% | ROI: 11.30%
  High Edge (7-12%)
    Count: 4 | Accuracy: 75.00% | Avg CLV: 5.12% | ROI: 18.50%
  Extreme (12%+)
    Count: 1 | Accuracy: 100.00% | Avg CLV: 7.84% | ROI: 32.10%
```

---

## 🔧 Architecture

```
src/
  types.ts                    # TypeScript definitions
  math-engine.ts              # Dixon-Coles probability engine
  data-loader.ts              # Load EPL historical data
  simulation.ts               # Core backtesting logic
  backtest-epl.ts             # EPL-specific backtest script
  backtest-all-leagues.ts     # Multi-league runner
  analyze-clv.ts              # CLV deep-dive analysis
  index.ts                    # Main entry point
```

---

## 📌 Key Metrics Explained

### **Brier Score**
- Formula: `(predicted_prob - actual_outcome)²`
- 0.25 = Random guess (50% prediction on binary outcome)
- < 0.20 = Excellent calibration
- 0.20-0.23 = Good
- > 0.25 = Worse than random

### **CLV (Closing Line Value)**
- Formula: `(model_prob - market_prob) / market_prob × 100`
- Positive CLV = Your model is finding value the market misses
- 3-5% avg CLV = Professional-grade edge
- > 5% = Exceptional

### **ROI (Return on Investment)**
- Formula: `(profit / total_staked) × 100`
- 5-10% ROI = Very good (long-term sustainable)
- 10-15% ROI = Excellent
- > 15% ROI = Exceptional (but likely smaller sample)

---

## 🎯 Next Steps

1. **Integrate Real Market Odds** → Connect Pinnacle/Betfair API
2. **Multi-Market Analysis** → Test on Asian Handicap, ML, GG/NG
3. **Parameter Tuning** → Optimize Kelly fraction, edge thresholds
4. **Walk-Forward Testing** → Monthly rebalancing
5. **Statistical Significance** → Confidence intervals on metrics

---

## 📞 Contact

Built by **@copilot** for **SANDESHII**
