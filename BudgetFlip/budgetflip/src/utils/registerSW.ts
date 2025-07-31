export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch(err => {
          console.log('ServiceWorker registration failed:', err);
        });
    });
  }
}

// Install prompt for iOS
export function setupIOSInstallPrompt() {
  // Check if it's iOS and not in standalone mode
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isIOS && !isStandalone) {
    // Show install prompt after 30 seconds
    setTimeout(() => {
      const banner = document.createElement('div');
      banner.className = 'ios-install-banner';
      banner.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; display: flex; align-items: center; gap: 12px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #323338; margin-bottom: 4px;">Install BudgetFlip</div>
            <div style="font-size: 14px; color: #676879;">Add to Home Screen for quick access</div>
          </div>
          <button onclick="this.parentElement.style.display='none'" style="background: #0073ea; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 500;">Got it</button>
        </div>
      `;
      document.body.appendChild(banner);
    }, 30000);
  }
}