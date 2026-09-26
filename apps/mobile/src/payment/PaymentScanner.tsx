import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  parseSolanaPayTransferRequest,
  type SolanaPayTransferIntent,
} from "./solanaPay";

type Props = {
  onIntent: (intent: SolanaPayTransferIntent) => void;
  onCancel: () => void;
};

export function PaymentScanner({ onIntent, onCancel }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Scan a payment request</Text>
        <Text style={styles.body}>
          Camera access is used only to read QR payment requests.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={onCancel}>
          <Text>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          locked
            ? undefined
            : ({ data }) => {
                try {
                  const intent = parseSolanaPayTransferRequest(data);
                  setLocked(true);
                  setError(null);
                  onIntent(intent);
                } catch (scanError) {
                  setError(
                    scanError instanceof Error
                      ? scanError.message
                      : "INVALID_PAYMENT_REQUEST",
                  );
                }
              }
        }
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Scan Solana Pay</Text>
        <Text style={styles.overlayBody}>
          P0 accepts exact SPL-token requests with a fixed positive amount.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.overlayButton} onPress={onCancel}>
          <Text style={styles.overlayButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 23, textAlign: "center" },
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontWeight: "700" },
  overlay: {
    marginTop: "auto",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.76)",
    gap: 10,
  },
  overlayTitle: { color: "white", fontSize: 24, fontWeight: "700" },
  overlayBody: { color: "white", fontSize: 14, lineHeight: 20 },
  error: { color: "white", fontWeight: "700" },
  overlayButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayButtonText: { color: "white", fontWeight: "700" },
});
