import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "pwa-banner-dismissed";

function isIOS() {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !(window.navigator as any).standalone
  );
}

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const ios = isIOS();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    if (ios) {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [ios]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-ocid="pwa.banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg"
        >
          <div
            className="m-3 rounded-2xl rounded-b-xl border px-4 py-3 flex items-center gap-3"
            style={{
              background: "oklch(0.11 0.007 55)",
              borderColor: "oklch(0.76 0.13 72 / 0.5)",
              boxShadow: "0 -4px 24px oklch(0.76 0.13 72 / 0.12)",
            }}
          >
            <img
              src="/assets/uploads/Photoroom_20260315_093214-1.png"
              alt="Pulse"
              className="w-10 h-10 rounded-xl shrink-0 object-contain"
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: "oklch(0.82 0.15 72)" }}
              >
                Add Pulse to your home screen
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ios
                  ? 'Tap Share then "Add to Home Screen" for the best experience'
                  : "Faster access, works offline, feels native"}
              </p>
            </div>
            {!ios && deferredPrompt && (
              <button
                type="button"
                data-ocid="pwa.install_button"
                onClick={install}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.76 0.13 72), oklch(0.65 0.11 65))",
                  color: "oklch(0.08 0.004 55)",
                }}
              >
                Install
              </button>
            )}
            <button
              type="button"
              data-ocid="pwa.close_button"
              onClick={dismiss}
              className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
