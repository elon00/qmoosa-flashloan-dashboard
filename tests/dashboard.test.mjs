import { test } from "node:test";
import assert from "node:assert/strict";
import { FlashLoanDashboardStore } from "../dist/index.js";

test("1. Store Initialization & Initial Pools", () => {
  const store = new FlashLoanDashboardStore();
  const state = store.getState();

  assert.equal(state.chainId, 31337);
  assert.equal(state.pools.length, 3);
  assert.equal(state.connectedWallet, null);

  const usdc = state.pools.find(p => p.symbol === "USDC");
  assert.ok(usdc);
  assert.equal(usdc.feeBps, 9);
  assert.equal(usdc.totalLiquidityUsd, 25_000_000);
});

test("2. Wallet Connection & Disconnection", () => {
  const store = new FlashLoanDashboardStore();

  store.connectWallet("0x1234567890abcdef1234567890abcdef12345678");
  assert.equal(store.getState().connectedWallet, "0x1234567890abcdef1234567890abcdef12345678");

  store.disconnectWallet();
  assert.equal(store.getState().connectedWallet, null);

  assert.throws(() => store.connectWallet("0xshort"), /Invalid wallet address/);
});

test("3. Activity Recording", () => {
  const store = new FlashLoanDashboardStore();
  store.recordActivity({
    id: "tx_1",
    token: "USDC",
    amountUsd: 1_000_000,
    feeUsd: 900,
    receiver: "0xArbitrageBot",
    timestamp: Date.now(),
    success: true
  });

  const state = store.getState();
  assert.equal(state.activities.length, 1);
  assert.equal(state.activities[0].amountUsd, 1_000_000);
});

test("4. Arbitrage Profitability Simulator", () => {
  const store = new FlashLoanDashboardStore();

  // Profitable arbitrage: borrow 100,000 USDC, revenue 101,000 USDC
  // Fee at 9 bps: 90 USDC -> net profit = 910 USDC
  const simProfitable = store.simulateArbitrageFlashLoan("USDC", 100_000, 101_000);
  assert.equal(simProfitable.isProfitable, true);
  assert.equal(simProfitable.estimatedFee, 90);
  assert.equal(simProfitable.netProfit, 910);

  // Unprofitable arbitrage: borrow 100,000 USDC, revenue 100,050 USDC
  // Fee at 9 bps: 90 USDC -> net loss = -40 USDC
  const simLoss = store.simulateArbitrageFlashLoan("USDC", 100_000, 100_050);
  assert.equal(simLoss.isProfitable, false);
  assert.equal(simLoss.netProfit, -40);
});
