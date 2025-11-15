import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2a00532297544368af715ab1842cc189',
  appName: 'Sonecaz',
  webDir: 'dist',
  server: {
    url: 'https://2a005322-9754-4368-af71-5ab1842cc189.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#5B9FD8",
      sound: "beep.wav",
    },
  },
};

export default config;






