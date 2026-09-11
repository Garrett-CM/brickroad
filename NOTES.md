# Engineering notes

Working notes for whoever (probably future-you) picks this repo back up.
For the "what is this app" pitch see [README.md](README.md); for a walk
through of the actual mechanics see [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md).

## Stack

Deliberately boring for v0.1:

- Static HTML/CSS/JS. No framework, no bundler, no build step.
- JS is plain ES modules (`<script type="module">`), loaded straight by the
  browser — open `frontend/index.html` through any static file server (or
  `python3 -m http.server` from `frontend/`) and it works.
- No backend yet. State lives in the browser's `localStorage`. This is the
  biggest structural thing to unwind once "BE logic" starts (see README
  todo) — see [Backend migration path](#backend-migration-path) below.

## Project layout

```
frontend/
  index.html       Markup for every view (home / create / draft / league
                    dashboard), all present in the DOM, toggled via [hidden].
  src/
    style.css       All styling. Design tokens live in :root at the top.
    app.js          DOM wiring: view switching, form handling, rendering.
    state.js        League/draft data model + localStorage persistence.
    queens.js       Placeholder player bank (fictional queens).
```

There's no `package.json` — nothing to install. If a bundler or a real
backend gets added later, `frontend/` should stay the deployable static
root so the "hosting" todo item stays simple.

## State model

One league per browser, stored under the `brickroad:league` localStorage
key as a single JSON blob (see `state.js` for the shape). No IDs for
"current user" or multi-device sync — that needs a backend and accounts,
which doesn't exist yet.

Draft order is a precomputed **snake order**: a flat array of team IDs,
one entry per pick, built by alternating forward/reverse passes through
the team list until it's as long as the player bank. This keeps
"whose turn is it" a single array index (`currentPick`) instead of
tracking round/direction/position separately — simpler to reason about
and to persist.

## Placeholder data

`queens.js` is fictional filler, not the real cast list — see the README
todo item "queen db". The shape (`id`, `name`, `house`, `tagline`,
`miniWins`, `maxiWins`, `cashWon`) is meant to be what a future
`/api/queens` (or similar) call would return, so swapping the import in
`state.js` for a fetch should be close to a one-line change.

The `miniWins` / `maxiWins` / `cashWon` fields back the werk-room
standings leaderboard (see docs/HOW_IT_WORKS.md#season-stats). They're
fixed numbers per queen rather than per-season results — a known
simplification, since there's no real scoring yet. `state.js#getTeamStats`
sums them across a team's roster on demand; nothing is cached on the team.

## Known gaps / non-goals for now

- **Join by room code does nothing.** The room code is generated and
  displayed, but there's no backend to join against, so the join form just
  shows a "coming soon" message. Wiring this up needs the backend + a way
  to look up a league by code.
- **No accounts.** Anyone with the browser (or the room code, once join
  works) can act as any team — there's no per-user identity yet.
- **No real scoring.** The werk-room standings sum static placeholder
  stats per queen (see [Placeholder data](#placeholder-data)) — nothing
  tracks actual weekly episode results yet. That's the "BE logic" +
  "queen db" todo items.
- **Single league per browser.** Starting a new league overwrites the old
  one in localStorage. Fine for local testing, not fine for real usage.
- **No tests.** There's no test runner in the repo. New logic in
  `state.js` was only checked by hand and via `node --check`; a browser
  click-through is worth doing after non-trivial changes until real tests
  exist.

## Backend migration path

When the backend arrives, the natural split is:

- `queens.js` → replaced by an API call for the season's cast.
- `state.js`'s `createLeague` / `draftPick` / `startNewSeason` → become API
  calls instead of local mutation + `localStorage.setItem`. The function
  signatures can probably stay the same shape (take/return a league
  object) so `app.js` doesn't need to change much — just make the calls
  `async` and add loading states.
- Room codes become real: `join-form`'s submit handler in `app.js` is
  already isolated and ready to swap its "coming soon" message for an
  actual lookup call.
