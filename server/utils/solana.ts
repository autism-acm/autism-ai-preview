import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const AU_TOKEN_MINT = "B1oEzGes1QxVZoxR3abiwAyL4jcPRF2s2ok5Yerrpump";

export interface TokenBalance {
  balance: number;
  tier: "Free Trial" | "Electrum" | "Pro" | "Gold";
}

export async function getTokenBalance(walletAddress: string): Promise<TokenBalance> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const walletPublicKey = new PublicKey(walletAddress);
    const mintPublicKey = new PublicKey(AU_TOKEN_MINT);

    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: mintPublicKey }
    );

    let balance = 0;
    if (tokenAccounts.value.length > 0) {
      const accountInfo = tokenAccounts.value[0].account.data.parsed.info;
      balance = accountInfo.tokenAmount.uiAmount || 0;
    }

    // Determine tier based on balance
    let tier: "Free Trial" | "Electrum" | "Pro" | "Gold" = "Free Trial";
    if (balance >= 300000) {
      tier = "Gold";
    } else if (balance >= 200000) {
      tier = "Pro";
    } else if (balance >= 100000) {
      tier = "Electrum";
    }

    return { balance, tier };
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return { balance: 0, tier: "Free Trial" };
  }
}

export function getTierLimits(tier: string): { 
  messageLimit: number; 
  messagePeriodHours: number;
  voiceLimit: number; 
  voicePeriodHours: number;
} {
  switch (tier) {
    case "Gold":
      return { messageLimit: 50, messagePeriodHours: 1, voiceLimit: 240, voicePeriodHours: 24 };
    case "Pro":
      return { messageLimit: 40, messagePeriodHours: 1, voiceLimit: 120, voicePeriodHours: 24 };
    case "Electrum":
      return { messageLimit: 20, messagePeriodHours: 1, voiceLimit: 60, voicePeriodHours: 24 };
    default:
      // Free Trial: 5 messages per 4 hours, 1 voice message per 4 hours
      return { messageLimit: 5, messagePeriodHours: 4, voiceLimit: 1, voicePeriodHours: 4 };
  }
}
