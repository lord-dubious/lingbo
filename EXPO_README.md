# LingBo Mobile - Expo React Native App

This is the mobile (Expo/React Native) version of LingBo, an Igbo language learning application.

## Features

### ✅ Fully Ported to Mobile:
- **Multi-Profile System**: Create and switch between Adult and Kid profiles
- **Adult Curriculum**: 5 levels of structured lessons with vocabulary and quizzes
- **Kids Games**:
  - 🎴 Word Flash (flashcard learning)
  - 🧩 Sentence Puzzle (drag-and-drop)
  - 🎮 Memory Match (matching game)
  - ⚡ Speed Tap (reflexes game)
- **TraceBook**: Handwriting practice for letters and words
- **AI Tutor** (Gemini-powered):
  - 💬 Text Chat with Chike (intelligent tutor)
  - 🎤 Live Voice Tutoring (framework ready)
  - 🎯 Pronunciation Coach (framework ready)
- **Reference Tools**:
  - Igbo Alphabet Board with audio
  - Numbers 1-100 with pronunciation
- **Media Library**:
  - Book library with covers
  - Video resources
- **Progress Tracking**: XP, levels, streaks, lesson completion

## Project Structure

```
app/
├── screens/                    # All screens organized by section
│   ├── OnboardingScreen.tsx
│   ├── HubScreen.tsx
│   ├── adult/                  # Adult learning screens
│   ├── kids/                   # Kids section screens
│   │   └── games/              # 4 interactive games
│   ├── reference/              # Alphabet & Numbers
│   ├── media/                  # Media Library
│   └── practice/               # AI Tutor
├── context/
│   ├── UserContext.tsx         # Profile & progress state
│   └── ToastContext.tsx        # Notifications
├── services/
│   └── geminiService.ts        # Google Gemini AI integration
├── utils/
│   └── audioUtils.ts           # Audio playback & TTS
├── constants.ts                # All curriculum data
└── App.tsx                     # Navigation setup

app.json                         # Expo configuration
package.json                     # Dependencies
babel.config.js                  # Babel configuration
metro.config.js                  # Metro bundler config
```

## Setup & Installation

### Prerequisites
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- iOS/Android device or emulator

### Installation Steps

1. **Install dependencies**:
```bash
npm install
```

2. **Create environment file**:
Create `.env` or `.env.local` (for local development):
```
EXPO_PUBLIC_API_KEY=your_gemini_api_key_here
```

3. **Start the development server**:
```bash
npm start
```

4. **Run on device/emulator**:
- **iOS**: Press `i` or `npm run ios`
- **Android**: Press `a` or `npm run android`
- **Web**: Press `w` or `npm run web`

## API Integration

The app uses **Google's Gemini AI API** for:
- Smart tutoring responses
- Text-to-speech pronunciation
- Speech-to-text transcription
- Handwriting grading (vision)

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Architecture

### Navigation Structure
- **Authentication Gate**: Onboarding → Profile Selection
- **Adult Path**: Tab Navigation (Hub, Curriculum, Profile)
- **Kids Path**: Stack Navigation (Dashboard → Games/Activities)
- **Shared Screens**: Modals for reference tools, media, practice

### State Management
- **UserContext**: Profiles, progress, XP, lessons, game scores
- **ToastContext**: User notifications
- **AsyncStorage**: Persistent local storage

### Platform Differences from Web Version
| Feature | Web | Mobile |
|---------|-----|--------|
| Storage | localStorage | AsyncStorage |
| Navigation | React Router | React Navigation |
| Styling | Tailwind CSS | StyleSheet |
| Audio | Web Audio API | expo-av |
| TTS | Gemini API | expo-speech + Gemini |
| Canvas | HTML Canvas | React Native (Skia ready) |
| Icons | lucide-react | lucide-react-native |

## Development Tips

### Hot Reload
Changes auto-reload when you save files. For bigger changes, do a full reload (R key).

### Debugging
- Use `console.log()` - output appears in terminal
- React Native Debugger for advanced debugging
- Network tab in Expo DevTools

### Testing Features
1. Create a kid profile and try all games
2. Create an adult profile and browse curriculum
3. Test Gemini integration with practice chat
4. Switch profiles and verify persistence

## Known Limitations

- **TraceBook Canvas**: Currently a placeholder. Can implement with `react-native-skia`
- **Live Voice Tutoring**: Framework ready, needs audio recording setup
- **Pronunciation Coach**: Framework ready, needs STT implementation
- **Video Playback**: URLs are placeholders
- **Limited Animations**: Simplified from web version (can enhance with `react-native-reanimated`)

## Performance Optimization Opportunities

- Image caching with `@react-native-community/image-cache-hoc`
- Code splitting for large screens
- Memoization of expensive computations
- Lazy loading of media resources

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

Requires:
- Apple Developer account (iOS)
- Google Play account (Android)
- EAS CLI: `npm install -g eas-cli`

## Contributing

When adding features:
1. Follow existing code style (StyleSheet patterns)
2. Keep components in their section folders
3. Update types.ts for new data structures
4. Test on both iOS and Android if possible
5. Consider accessibility

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
rm -rf node_modules/.cache
```

### Expo won't start
```bash
expo logout
npm start --clear
```

### API Key issues
- Ensure `EXPO_PUBLIC_` prefix in env variable
- Check API is enabled in Google Cloud Console
- Verify quota limits aren't exceeded

## License

Same as the original web application.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Google Gemini API](https://ai.google.dev/)
- [React Native Docs](https://reactnative.dev/)
