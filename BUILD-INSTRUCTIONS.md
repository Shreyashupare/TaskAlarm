# Building TaskAlarm

## Development (Expo Go App)

**Quickest way to test on your phone:**

1. Install **Expo Go** app from Play Store on your Android phone
2. Run on your machine:
   ```bash
   npx expo start
   ```
3. Scan the QR code with Expo Go app

**Note:** Expo Go has limitations - alarm notifications may not work fully. For full testing, use development build below.

---

## Development Build (Local)

**For full feature testing with native modules:**

```bash
# Run on connected device/emulator
npm run android

# Or with npx
npx expo run:android
```

Requires Android SDK and emulator/device connected.

---

## Build APK (Command Line - No Android Studio GUI)

**Requirements:** Android SDK must be installed and `ANDROID_HOME` environment variable set.

```bash
# Generate Android project (one time)
npx expo prebuild --platform android

# Build debug APK via command line
cd android
./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Build release APK:**
```bash
cd android
./gradlew assembleRelease

# Release APK at:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Build APK (Android Studio GUI)

If you prefer using Android Studio interface:

```bash
# Generate Android project
npx expo prebuild --platform android

# Open in Android Studio
open -a "Android Studio" android/
```

Then: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

---

## Build Release APK (Play Store)

**Option 1: Command Line (with signing config)**

```bash
cd android

# Build release APK
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**To sign the release APK, you need to:**
1. Create a keystore file (if you don't have one)
2. Add signing config to `android/app/build.gradle` or sign manually using:

```bash
# Sign the APK manually
jarsigner -keystore your-keystore.jks -storepass your-password \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  your-key-alias

# Verify the signed APK
zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
```

**Option 2: Via Android Studio GUI**

Build → Generate Signed Bundle/APK → APK → Create keystore → Release
