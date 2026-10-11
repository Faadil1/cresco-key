import * as SecureStore from "expo-secure-store";

const PREFIX = "cresco-key:boundary:";

export type StoredBoundaryCapability = {
  requestId: string;
  relayToken: string;
};

export async function saveBoundaryCapability(
  value: StoredBoundaryCapability,
): Promise<void> {
  await SecureStore.setItemAsync(
    `${PREFIX}${value.requestId}`,
    JSON.stringify(value),
  );
}

export async function loadBoundaryCapability(
  requestId: string,
): Promise<StoredBoundaryCapability | null> {
  const raw = await SecureStore.getItemAsync(`${PREFIX}${requestId}`);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredBoundaryCapability;
    if (
      parsed.requestId !== requestId ||
      typeof parsed.relayToken !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function removeBoundaryCapability(
  requestId: string,
): Promise<void> {
  await SecureStore.deleteItemAsync(`${PREFIX}${requestId}`);
}

const LAST_YOUNG_SESSION_KEY = PREFIX + "last-young-session";
const HEX_32 = /^[0-9a-f]{64}$/i;

export type StoredBoundarySession = {
  requestId: string;
  relayToken: string;
  beneficiaryWallet: string;
  intentRaw: string;
};

/** Encrypted device-local continuity, never a new financial authority. */
export async function saveRecentYoungSession(
  session: StoredBoundarySession,
): Promise<void> {
  if (!HEX_32.test(session.requestId) || !HEX_32.test(session.relayToken) ||
      !session.beneficiaryWallet || !session.intentRaw.startsWith("solana:")) {
    throw new Error("INVALID_BOUNDARY_SESSION");
  }
  await SecureStore.setItemAsync(LAST_YOUNG_SESSION_KEY, JSON.stringify(session));
}

/** A session from another wallet is never returned or shown. */
export async function loadRecentYoungSession(
  connectedWallet: string,
): Promise<StoredBoundarySession | null> {
  if (!connectedWallet) return null;
  const raw = await SecureStore.getItemAsync(LAST_YOUNG_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredBoundarySession>;
    if (parsed.beneficiaryWallet !== connectedWallet ||
        typeof parsed.requestId !== "string" || !HEX_32.test(parsed.requestId) ||
        typeof parsed.relayToken !== "string" || !HEX_32.test(parsed.relayToken) ||
        typeof parsed.intentRaw !== "string" ||
        !parsed.intentRaw.startsWith("solana:")) {
      return null;
    }
    return parsed as StoredBoundarySession;
  } catch {
    return null;
  }
}
