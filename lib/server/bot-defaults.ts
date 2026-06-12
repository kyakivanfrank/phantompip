import { Bots } from "@/lib/types";

export const DEFAULT_BOTS: Bots = {
  neuralXTrend: {
    displayName: "Neural-X Trend",
    style: "Trend Following",
    riskLevel: "Medium Risk",
    isEnabled: false,
    settings: {
      stopLoss: 1.5,
      takeProfit: 3.0,
      maxDrawdown: 10.0,
      dailyLossLimit: 5.0,
      lotSize: 0.5,
    },
    activatedAt: null,
  },
  scalpAlpha: {
    displayName: "Scalp Alpha",
    style: "Scalping",
    riskLevel: "High Risk",
    isEnabled: false,
    settings: {
      stopLoss: 0.5,
      takeProfit: 1.0,
      maxDrawdown: 6.0,
      dailyLossLimit: 4.0,
      lotSize: 0.2,
    },
    activatedAt: null,
  },
  gridSentinel: {
    displayName: "Grid Sentinel",
    style: "Grid",
    riskLevel: "Low Risk",
    isEnabled: false,
    settings: {
      stopLoss: 2.0,
      takeProfit: 4.0,
      maxDrawdown: 15.0,
      dailyLossLimit: 6.0,
      lotSize: 0.1,
    },
    activatedAt: null,
  },
};
