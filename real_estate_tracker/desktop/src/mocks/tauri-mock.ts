// Mock for Tauri API in PWA mode
export const invoke = async (cmd: string, args?: any): Promise<any> => {
  console.warn(`Mock Tauri invoke called: ${cmd}`, args);
  throw new Error('Tauri not available in PWA mode');
};

export default {
  invoke
};