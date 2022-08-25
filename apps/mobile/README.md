# Notesnook for Android & iOS

The Notesnook mobile app is developed with React Native, helping us to keep a shared codebase for iOS and Android apps and provide great feature parity on both platforms.

## Releases

Android and iOS apps can be downloaded from their respective appstores.

<a href="https://play.google.com/store/apps/details?id=chat.rocket.android">
  <img alt="Download on Google Play" src="https://play.google.com/intl/en_us/badges/images/badge_new.png" height=43>
</a>
<a href="https://apps.apple.com/us/app/notesnook-take-private-notes/id1544027013">
  <img alt="Download on App Store" src="https://user-images.githubusercontent.com/7317008/43209852-4ca39622-904b-11e8-8ce1-cdc3aee76ae9.png" height=43>
</a>
<a href="https://f-droid.org/packages/YOUR.APP.ID">
    <img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png"
    alt="Get it on F-Droid"
    height="43">
</a>

Alternatively on android releases are also available on [Github Releases](https://github.com/streetwriters/notesnook/releases).

## Architecture overview

The app codebase is distributed over two primary directories. `native/` and `app/`.

- `native/`: Includes `android/` and `ios/` folders and everything related to react native core functionality like bundling, development and packaging. Any react-native dependency that has native code i.e android & ios folders, is installed here.

- `app/`: Includes all the app code other than the native part. All JS only dependencies are installed here.
  - `components/`: Each component serves a specific purpose in the app UI, for example the `Paragraph` component is used to render paragraphs in the app and a `Header` component is used to render a `header` on all screens.
  - `common/`: Features that have integral role in app functionality, for example, notesnook core is initialized here.
  - `hooks/`: Hooks for different app logic
  - `navigation/`: Includes app navigation specific code. Here the app navigation, editor & side menu are rendered side by side in fluid tabs.
  - `screens`: Navigator screens.
  - `services`: Parts of code that do a specific function, for example, the `sync` service is responsibe for running Sync from anywhere in the app.
  - `stores`: We use `zustand` for global state management in the app. There are multiple stores that provide the state for different parts of the app.
  - `utils`: General purpose stuff such as constant values, utility functions etc.

There are several other folders at the root:

- `share/`: Code for the iOS Share Extension and Android widget.
- `e2e/`: Detox End to end tests
- `patches/`: Patches for various react native dependencies.

## Setting up development environment

To run the app locally, you will first have to configure react native on your machine. Follow the [guide](https://reactnative.dev/docs/environment-setup) here and select React Native CLI Quickstart. Expo is not supported.

Once you have completed the configuration, follow the steps below to run the app locally.

Install yarn 2 in the project.

```bash
npm install -g yarn
```

and then run:

```bash
yarn set version berry
```

Open `.yarnrc.yml` and add the following line at the top:

```yml
nodeLinker: node-modules
```

Install the dependencies

```bash
yarn install
```

## Running the app on Android

[Setup an android emulator from Android studio](https://developer.android.com/studio/run/managing-avds) if you haven't already and run the following command from `native/` folder.

```
cd native
```

and

```
yarn run-android
```

If you want to run the app on your phone, make sure to [enable USB debugging](https://developer.android.com/studio/debug/dev-options).

## Running the app on iOS

To run the app on iOS, simply run the following command from `native/` folder.

```
cd native
```

and

```
yarn run-ios
```