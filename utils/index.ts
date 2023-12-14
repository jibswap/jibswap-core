import { ContractTransactionResponse } from "ethers";

export * from "./contracts";

export async function ensureFinished(
  tx: ContractTransactionResponse | Promise<ContractTransactionResponse>,
  confirms: number = 1
) {
  return (await tx).wait(confirms);
}

export function mapLazy<T>(x: T | (() => T)): T {
  return (x instanceof Function ? x() : x) as T;
}

export function getEnvironment(envName: string, defaultValue: string | null | "no-raise-error" = null) {
  return () => {
    const original = process.env[envName];
    const env = original === "no-raise-error" ? "" : original || defaultValue;
    if (env === null) {
      throw new Error(`Value in environment variable ${envName} is not available`);
    }
    return env;
  };
}
