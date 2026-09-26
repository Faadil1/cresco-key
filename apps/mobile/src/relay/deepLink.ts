import * as Linking from "expo-linking";

const HEX_32 = /^[0-9a-f]{64}$/i;

export type BoundaryDeepLink = {
  requestId: string;
  relayToken: string;
};

export function createBoundaryDeepLink(
  requestId: string,
  relayToken: string,
): string {
  if (!HEX_32.test(requestId) || !HEX_32.test(relayToken)) {
    throw new Error("INVALID_BOUNDARY_CAPABILITY");
  }

  return Linking.createURL("boundary", {
    queryParams: {
      requestId: requestId.toLowerCase(),
      token: relayToken.toLowerCase(),
    },
  });
}

export function parseBoundaryDeepLink(
  url: string,
): BoundaryDeepLink | null {
  const parsed = Linking.parse(url);
  if (parsed.path !== "boundary") return null;

  const requestId =
    typeof parsed.queryParams?.requestId === "string"
      ? parsed.queryParams.requestId
      : null;
  const relayToken =
    typeof parsed.queryParams?.token === "string"
      ? parsed.queryParams.token
      : null;

  if (!requestId || !relayToken) return null;
  if (!HEX_32.test(requestId) || !HEX_32.test(relayToken)) return null;

  return {
    requestId: requestId.toLowerCase(),
    relayToken: relayToken.toLowerCase(),
  };
}
