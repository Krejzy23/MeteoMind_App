import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export async function exportCsvFile(
  fileName: string,
  content: string
): Promise<void> {
  const directory = FileSystem.cacheDirectory;

  if (!directory) {
    throw new Error("File system is not available.");
  }

  const fileUri = `${directory}${fileName}`;

  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (fileInfo.exists) {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  }

  await FileSystem.writeAsStringAsync(fileUri, content);

  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "text/csv",
    dialogTitle: "Export symptom entries",
    UTI: "public.comma-separated-values-text",
  });
}