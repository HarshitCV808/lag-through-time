# Lag Through Time

**Play it:** https://harshitcv808.github.io/lag-through-time/

A 3-minute in-store game that turns "Why an AI PC?" into "I want this Intel AI PC." Built for the **CMRIT x Intel 1 Million Minds** hackathon (Round 1).

Players live through 45 years of laptop lag, one era per level. Each era looks and feels like its time, and each one hurts a little more than the next one's fix. The last level is an Intel Core Ultra AI PC, where everything just works: offline, private, battery barely moves.

## How it plays

| Level | Era | Mini-game | What it teaches |
|---|---|---|---|
| 1 | 1981, first PC | Type `DIR`, `RUN`, `PRINT` on a laggy green-screen terminal and swap the floppy disk | One task at a time, text only |
| 2 | 2003, Wi-Fi laptop | Finish a dial-up download; tap the charger plug before the battery dies | Short battery life, slow internet |
| 3 | 2015, cloud AI | Close privacy pop-ups and wait out Wi-Fi drops while cloud AI edits your file | Cloud AI needs internet, waits in queues, and your files leave the laptop |
| 4 | 2026, Intel AI PC | Send 7 everyday AI tasks to the right engine: CPU, GPU or NPU | On-device AI: instant, offline, private, battery-friendly |

After the levels:

1. **Same you, four laptops.** Your time in each era, Intel Core Ultra Series 3 specs (NPU ~50 TOPS, Arc GPU ~120 TOPS, up to ~180 platform TOPS), and plain-word explanations of TOPS and NPU.
2. **Why not a cheaper laptop?** Calls out the cheap-laptop trap, then compares Intel with the other laptops on the shelf (Snapdragon/ARM, MacBook).
3. **Your match.** The choices you made in levels 2–4 decide your persona (Student, Creator, Gamer or Hustler). You get a real Intel AI PC laptop with its ₹ price, three reasons it fits you, and a clear next step:
   - **Get a hands-on demo:** show the screen to a store expert.
   - **Scan the QR code** (or tap "Save my match" on a phone) to take the pick home. The link opens straight to that match.

The result screen goes back to the title after 2 minutes, ready for the next shopper.

## Made for the store floor

- **Works anywhere.** Runs in the browser on the store's demo laptop or a shopper's phone, in portrait or landscape, and reflows if the screen rotates mid-level.
- **Zero tech knowledge needed.** Big tap targets, keyboard shortcuts (Enter, number keys, letters), and no jargon without a plain-word explanation.
- **Sound.** On by default, made with Web Audio so there are no files to load. It starts on the first tap, as browsers require, and the speaker button mutes it at any time.
- **No backend, no sign-in, no tracking.**

## Judging criteria → where it shows

| Criterion | In the game |
|---|---|
| Creativity (3) | Four eras, each in its own visual style. The title morphs through all four looks. |
| Persuasion (3) | The player feels 45 years of pain before the AI PC level fixes it. Ends with a personal match, a ₹ price and a next step. |
| Technical accuracy (3) | Real engine roles: NPU for always-on effects, GPU for XeSS and image AI, CPU for quick tasks. Real TOPS figures, with platform caveats. |
| Competitive superiority (1) | Cheap non-AI laptop, ARM/Snapdragon emulation and macOS compatibility, each compared with factual lines only. |

## Facts and sources

- Intel Core Ultra Series 3 (Panther Lake) figures come from Intel platform specs. Real-world results vary by laptop, and the game says so.
- Laptop prices are from Smartprix listings on 25 Nov 2026, and the game tells shoppers to check the in-store price. All game copy and product data live in [`src/data.js`](src/data.js) so they're easy to fact-check.
- Research notes are in [`research/`](research/).

## Run it locally

```bash
npm install
npm run dev      # local dev server
npm test         # persona + data self-check
npm run build    # production build in dist/
```

## Deploy

The site is served from the `gh-pages` branch:

```bash
npm run build
cd dist && touch .nojekyll && git init -b gh-pages && git add -A && git commit -m "Deploy" \
  && git push -f https://github.com/HarshitCV808/lag-through-time.git gh-pages && rm -rf .git
```

## Tech

[Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/), Canvas renderer, plus a vector QR code from `qrcode-generator`. Each era has its own type: VT323, Silkscreen with Verdana, Figtree, and Unbounded with Manrope.

```
src/
  main.js          game boot, crisp hi-DPI canvas, sound unlock
  data.js          all copy, tasks, personas, laptops, prices
  theme.js         era palettes and fonts
  ui.js            themed buttons, cards, modal panels, backdrops
  audio.js         Web Audio synth (music + sound effects)
  scenes/          Title, Level1Dos, Level2Battery, Level3Cloud, Level4AIPC, Versus, Result
```
