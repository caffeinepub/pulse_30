import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import MainLayout from "./components/MainLayout";
import PWAInstallBanner from "./components/PWAInstallBanner";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && isFetched && profile === null;
  const showMain = isAuthenticated && isFetched && profile !== null;

  // Parse pending profile username from URL path like /profile/:username
  const [pendingProfileUsername, setPendingProfileUsername] = useState<
    string | null
  >(() => {
    const match = window.location.pathname.match(/^\/profile\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handlePendingProfileHandled = () => {
    setPendingProfileUsername(null);
    window.history.replaceState({}, "", "/");
  };

  if (isInitializing || (isAuthenticated && profileLoading && !isFetched)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/uploads/Photoroom_20260315_093214-1.png"
            alt="Pulse"
            className="w-16 h-16 object-contain"
          />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.11 0.007 55)",
            border: "1px solid oklch(0.20 0.008 55)",
            color: "oklch(0.92 0.01 70)",
          },
        }}
      />
      {!isAuthenticated && <AuthScreen />}
      {isAuthenticated && !isFetched && (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {showProfileSetup && <ProfileSetupModal />}
      {showMain && (
        <MainLayout
          pendingProfileUsername={pendingProfileUsername}
          onPendingProfileHandled={handlePendingProfileHandled}
        />
      )}
      <PWAInstallBanner />
    </>
  );
}
