# TimeSve

Know how long you have been going, and get a nudge when it is time to look up.

TimeSve is a screen-time awareness app for iOS. Pick your rhythm — a reminder
every 20, 30, 40, 50 minutes or an hour — start a session, and the app keeps
count for you.

Built with Expo and React Native. Runs in Expo Go on a physical iPhone.

## Screenshots

| Today | Settings |
| --- | --- |
| ![Today screen](docs/screenshots/today.png) | ![Settings screen](docs/screenshots/settings.png) |

## What it does

- **One number that matters.** Your total for the day sits front and centre. The
  small green pill underneath is the session you are in right now, ticking every
  second.
- **Your rhythm, your choice.** Five intervals, one tap to switch. The selected
  pill goes solid black so you always know where you stand.
- **Sound and vibration in a single switch.** iOS ties a notification's
  vibration to its alert sound, so TimeSve gives you one honest control instead
  of two that pretend to be independent. Flip it on and the phone buzzes, so you
  feel exactly what you are choosing.
- **It does not lose your time.** Tracked time is banked every time the app
  backgrounds, so closing it, switching away, or force-quitting costs you
  seconds rather than a whole session.
- **Everything stays on the device.** No account, no server, no analytics.
- **Days roll over at local midnight**, never UTC.

## Under the hood

Three decisions worth knowing about:

- `lib/storage` is the only module that touches AsyncStorage. No screen reads or
  writes storage directly, and every read is defensive — missing, partial and
  corrupt data all fall back to a sane default instead of throwing, because a
  storage error should never be able to white-screen the app.
- Sessions use a watermark (`lastCommitAt`) rather than a running total, so
  banking the same stretch of time twice can never double count it.
- Reminder writes are deduplicated by id, so one notification can only ever
  produce one record.

## Built with

- Expo SDK 57, React Native 0.86, React 19, TypeScript (strict)
- Expo Router, two-tab layout
- AsyncStorage for persistence
- react-native-svg for the mascot

## Running it

You need Node, an iPhone with [Expo Go](https://expo.dev/go) installed, and both
devices on the same Wi-Fi network.

```bash
npm install
npx expo start
```

Scan the QR code with the iPhone camera.

## Roadmap

- Local notifications firing on your chosen interval
- Demo mode, to show the full loop without waiting 20 minutes
- A record of every reminder that fires
