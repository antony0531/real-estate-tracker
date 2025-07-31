import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone ===
          true);

    if (isStandalone) {
      return; // Already installed
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show custom instructions
    if (isIOSDevice && !isStandalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // Check if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Install Real Estate Tracker
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add to your home screen for quick access
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    To install on iOS:
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                    <li>
                      1. Tap the Share button{" "}
                      <span className="inline-block">⎙</span>
                    </li>
                    <li>2. Scroll down and tap "Add to Home Screen"</li>
                    <li>3. Tap "Add" in the top right</li>
                  </ol>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
