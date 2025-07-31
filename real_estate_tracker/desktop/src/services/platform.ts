// Platform detection service
export const Platform = {
  isPWA(): boolean {
    // Check if running as PWA (not in Tauri)
    return typeof window !== "undefined" && !window.__TAURI_IPC__;
  },

  isTauri(): boolean {
    // Check if running in Tauri desktop app
    return typeof window !== "undefined" && !!window.__TAURI_IPC__;
  },

  isWeb(): boolean {
    // Check if running in regular web browser
    return (
      typeof window !== "undefined" &&
      !window.__TAURI_IPC__ &&
      !window.matchMedia("(display-mode: standalone)").matches
    );
  },

  isStandalone(): boolean {
    // Check if running as installed PWA
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")
    );
  },

  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  },

  isIOS(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
  },

  supportsCamera(): boolean {
    return (
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
    );
  },
};
