// Wrapper to conditionally load Tauri only in desktop environment
// This prevents errors in PWA mode

export async function getTauriInvoke(): Promise<any> {
  if (typeof window === 'undefined' || !window.__TAURI_IPC__) {
    return null;
  }
  
  try {
    const { invoke } = await import('@tauri-apps/api/tauri');
    return invoke;
  } catch (e) {
    console.error('Failed to load Tauri API:', e);
    return null;
  }
}