# Lag Through Time

**Play it:** https://harshitcv808.github.io/lag-through-time/

A 3-minute in-store game that turns "Why an AI PC?" into "I want this Intel AI PC." Built for the **CMRIT x Intel 1 Million Minds** hackathon (Round 1).

Players live through 45 years of laptop lag, one era per level. Each era looks and feels like its time, and each one hurts a little more than the next one's fix. The last level is an Intel Core Ultra AI PC, where everything just works: offline, private, battery barely moves.

## How it plays

Each level opens with a quick **multi-select question** about the shopper, such as "What do you do on a laptop most days?" or "Where does your laptop go with you?". The shopper picks as many options as apply. A **time-warp** animation carries them from one era to the next.

| Level | Era | Mini-game | What it teaches |
|---|---|---|---|
| 1 | 1981, first PC | Type `DIR`, `RUN`, `PRINT` on a laggy green-screen terminal and swap the floppy disk | One task at a time, text only |
| 2 | 2003, Battery Dash | Endless-runner: a little laptop runs to class, jumps coffee cups and bags, and grabs plug points before the battery dies | Short battery life, chained to the charger |
| 3 | 2015, Swipe the permissions | Dating-app style swipes: cloud AI keeps asking for your data (contacts, location, face data…). Swipe left to deny, right to allow, while Wi-Fi drops freeze everything | Cloud AI needs internet, and your data leaves the laptop |
| 4 | 2026, Intel AI PC | Drag or tap 7 everyday AI tasks onto the right engine: CPU, GPU or NPU. Streaks and bursts reward every right answer | On-device AI: instant, offline, private, battery-friendly |

After the levels:

1. **Same you, four laptops.** Your time in each era, Intel Core Ultra Series 3 specs (up to 50 TOPS NPU, up to 120 TOPS Arc GPU, up to 180 TOPS in total), and plain-word explanations of TOPS and NPU.
2. **Why not a cheaper laptop?** Calls out the cheap-laptop trap, then compares Intel with the other laptops on the shelf (Snapdragon/ARM, MacBook).
3. **Budget.** Under ₹1.5 lakh, ₹1.5–2.5 lakh, above ₹2.5 lakh, or "show me the best fit".
4. **Your match.** Every option picked adds points to four personas (Student, Creator, Gamer, Hustler). Each of the 10 real Core Ultra Series 3 laptops is weighted per persona, and the best-scoring laptop inside the budget wins. The result shows:
   - the shopper's persona mix
   - the laptop, its ₹ price and three reasons it fits
   - a runner-up: either "Worth stretching for" (at most 30% over budget) or "Also a great fit"
   - the next step: get a hands-on demo, or scan the QR code / tap "Save my match" to take the pick home

If nobody touches the screen for 90 seconds, the game goes back to the title for the next shopper.

## Made for the store floor

- **Works anywhere.** Runs in the browser on the store's demo laptop or a shopper's phone, in portrait or landscape, and reflows if the screen rotates mid-level.
- **Zero tech knowledge needed.** Big tap targets, keyboard shortcuts (Enter, number keys, letters), and no jargon without a plain-word explanation.
- **Sound.** On by default, made with Web Audio so there are no files to load. It starts on the first tap, as browsers require, and the speaker button mutes it at any time.
- **No backend, no sign-in, no tracking.**

## Judging criteria → where it shows

| Criterion | In the game |
|---|---|
| Creativity (3) | Four eras, each with its own visual style and its own genre: terminal, runner, swipe, drag-and-drop. Time-warp transitions, confetti and streaks. |
| Persuasion (3) | The player feels 45 years of pain before the AI PC level fixes it. Multi-select answers and a budget feed a scored match from 10 real laptops, with a ₹ price, a runner-up and a next step. |
| Technical accuracy (3) | Real engine roles: NPU for always-on effects, GPU for XeSS and image AI, CPU for quick tasks. Real TOPS figures, with platform caveats. |
| Competitive superiority (1) | Cheap non-AI laptop, ARM/Snapdragon emulation and macOS compatibility, each compared with factual lines only. |

## Facts and sources

- Intel Core Ultra Series 3 (Panther Lake) figures come from Intel platform specs. Real-world results vary by laptop, and the game says so.
- Top TOPS figures are for Core Ultra X9 with Arc B390 graphics, and the game says other models are lower.
- Laptop models and prices are from Smartprix listings on 25 Nov 2026, and the game tells shoppers to check the in-store price. All game copy and product data live in [`src/data.js`](src/data.js) so they're easy to fact-check.
- Research notes are in [`research/`](research/).

## Run it locally

```bash
npm install
npm run dev      # local dev server
npm test         # matching engine + data self-check
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
  data.js          questions, tasks, permissions, laptop catalogue, matching engine
  theme.js         era palettes and fonts
  ui.js            themed buttons, cards, modal panels, backdrops
  audio.js         Web Audio synth (music + sound effects)
  scenes/          Title, Warp, Level1Dos, Level2Battery (runner), Level3Cloud (swipe), Level4AIPC, Versus, Result
```
