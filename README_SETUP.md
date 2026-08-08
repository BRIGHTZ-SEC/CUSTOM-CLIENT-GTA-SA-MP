   # SAMP Mobile Launcher - Complete Setup & Developer Guide

Welcome to the SAMP Mobile Launcher! This document explains how to configure, set up, and build the launcher so anyone can deploy it smoothly without encountering crashes, hangs, or Android 14/15 permission issues.

---

## 📋 Prerequisites & Environment Setup

Before building the app, make sure your development environment has:

1. **Node.js**: Version `16.x` or `18.x` (LTS recommended)
2. **Yarn**: `1.22.x` (`npm install -g yarn`)
3. **Java Development Kit (JDK)**: JDK 11 or JDK 17
4. **Android Studio & SDK**:
   - Android SDK Platform **API 33, 34, or 35** (Android 13–15)
   - Android SDK Build-Tools **33.0.0+**
   - NDK version specified in `android/build.gradle`
   - CMake **3.18.1+**

---

## ⚙️ Environment Variables Configuration (`.env`)

Create or update the `.env` file in the root project directory:

```env
APP_VERSION=0.0.16
PACKAGE_NAME=com.touch.mobile.dark
PROJECT_NAME=Touch Mobile
API_URL=https://api.yourdomain.com
CDN_URL=https://cdn.yourdomain.com
```

- **`APP_VERSION`**: Current launcher version string (used for auto-updating).
- **`PACKAGE_NAME`**: Android application ID (`com.touch.mobile.dark`).
- **`PROJECT_NAME`**: Display title shown in notifications and UI headers.

---

## 🌐 Server & Game CDN Configuration

### 1. Servers Configuration
Server addresses (e.g. `123.45.67.89:7777` or `domain.com:7778`) are fetched dynamically via `distribution.service.ts` or set in state. The launcher uses native UDP sockets to query online player counts and maximum slots.

### 2. Game Cache Storage (CDN)
The launcher downloads game assets into the app-specific external storage directory:
`${RNFS.ExternalDirectoryPath}/` -> `/Android/data/com.touch.mobile.dark/files/`

Make sure your CDN structure mirrors the required game directory layout:
```text
https://cdn.yourdomain.com/
├── cache/            # Standard game files
├── cache_snow/       # Winter map files
└── launcher.apk      # Auto-update APK package
```

---

## 🛠️ Step-by-Step Build & Run Instructions

### 1. Install Dependencies
```bash
yarn install
```

### 2. Connect an Android Device or Emulator
- Enable **USB Debugging** on your Android device (Settings -> Developer Options).
- Verify device connection:
```bash
adb devices
```

### 3. Run in Debug Mode
```bash
yarn android
# OR
npx react-native run-android
```

### 4. Build Release APK for Distribution
```bash
cd android
./gradlew assembleRelease
```
The compiled APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🛡️ Android 14 & Android 15 (API 34/35) Compatibility

This launcher is updated to fully support Android 13, 14, and 15:

1. **Scoped Storage (No Permissions Required for App Storage)**:
   Game files and `settings.ini` are saved inside `${RNFS.ExternalDirectoryPath}`, which requires no legacy `READ/WRITE_EXTERNAL_STORAGE` permissions on Android 13+.

2. **Background Activity Launch (BAL)**:
   Starting `MainGTA` uses the active foreground `Activity` token to comply with Android 14/15 security policies.

3. **Safe UDP Socket Queries**:
   Server status queries feature automatic timeout guards and error boundary handlers to prevent process crashes on bad network conditions.

---

## 🔍 Troubleshooting & FAQs

- **Q: Game crashes immediately upon launch?**
  - Make sure the native libraries (`libGTASA.so`, `libsamp.so`) are present in `android/app/src/main/jniLibs/armeabi-v7a/` and the game files are placed correctly in `/Android/data/com.touch.mobile.dark/files/`.

- **Q: Online player count shows "Unavailable"?**
  - Verify that the server's UDP query port (default 7777) is open and accessible without firewall blocks.

- **Q: Download button doesn't trigger?**
  - Ensure the device has internet access and sufficient free space on external storage.
