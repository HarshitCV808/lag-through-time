# Lag Through Time

**Play it:** https://harshitcv808.github.io/lag-through-time/

A 3-minute in-store game that turns "Why an AI PC?" into "I want this Intel AI PC." Built for the **CMRIT x Intel 1 Million Minds** hackathon (Round 1).

Players live through 45 years of laptop lag, one era per level. Each era looks and feels like its time, and each one hurts a little more than the next one's fix. The last level is an Intel Core Ultra AI PC, where everything just works: offline, private, battery barely moves.

## How it plays

Every level is played **on the screen of a computer from its era, in a room from that era**:

| Level | Machine | Room |
|---|---|---|
| 1981 | Beige CRT desktop with floppy drives and a clicky keyboard | Wood-panelled study, desk lamp, 1981 calendar |
| 2003 | Chunky grey laptop | College hostel: blinds, posters, bookshelf |
| 2015 | Thin aluminium laptop | Café: brick wall, chalk menu, pendant lamps, coffee |
| 2026 | Near-borderless 3:2 AI PC with glowing keys | Night-time room: neon strip, city window, plant |

On laptop and kiosk screens (and wide landscape) the whole desk scene shows, and each level opens by gliding in from the room to the screen. The screen's light spills onto the desk; the 1981 CRT has scanlines and curved glass, the laptops a faint reflection. Era sounds: floppy whirr and printer in 1981, a dial-up modem in 2003, café chatter in 2015, an AI whoosh in 2026. Upright phones and short landscape phones get a slim era-coloured bezel instead, so the game stays big enough to play.


Each level opens with one screen: what the era is about, plus a quick **multi-select question** about the shopper, such as "What do you do on a laptop most days?" or "Where does your laptop go with you?". The shopper picks as many options as apply. A **time-warp** animation carries them from one era to the next.

| Level | Era | Mini-game | What it teaches |
|---|---|---|---|
| 1 | 1981, first PC | Type `DIR`, `RUN`, `PRINT` on a green-screen terminal where every key takes almost a second to appear (a "KEYS WAITING FOR CPU" buffer and busy spinner show the lag), then swap the floppy disk | One task at a time, text only, slow |
| 2 | 2003, Battery Dash | Endless-runner: a little laptop runs to class, jumps coffee cups and bags, and grabs plug points before the battery dies | Short battery life, chained to the charger |
| 3 | 2015, Swipe the permissions | Dating-app style swipes: cloud AI keeps asking for your data (contacts, location, face data…). Swipe left to deny, right to allow, while Wi-Fi drops freeze everything | Cloud AI needs internet, and your data leaves the laptop |
| 4 | 2026, AI Day | Five 4-second microgames across a Gen-Z day: 8 AM lecture (tap CC for live captions), 11 AM video call (swipe to blur a messy room), 4 PM reel edit (tap yourself to cut out the background), 9 PM gaming (hold BOOST for XeSS upscaling), 11:30 PM exam night (mash to summarise notes offline). Each feature stays listed on screen ("Done today") and the end screen recaps all five | On-device AI across learning, work, creativity, gaming and everyday life: instant, offline, private, battery-friendly |

After the levels:

1. **Same you, four laptops.** Your time in each era, Intel Core Ultra Series 3 specs (up to 50 TOPS NPU, up to 120 TOPS Arc GPU, up to 180 TOPS in total), and plain-word explanations of TOPS and NPU.
2. **Why not a cheaper laptop?** Calls out the cheap-laptop trap, then three tap-to-flip cards: a Snapdragon (ARM) laptop, a MacBook and an AMD Ryzen AI laptop on the front, the Intel answer on the back.
3. **Budget.** Under ₹1.5 lakh, ₹1.5–2.5 lakh, above ₹2.5 lakh, or "show me the best fit".
4. **Your match.** Every option picked adds points to four personas (Student, Creator, Gamer, Hustler). Each of the 10 real Core Ultra Series 3 laptops is weighted per persona, and the best-scoring laptop inside the budget wins. The result shows:
   - the shopper's persona mix
   - the laptop, its ₹ price and three reasons it fits
   - a runner-up: either "Worth stretching for" (at most 30% over budget) or "Also a great fit"
   - the next step: get a hands-on demo, or scan the QR code / tap "Save my match" to take the pick home. The link carries the persona scores and budget (`?s=student-creator-gamer-pro&b=budget`), so the phone shows exactly the same persona, laptop and runner-up as the kiosk.

