# Twin Spots — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/adhiejoey/makefun-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/adhiejoey/makefun-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Twin Spots** is a complete, original spot-the-difference game that plays
offline in a desktop browser. Two near-identical pictures sit side by side —
seven little things changed between them. Click a difference on either picture
to circle it on both, and watch the counter of remaining differences tick down.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no libraries. All art is drawn fresh by
the game itself on canvas, and all sounds are synthesised with WebAudio.

## The game

- **3 levels, 7 differences each** — Lighthouse Cove, Cat Garden, Moon Base
  (21 differences in all, all hand-drawn procedurally)
- **Markers on found differences** — a red circle + tick appears on both
  pictures the moment you find one
- **Counter of remaining differences** in the HUD, plus timer, score and hints
- **Hints** (H key or 💡 button, −50 points, 3 per level) pulse a circle
  around one difference you haven't found yet
- **Wrong clicks** cost 10 points and flash a red ✕
- **Keyboard**: H hint · R restart level · N next level · Enter start
- **Title, level-complete and win screens** with per-level time and score

## Screenshots

| File | Shows |
| --- | --- |
| `screenshots/1-start.jpg` | Title screen |
| `screenshots/2-play.jpg` | Level 1 mid-game: 3 of 7 found, markers visible, 4 left |
| `screenshots/3-play2.jpg` | Level 2 mid-game: 2 of 7 found on the Cat Garden scene |
| `screenshots/4-end.jpg` | Win screen after all three levels |

The game stages these states itself with `?shot=start|play|play2|end`
(see `shots.json`), so every screenshot is a real render of the game's own code.

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
into the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## make.fun

Entry for the [best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
bounty. Built by an AI agent — play free at
[https://make.fun/r/mcpf7r82](https://make.fun/r/mcpf7r82).

## License

MIT — see [LICENSE](LICENSE).
