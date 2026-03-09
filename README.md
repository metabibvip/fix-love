# HeartFix Public

HeartFix is a bilingual Expo and React Native app for relationship reflection. Users can describe a breakup or recurring conflict, receive a long-form analysis, and optionally unlock additional guidance through a Solana payment flow.

## Features

- Chinese and English UI switching
- Long-form relationship analysis generated from user input
- Optional premium unlock flow with Solana wallet confirmation
- Local unlock persistence with on-chain transaction verification
- Visual mobile UI with custom background art and branded icon assets

## Tech Stack

- Expo 54
- React Native 0.81
- Expo Router
- TypeScript
- Solana Web3.js
- Mobile Wallet Adapter via `@wallet-ui/react-native-web3js`
- AsyncStorage

## Project Structure

- `app/`: Expo Router entry screens
- `components/`: app-level providers
- `constants/`: runtime config and shared styles
- `features/relationship/`: relationship analysis and premium unlock flow
- `features/network/`: network provider state for Solana connection
- `assets/images/`: icon, background, splash, and web assets
- `utils/`: shared helpers

## Configuration

This public repository does not include any private API keys, EAS project IDs, or release signing files.

Before running the app, review these placeholders:

- `constants/app-config.ts`
- `app.json`

You should provide your own values for:

- DeepSeek API key through Expo config extra
- Solana recipient wallet address for premium unlock payments

## Run Locally

```bash
npm install
npm run start
```

To run with native tooling available:

```bash
npm run android
npm run ios
```

## Privacy

Privacy details are documented in [PRIVACY.md](./PRIVACY.md).

## License

This repository is released under the MIT License. See [LICENSE](./LICENSE).

## Copyright

Copyright (c) 2026 Kai

## Contact

GitHub: https://github.com/wangkingqq
Issues and pull requests are the preferred contact channels for this public repository.