If nobody touches the screen for 90 seconds, the game goes back to the title for the next shopper.

## Made for the store floor

- **Built to catch passers-by.** The idle title keeps flickering through the four eras, and the start button pulses.
- **Crisp text everywhere.** The canvas renders at the screen's full pixel density (up to 3x) and is pinned to the viewport so fractional densities never blur it. Text is drawn on whole pixels with whole-pixel font sizes, and the Silkscreen pixel font snaps to its 8px grid. Screens that don't fit are laid out again with smaller type, never shrunk.
- **Works anywhere.** Runs in the browser on the store's demo laptop or a shopper's phone, in portrait or landscape, and reflows if the screen rotates mid-level.
- **Zero tech knowledge needed.** Big tap targets, keyboard shortcuts (Enter, number keys, letters), and no jargon without a plain-word explanation.
- **Opening gag + tap to start.** A "loading your laptop" bar stalls at 3% on a 1981 screen, glitches into a stuck 2003 download and 2015 buffering, then an Intel-blue flash snaps it to 100%: "Your AI PC is ready. Tap anywhere to start". That first tap starts the music (browsers block sound before it). Saved-match links skip it.
- **Pause.** A pause button next to the sound button (or Esc) freezes the level and shows an era-styled card with Resume, Restart level and Quit to title. It also pauses itself when the phone locks or the tab is hidden. Restarting a level replaces that level's answers.
- **Era-styled touch effects.** Every tap leaves a ripple and the mouse leaves a trail, styled per era: green pixels (1981), blue click rings and ghost arrows (2003), soft blue ripples (2015), cyan glow and sparks (2026).
- **Sound.** On by default, made with Web Audio so there are no files to load. It starts on the first tap, as browsers require, and the speaker button mutes it at any time.
- **No backend, no sign-in, no tracking.**

## Judging criteria → where it shows

| Criterion | In the game |
|---|---|
| Creativity (3) | Four eras, each with its own visual style and its own genre: terminal, runner, swipe, microgames. Time-warp transitions, confetti and streaks. |
| Persuasion (3) | The player feels 45 years of pain before the AI PC level fixes it. Multi-select answers and a budget feed a scored match from 10 real laptops, with a ₹ price, a runner-up and a next step. |
| Technical accuracy (3) | Real engine roles: NPU for always-on effects, GPU for XeSS and image AI, CPU for quick tasks. Real TOPS figures, with platform caveats. |
| Competitive superiority (1) | Level 3 shows what cloud-only AI costs you; tap-to-flip cards covers the cheap non-AI laptop, ARM/Snapdragon emulation and macOS compatibility, with factual lines only. |

## Facts and sources

- Intel Core Ultra Series 3 (Panther Lake) figures come from Intel platform specs. Real-world results vary by laptop, and the game says so.
- AMD line: in [Notebookcheck's Panther Lake gaming benchmarks](https://www.notebookcheck.net/Intel-Panther-Lake-with-Arc-B390-takes-on-AMD-Ryzen-Strix-Halo-and-GeForce-RTX-4050-in-our-first-gaming-benchmarks.1200743.0.html), Arc B390 beat the Radeon 890M (used in Ryzen AI 300 and 400) by up to 80% in some games. The card names the Core Ultra X7/X9 chips that have Arc B390.
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

```bash
npm run deploy
```

This runs the tests, builds, and merges `dist/` into the `gh-pages` branch. Older hashed script files are kept on purpose: browsers cache the page for about 10 minutes, and a cached page must still find the script it points at.

## Tech

[Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/), Canvas renderer, plus a vector QR code from `qrcode-generator`. Each era has its own type: VT323, Silkscreen with Verdana, Figtree, and Unbounded with Manrope.

```
src/
  main.js          game boot, crisp hi-DPI canvas, sound unlock
  data.js          questions, tasks, permissions, laptop catalogue, matching engine
  theme.js         era palettes and fonts
  ui.js            themed buttons, cards, modal panels, backdrops
  audio.js         Web Audio synth (music + sound effects)
  frame.js         era rooms and machines around each level's screen
  scenes/          Frame (background), Title, Warp, Level1Dos, Level2Battery (runner), Level3Cloud (swipe), Level4AIPC, Versus, Result
```
