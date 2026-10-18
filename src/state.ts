import {
  FlashLoanDashboardState,
  PoolTelemetry,
  FlashLoanActivityView,
  FlashLoanSimulation
} from "./types.js";

export class FlashLoanDashboardStore {
  private state: FlashLoanDashboardState;

  constructor() {
    this.state = {
      connectedWallet: null,
      chainId: 31337,
      pools: [
        {
          symbol: "USDC",
          totalLiquidityUsd: 25_000_000,
          totalShares: 25_000_000,
          feeBps: 9, // 0.09%
          volume24hUsd: 180_000_000,
          feesGenerated24hUsd: 162_000,
          lpApyPercent: 16.5,
          utilizationPercent: 88.4,
          isPaused: false
        },
        {
          symbol: "WETH",
          totalLiquidityUsd: 45_000_000,
          totalShares: 15_000,
          feeBps: 5, // 0.05%
          volume24hUsd: 320_000_000,
          feesGenerated24hUsd: 160_000,
          lpApyPercent: 12.8,
          utilizationPercent: 91.2,
          isPaused: false
        },
        {
          symbol: "WBTC",
          totalLiquidityUsd: 60_000_000,
          totalShares: 880,
          feeBps: 8, // 0.08%
          volume24hUsd: 140_000_000,
          feesGenerated24hUsd: 112_000,
          lpApyPercent: 11.2,
          utilizationPercent: 78.5,
          isPaused: false
        }
      ],
      activities: []
    };
  }

  public getState(): FlashLoanDashboardState {
    return {
      ...this.state,
      pools: this.state.pools.map(p => ({ ...p })),
      activities: [...this.state.activities]
    };
  }

  public connectWallet(address: string): void {
    if (!address || address.length < 10) {
      throw new Error("Invalid wallet address");
    }
    this.state.connectedWallet = address;
  }

  public disconnectWallet(): void {
    this.state.connectedWallet = null;
  }

  public recordActivity(activity: FlashLoanActivityView): void {
    this.state.activities.unshift(activity);
    if (this.state.activities.length > 50) {
      this.state.activities.pop();
    }
  }

  public updatePoolMetrics(symbol: string, newLiquidityUsd: number, additionalVolumeUsd: number): void {
    const pool = this.state.pools.find(p => p.symbol === symbol.toUpperCase());
    if (pool) {
      pool.totalLiquidityUsd = newLiquidityUsd;
      pool.volume24hUsd += additionalVolumeUsd;
      const additionalFees = (additionalVolumeUsd * pool.feeBps) / 10000;
      pool.feesGenerated24hUsd += additionalFees;
      if (pool.totalLiquidityUsd > 0) {
        pool.lpApyPercent = ((pool.feesGenerated24hUsd * 0.7 * 365) / pool.totalLiquidityUsd) * 100;
      }
    }
  }

  public simulateArbitrageFlashLoan(token: string, amount: number, expectedRevenue: number): FlashLoanSimulation {
    const pool = this.state.pools.find(p => p.symbol === token.toUpperCase());
    if (!pool) {
      throw new Error(`Unsupported token: ${token}`);
    }
    const estimatedFee = (amount * pool.feeBps) / 10000;
    const netProfit = expectedRevenue - amount - estimatedFee;

    return {
      token: pool.symbol,
      amount,
      estimatedFee,
      grossProfit: expectedRevenue - amount,
      netProfit,
      isProfitable: netProfit > 0
    };
  }
}
