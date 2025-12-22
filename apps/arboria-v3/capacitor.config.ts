import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arboria.app',
  appName: 'Arboria',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#166534",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
