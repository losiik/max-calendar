type WebAppPlatform = "ios" | "android" | "desktop" | "web";
export type WebAppColorScheme = "light" | "dark";

type HapticImpactStyle = "soft" | "light" | "medium" | "heavy" | "rigid";
type HapticNotificationType = "error" | "success" | "warning";

export type WebAppEventName =
  | "WebAppReady"
  | "WebAppClose"
  | "WebAppSetupBackButton"
  | "WebAppRequestPhone"
  | "WebAppSetupClosingBehavior"
  | "WebAppBackButtonPressed"
  | "WebAppOpenLink"
  | "WebAppOpenMaxLink"
  | "WebAppShare"
  | "WebAppMaxShare"
  | "WebAppSetupScreenCaptureBehavior"
  | "WebAppHapticFeedbackImpact"
  | "WebAppHapticFeedbackNotification"
  | "WebAppHapticFeedbackSelectionChange"
  | "WebAppOpenCodeReader"
  | "WebAppThemeChanged";

type WebAppEventPayloads = {
  WebAppReady: void;
  WebAppClose: void;
  WebAppSetupBackButton: { isVisible: boolean };
  WebAppRequestPhone: { phone: string };
  WebAppSetupClosingBehavior: { needConfirmation: boolean };
  WebAppBackButtonPressed: void;
  WebAppOpenLink: { url: string };
  WebAppOpenMaxLink: { path: string };
  WebAppShare:
    | { requestId: string; text: string; link: string }
    | {
        requestId: string;
        status: "shared" | "cancelled";
      }
    | { error: { code: string } };
  WebAppMaxShare:
    | { requestId: string; text: string; link: string }
    | {
        requestId: string;
        status: "shared" | "cancelled";
      }
    | { error: { code: string } };
  WebAppSetupScreenCaptureBehavior: {
    requestId: string;
    isScreenCaptureEnabled: boolean;
  };
  WebAppHapticFeedbackImpact:
    | {
        requestId: string;
        impactStyle: HapticImpactStyle;
        disableVibrationFallback?: boolean;
      }
    | {
        requestId: string;
        status: "impactOccured";
      }
    | { error: { code: string } };
  WebAppHapticFeedbackNotification:
    | {
        requestId: string;
        notificationType: HapticNotificationType;
        disableVibrationFallback?: boolean;
      }
    | {
        requestId: string;
        status: "notificationOccured";
      }
    | { error: { code: string } };
  WebAppHapticFeedbackSelectionChange:
    | {
        requestId: string;
        disableVibrationFallback?: boolean;
      }
    | {
        requestId: string;
        status: "selectionChanged";
      }
    | { error: { code: string } };
  WebAppOpenCodeReader:
    | {
        requestId: string;
        fileSelect: boolean;
      }
    | { result: string }
    | { error: { code: string } };
  WebAppThemeChanged: {
    colorScheme: WebAppColorScheme;
  };
};

export type WebAppEventHandler<E extends WebAppEventName> = (
  payload: WebAppEventPayloads[E]
) => void;

export interface WebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface WebAppChat {
  id: number;
  type: string;
}

export type WebAppStartParam = string;

export interface WebAppData {
  query_id: string;
  auth_date: number;
  hash: string;
  start_param?: WebAppStartParam;
  user?: WebAppUser;
  chat?: WebAppChat;
}

export interface WebAppBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

export interface WebAppScreenCapture {
  isScreenCaptureEnabled: boolean;
  enableScreenCapture(): void;
  disableScreenCapture(): void;
}

export interface WebAppHapticFeedback {
  impactOccurred(
    impactStyle: HapticImpactStyle,
    disableVibrationFallback?: boolean
  ): void;
  notificationOccurred(
    notificationType: HapticNotificationType,
    disableVibrationFallback?: boolean
  ): void;
  selectionChanged(disableVibrationFallback?: boolean): void;
}

