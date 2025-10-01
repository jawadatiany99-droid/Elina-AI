# Android build instructions (Capacitor + Android Studio)

This project has been prepared to wrap a Vite + React web app using Capacitor.
It includes a lightweight Hugging Face integration example at `src/components/HFChat.tsx`.

Steps to produce an APK (on your machine):
1. Install Node and Java + Android Studio (with Android SDK & NDK not strictly required for debug):
   - Node >= 16, npm or yarn
   - Android Studio (install SDK & tools)
2. From project root (where package.json exists):
   npm install
   npm run build
3. Add Capacitor Android platform (first time only):
   npx cap add android
4. Copy web assets into native project:
   npx cap copy
5. Open Android project in Android Studio:
   npx cap open android
6. In Android Studio: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
   - The generated APK will be in: android/app/build/outputs/apk/debug/app-debug.apk
7. To sign and produce release APK, configure a keystore in Android Studio (or use Gradle signing config).
8. Optional: Use the provided GitHub Actions workflow to produce the debug APK automatically (see .github/workflows/android-build.yml).

Note: If you want the app to call Hugging Face with higher throughput, obtain an HF token and set it in your native code or via environment variable at runtime.
