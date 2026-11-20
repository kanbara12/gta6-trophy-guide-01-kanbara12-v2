# Leonida 55: GTA VI Trophy Guide and Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/kanbara12/gta6-trophy-guide-01-kanbara12-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/kanbara12/gta6-trophy-guide-01-kanbara12-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI. Open `app/index.html` in a desktop browser with the network off and it works: checklist, guides, roadmap, missable watch, save and export.

## What it does

- Checklist of all 55 trophies with the official name, description and grade for each, saved in the browser, with export to a file and import back in.
- A guide pane for every trophy, written in our own words, with the source named beside each guide: Exophase and PSNProfiles for the official list (18 Nov 2026), Push Square, KeenGamer and PowerPyx for how-to detail (19 Nov 2026).
- Platinum roadmap in five stages, about 200 hours in total, built from the official descriptions.
- Missable watch: one trophy flagged as possibly missable (Positive Mental Attitude, per PowerPyx / GTABase, unconfirmed). No reliable missable list exists yet (planetgta6, 19 Nov 2026), so the guide names that one trophy and leaves the rest unflagged.
- Spoiler-safe mode hides the 28 hidden trophies until earned. Kind filters, grade filter, search, per-trophy notes, a Next up planner, and PSN progress counters for the five counted trophies (250 stunts, 42 Shooting Range golds, 100 WAiNK locations, 100 vehicles, 50 challenges).

## What it does not claim

How-to detail beyond the official descriptions is launch-day guide knowledge, not official text. For the cryptic trophies (Challenging Tank, Personal Best, Actions Speak Louder, Bad Luck I Guess, The Truth Is Out There, Ten Pin) no guide checked on 19 Nov 2026 had confirmed the exact method, and the guide marks each one unconfirmed.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. First load is 3 files, 11,294 bytes gzip-9. The app fetches nothing from the network at runtime.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` are the guide itself.
- `app/data/trophies.json` holds the 55 trophies: official name, description, grade, hidden flag, kind, PSN count where one exists, missable flag, roadmap stage, guide, sources.
- `screenshots/` holds four real renders of the app: checklist with an open guide, platinum roadmap, missable watch, spoiler-safe mode with export and import.
- `vendor/makefun-frontend.ts` is the kit's copy, unchanged.
- `main.ts`, `serve.ts`, `shots.json` are the entry program, local server, and screenshot list.

## License

MIT. See `LICENSE`. Unofficial and independent: not affiliated with Rockstar Games or PlayStation. Trophy names and descriptions are shown as PlayStation publishes them.

This entry is built for the [gta6-trophy-guide-01 competition on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).
