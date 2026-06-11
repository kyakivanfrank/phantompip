import { Bots } from "@/lib/types";

export const DEFAULT_BOTS: Bots = {
  neuralXTrend: {
    displayName: "Neural-X Trend",
    style: "Trend Following",
    riskLevel: "Medium Risk",
    isActive: false,
    settings: {
      stopLossPercent: 1.5,
      takeProfitPercent: 3.0,
      maxDrawdownPercent: 10.0,
      dailyLossLimitPercent: 5.0,
      lotSize: 0.5,
    },
    activatedAt: null,
  },
  scalpAlpha: {
    displayName: "Scalp Alpha",
    style: "Scalping",
    riskLevel: "High Risk",
    isActive: false,
    settings: {
      stopLossPercent: 0.5,
      takeProfitPercent: 1.0,
      maxDrawdownPercent: 6.0,
      dailyLossLimitPercent: 4.0,
      lotSize: 0.2,
    },
    activatedAt: null,
  },
  gridSentinel: {
    displayName: "Grid Sentinel",
    style: "Grid",
    riskLevel: "Low Risk",
    isActive: false,
    settings: {
      stopLossPercent: 2.0,
      takeProfitPercent: 4.0,
      maxDrawdownPercent: 15.0,
      dailyLossLimitPercent: 6.0,
      lotSize: 0.1,
    },
    activatedAt: null,
  },
};
