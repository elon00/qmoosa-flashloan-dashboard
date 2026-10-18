export interface PoolTelemetry {
  symbol: string;
  totalLiquidityUsd: number;
  totalShares: number;
  feeBps: number;
  volume24hUsd: number;
  feesGenerated24hUsd: number;
  lpApyPercent: number;
  utilizationPercent: number;
  isPaused: boolean;
}

export interface FlashLoanActivityView {
  id: string;
  token: string;
  amountUsd: number;
  feeUsd: number;
  receiver: string;
  timestamp: number;
  success: boolean;
}

export interface FlashLoanSimulation {
  token: string;
  amount: number;
  estimatedFee: number;
  grossProfit: number;
  netProfit: number;
  isProfitable: boolean;
}

export interface FlashLoanDashboardState {
  connectedWallet: string | null;
  chainId: number;
  pools: PoolTelemetry[];
  activities: FlashLoanActivityView[];
}