export interface WebAppStorage {
  setItem(key: string, value: string): Promise<void> | void;
  getItem(key: string): Promise<string | null> | string | null;
  removeItem(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

export interface WebAppBiometricManager {
  isInited: boolean;
  init(): Promise<void> | void;
  isBiometricAvailable: boolean;
  biometricType: Array<"fingerprint" | "faceid" | "unknown">;
  deviceId: string | null;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  requestAccess(): Promise<void> | void;
  authenticate(): Promise<void> | void;
  updateBiometricToken(token: string): Promise<void> | void;
  openSettings(): Promise<void> | void;
}

export interface WebAppBridge {
  initData?: string;
  initDataUnsafe?: WebAppData;
  platform?: WebAppPlatform;
  version?: string;
  colorScheme?: WebAppColorScheme;
  onEvent<E extends WebAppEventName>(
    eventName: E,
    callback: WebAppEventHandler<E>
  ): void;
  offEvent<E extends WebAppEventName>(
    eventName: E,
    callback: WebAppEventHandler<E>
  ): void;
  ready(): void;
  close(): void;
  requestContact(): void;
  BackButton: WebAppBackButton;
  ScreenCapture: WebAppScreenCapture;
  HapticFeedback: WebAppHapticFeedback;
  DeviceStorage: WebAppStorage;
  SecureStorage: WebAppStorage;
  BiometricManager: WebAppBiometricManager;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  openLink(url: string): void;
  openMaxLink(url: string): void;
  shareContent(text: string, link: string): void;
  shareMaxContent(text: string, link: string): void;
  downloadFile(url: string, fileName: string): void;
  openCodeReader(fileSelect?: boolean): void;
}

declare global {
  interface Window {
    WebApp?: WebAppBridge;
  }
}

export const getWebApp = (): WebAppBridge | undefined => window.WebApp;

export const getWebAppData = (): WebAppData | undefined =>
  getWebApp()?.initDataUnsafe;

export const getWebAppUser = (): WebAppUser | undefined =>
  getWebAppData()?.user;

export const getMaxUserId = (): string | undefined => {
  const id = getWebAppUser()?.id;

  if (!id && import.meta.env.DEV === true) return import.meta.env.VITE_MAX_USER_ID;
  return typeof id === "number" ? String(id) : id;
};

export const getMaxUserName = (): string | undefined => {
  const user = getWebAppUser();
  if (!user) return undefined;
  if (user.username) return user.username;
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || undefined;
};

export const getUserLanguage = (): string | undefined =>
  getWebAppUser()?.language_code;

export const getUserPhotoUrl = (): string | undefined =>
  getWebAppUser()?.photo_url;

export const getWebAppPlatform = (): WebAppPlatform | undefined =>
  getWebApp()?.platform;

export const getWebAppVersion = (): string | undefined =>
  getWebApp()?.version;

export const getWebAppColorScheme = (): WebAppColorScheme | undefined =>
  getWebApp()?.colorScheme;

export const getStartAppParams = (): WebAppStartParam | undefined =>
  getWebApp()?.initDataUnsafe?.start_param;

export const getStartAppPayload = (): string | undefined => {
  const params = getStartAppParams();
  if (!params) return undefined;
  return params;
};

export const onWebAppEvent = <E extends WebAppEventName>(
  eventName: E,
  handler: WebAppEventHandler<E>
): (() => void) | undefined => {
  const bridge = getWebApp();
  if (!bridge) return undefined;
  bridge.onEvent(eventName, handler);
  return () => bridge.offEvent(eventName, handler);
};

export const signalWebAppReady = (): void => {
  getWebApp()?.ready();
};

export const closeWebApp = (): void => {
  getWebApp()?.close();
};

export const onColorSchemeChange = (
  handler: (scheme: WebAppColorScheme) => void
): (() => void) | undefined =>
  onWebAppEvent("WebAppThemeChanged", (payload) => {
    if (!payload) return;
    handler(payload.colorScheme);
  });

export const enableClosingConfirmation = (): void => {
  getWebApp()?.enableClosingConfirmation();
};

export const disableClosingConfirmation = (): void => {
  getWebApp()?.disableClosingConfirmation();
};

export const openExternalLink = (url: string): void => {
  getWebApp()?.openLink(url);
};

export const openMaxLink = (url: string): void => {
  getWebApp()?.openMaxLink(url);
};

export const shareToSystem = (text: string, link: string): void => {
  getWebApp()?.shareContent(text, link);
};

export const shareToMax = (text: string, link: string): void => {
  getWebApp()?.shareMaxContent(text, link);
};

export const downloadFile = (url: string, fileName: string): void => {
  getWebApp()?.downloadFile(url, fileName);
};

export const requestPhoneNumber = (): void => {
  getWebApp()?.requestContact();
};

export const openQrScanner = (fileSelect = true): void => {
  getWebApp()?.openCodeReader(fileSelect);
};
