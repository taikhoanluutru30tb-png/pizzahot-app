import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import { db } from "./firebase";

export type ShiftConfig = {
  start: string;
  end: string;
};

export type TimekeepingSettings = {
  shifts: ShiftConfig[];
  lateToleranceMinutes: number;
  fixedPenalty: number;
};

export type TimekeepingRecord = {
  id: string;
  uid: string;
  ngay: string;
  gio_bat_dau?: string;
  gio_ket_thuc?: string;
  phut_tre?: number;
  tien_phat?: number;
  created_at?: unknown;
};

export type UserProfile = {
  fullName?: string;
  ten?: string;
  displayName?: string;
  name?: string;
  role?: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateKey(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part) || 0);
  return hours * 60 + minutes;
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getDisplayName(profile: UserProfile | null | undefined, fallback = "Nhân viên") {
  return [profile?.fullName, profile?.ten, profile?.displayName, profile?.name].find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? fallback;
}

export async function loadTimekeepingSettings() {
  const snapshot = await getDoc(doc(db, "settings", "timekeeping"));
  const data = snapshot.data() as Partial<TimekeepingSettings> | undefined;

  return {
    shifts: Array.isArray(data?.shifts) ? data.shifts.filter((shift) => toText(shift.start) && toText(shift.end)) : [],
    lateToleranceMinutes: Number(data?.lateToleranceMinutes) || 0,
    fixedPenalty: Number(data?.fixedPenalty) || 20000,
  } satisfies TimekeepingSettings;
}

export function findNearestShiftStart(current: Date, settings: TimekeepingSettings) {
  const nowMinutes = current.getHours() * 60 + current.getMinutes();
  const shifts = settings.shifts
    .map((shift) => ({ ...shift, startMinutes: parseTimeToMinutes(shift.start), endMinutes: parseTimeToMinutes(shift.end) }))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  if (shifts.length === 0) return null;

  const candidate = shifts.find((shift) => nowMinutes <= shift.startMinutes + settings.lateToleranceMinutes) ?? shifts[shifts.length - 1];
  return candidate;
}

export function calculateLateMinutes(current: Date, shiftStart: string, toleranceMinutes: number) {
  const currentMinutes = current.getHours() * 60 + current.getMinutes();
  const lateMinutes = currentMinutes - parseTimeToMinutes(shiftStart);
  return Math.max(0, lateMinutes - toleranceMinutes);
}

type TimekeepingSnapshot = {
  docs: QueryDocumentSnapshot<DocumentData>[];
};

export function subscribeTimekeepingRecords(callback: (records: TimekeepingRecord[]) => void) {
  return onSnapshot(query(collection(db, "timekeeping"), orderBy("created_at", "desc")), (snapshot: TimekeepingSnapshot) => {
    callback(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<TimekeepingRecord, "id">) })));
  });
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.data() as UserProfile | undefined;
}

export async function createCheckInRecord(params: {
  uid: string;
  checkInAt: Date;
  settings: TimekeepingSettings;
  profile?: UserProfile;
}) {
  const nearestShift = findNearestShiftStart(params.checkInAt, params.settings);
  const checkInTime = formatTime(params.checkInAt);
  const basePayload: Record<string, unknown> = {
    uid: params.uid,
    ngay: formatDateKey(params.checkInAt),
    gio_bat_dau: checkInTime,
    created_at: serverTimestamp(),
    ca_lam: nearestShift?.start ?? null,
    ten_nhan_vien: getDisplayName(params.profile, params.uid),
  };

  if (!nearestShift) {
    await addDoc(collection(db, "timekeeping"), basePayload);
    return { lateMinutes: 0, isLate: false };
  }

  const lateMinutes = calculateLateMinutes(params.checkInAt, nearestShift.start, params.settings.lateToleranceMinutes);
  const isLate = lateMinutes > 0;

  if (!isLate) {
    await addDoc(collection(db, "timekeeping"), basePayload);
    return { lateMinutes: 0, isLate: false };
  }

  const penalty = params.settings.fixedPenalty || 20000;
  await addDoc(collection(db, "timekeeping"), {
    ...basePayload,
    phut_tre: lateMinutes,
    tien_phat: penalty,
  });

  await addDoc(collection(db, "messages"), {
    kenh: "admin",
    loai: "thong_bao",
    noi_dung: `Nhân viên ${getDisplayName(params.profile, params.uid)} đã vào ca trễ ${lateMinutes} phút. Tự động ghi nhận mức phạt 20.000đ.`,
    created_at: serverTimestamp(),
    meta: {
      uid: params.uid,
      phut_tre: lateMinutes,
      tien_phat: penalty,
      type: "late_checkin",
    },
  });

  return { lateMinutes, isLate: true };
}
