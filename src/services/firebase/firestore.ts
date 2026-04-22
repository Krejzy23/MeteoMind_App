import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";
import { UserSettings } from "@/types/user";


const DEFAULT_SETTINGS: UserSettings = {
  forecastAlertsEnabled: true,
  predictionHighlightEnabled: true,
  dailySummaryEnabled: false,
  temperatureUnit: "celsius",
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const ref = doc(db, "users", userId, "settings", "app");
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...snapshot.data(),
  } as UserSettings;
}

export async function savePushToken(
  userId: string,
  token: string,
  platform: string
) {
  const ref = doc(db, "users", userId, "devices", "primary");

  await setDoc(
    ref,
    {
      expoPushToken: token,
      platform,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveUserSettings(
  userId: string,
  settings: UserSettings
): Promise<void> {
  const ref = doc(db, "users", userId, "settings", "app");

  await setDoc(
    ref,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveSymptomEntry(
  userId: string,
  payload: Record<string, unknown>
) {
  const ref = collection(db, "users", userId, "symptomEntries");

  await addDoc(ref, {
    ...payload,
    createdAtServer: serverTimestamp(),
  });
}

export async function getSymptomEntries(userId: string) {
  const ref = collection(db, "users", userId, "symptomEntries");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function getSymptomEntryById(userId: string, entryId: string) {
  const ref = doc(db, "users", userId, "symptomEntries", entryId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("Entry not found");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function deleteSymptomEntry(userId: string, entryId: string) {
  const ref = doc(db, "users", userId, "symptomEntries", entryId);
  await deleteDoc(ref);
}

export async function deleteAllSymptomEntries(userId: string): Promise<number> {
  const entriesRef = collection(db, "users", userId, "symptomEntries");
  const snapshot = await getDocs(entriesRef);

  if (snapshot.empty) {
    return 0;
  }

  await Promise.all(snapshot.docs.map((entryDoc) => deleteDoc(entryDoc.ref)));

  return snapshot.size;
}

export async function getAllSymptomEntries(userId: string) {
  const entriesRef = collection(db, "users", userId, "symptomEntries");
  const q = query(entriesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((entryDoc) => ({
    id: entryDoc.id,
    ...entryDoc.data(),
  }));
}