import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallReturn {
  isInstalled: boolean;
  isInstallable: boolean; // Android/PC: có beforeinstallprompt
  isIOS: boolean;
  isSafari: boolean;
  showIOSModal: boolean;
  showAndroidBanner: boolean;
  triggerInstall: () => Promise<void>;
  dismissAndroidBanner: () => void;
  dismissIOSModal: () => void;
  manualShowIOSModal: () => void;
}

const ANDROID_BANNER_DISMISSED_KEY = 'pwa_android_banner_dismissed';
const IOS_MODAL_DISMISSED_KEY = 'pwa_ios_modal_dismissed';
const DISMISS_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days

function isDismissedRecently(key: string): boolean {
  const dismissedAt = localStorage.getItem(key);
  if (!dismissedAt) return false;
  const timeSinceDismissed = Date.now() - parseInt(dismissedAt, 10);
  return timeSinceDismissed < DISMISS_DURATION;
}

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS =
    (/iphone|ipad|ipod/.test(ua) && !(window as any).MSStream) ||
    // iPad on iOS 13+ reports as MacOS
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua) && !/crios/.test(ua);
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
  return { isIOS, isSafari, isMobile };
}

function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const platform = detectPlatform();
    setIsSafari(platform.isSafari);
    setIsIOS(platform.isIOS);

    // Nếu đã cài rồi thì không làm gì
    if (isRunningStandalone()) {
      setIsInstalled(true);
      return;
    }

    // iOS Safari: hiện modal sau 2.5s nếu chưa bị dismiss
    if (platform.isIOS && platform.isSafari) {
      if (!isDismissedRecently(IOS_MODAL_DISMISSED_KEY)) {
        const timer = setTimeout(() => {
          setShowIOSModal(true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }

    // Android/PC: lắng nghe beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Chỉ hiện banner Android nếu là mobile và chưa bị dismiss
      if (platform.isMobile && !isDismissedRecently(ANDROID_BANNER_DISMISSED_KEY)) {
        setShowAndroidBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Lắng nghe khi user cài xong
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowAndroidBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowAndroidBanner(false);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissAndroidBanner = () => {
    setShowAndroidBanner(false);
    localStorage.setItem(ANDROID_BANNER_DISMISSED_KEY, Date.now().toString());
  };

  const dismissIOSModal = () => {
    setShowIOSModal(false);
    localStorage.setItem(IOS_MODAL_DISMISSED_KEY, Date.now().toString());
  };

  const manualShowIOSModal = () => {
    setShowIOSModal(true);
  };

  return {
    isInstalled,
    isInstallable,
    isIOS,
    isSafari,
    showIOSModal,
    showAndroidBanner,
    triggerInstall,
    dismissAndroidBanner,
    dismissIOSModal,
    manualShowIOSModal,
  };
}
