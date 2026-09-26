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
