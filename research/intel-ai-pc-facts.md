# Intel AI PC — facts for the game (researched 2026-11-25)

## Core Ultra Series 3 (Panther Lake, Intel 18A)
- NPU: ~50 TOPS. Arc GPU (Xe3): ~120 TOPS. Platform total: up to ~180 TOPS.
- Three AI engines: CPU (fast small tasks), GPU (heavy creative/gaming AI), NPU (low-power always-on AI like background blur, noise removal, live captions).
- An NPU and GPU are typically used for different jobs rather than the same AI job at once.
- Battery: Intel claims up to 27 hours; real figures depend heavily on battery size (PCWorld tested a ZenBook Duo with a large battery). Always say "up to".
- Strong integrated Arc graphics — good gaming angle without a discrete GPU.

## Software
- OpenVINO toolkit runs AI models locally on CPU/GPU/NPU. OpenVINO 2026.0 (Feb 2026) improved NPU handling and LLM support.
- 500+ AI models optimised for Core Ultra (Intel, 2024 figure).
- Google LiteRT has an OpenVINO backend delegating 90+ classical models to the Intel NPU.
- Copilot+ PC features on Windows need a 40+ TOPS NPU.

## Why on-device AI matters (user benefits)
- Privacy: data (photos, voice, documents) stays on the laptop, not sent to the cloud.
- Works offline: no Wi-Fi needed for AI features.
- Low latency: no round-trip to a server.
- Battery: NPU runs AI at a fraction of the power of CPU/GPU.
- Cost: no per-use cloud AI fees for local models.

## Competitors
- Qualcomm Snapdragon X2 Elite: NPU reportedly ~80 TOPS (sources conflict, some say 50). ARM architecture — some Windows apps, games, anti-cheat and drivers run under emulation or not at all. Intel = x86 = everything just works.
- AMD Ryzen AI 400: NPU 50–60 TOPS (60 only on top HX models). Similar on paper; Intel's edge is OpenVINO ecosystem and Arc GPU AI TOPS.
- Apple M5: different OS (macOS); not Windows-compatible for many Indian student/work software and games.
- Cheap non-AI laptops: older chips with no NPU — AI features either run in the cloud (privacy, latency, needs internet) or drain battery on CPU.

## Use cases mapped to Gen-Z life
- Learning: offline AI tutor/summariser, live captions/translation of lectures.
- Work: meeting noise removal, background blur via NPU, local document AI.
- Creativity: AI photo/video editing (background removal, upscaling) on GPU.
- Gaming: Arc graphics, AI upscaling (XeSS) for higher FPS.
- Everyday: all-day battery, private on-device assistant.
