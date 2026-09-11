# How the app works

This walks through Brickroad's actual behavior today: the views, the flow
between them, and the draft mechanics. For file layout and engineering
context see [../NOTES.md](../NOTES.md).

Everything below is client-side only — there's no server yet, so "saved"
means "in this browser's `localStorage`."

## Views

The whole app is one HTML page (`frontend/index.html`) with four `<main>`
views sitting in the DOM at once. `app.js` shows exactly one at a time by
toggling the `hidden` attribute (see `showView()`).

| View | Element id | Purpose |
|---|---|---|
| Home | `view-home` | Landing page: join by code, or create a league. |
| Create league | `view-create` | Name the league and add teams. |
| Draft | `view-draft` | Turn-based picking from the player bank. |
| League dashboard (the "werk room") | `view-league` | Season stats, final rosters, room code, start a new season. |

## The flow

```
Home ──create a league──▶ Create league ──start the draft──▶ Draft
  ▲                                                              │
  │                                                    bank empties
  │                                                              ▼
  └──────────────── back home ◀── League dashboard ◀── draft complete
                            │
                            └──start new season──▶ Draft (fresh bank, empty rosters)
```

- **Home.** If a league already exists in storage, a "Jump back in" banner
  appears above the panels and drops you back into whichever view matches
  its status (drafting → Draft, complete → League dashboard). The "Join
  with a room code" form doesn't do anything yet — there's no backend to
  join against, so submitting it just shows a "coming soon" message.
- **Create league.** Enter a league name and at least 2 team names (up to
  12). Team rows can be added/removed freely; names must be non-empty and
  unique. Submitting creates the league (see [Data model](#data-model)
  below), generates a room code, builds the draft order, and jumps
  straight into the Draft view.
- **Draft.** See [The draft](#the-draft) below.
- **League dashboard (the werk room).** The lobby you land in once a
  season's draft is done. Shows a season stats leaderboard (see
  [Season stats](#season-stats)) up top, every team's final roster below
  it, and the league's season number and room code. "Start new season"
  resets rosters and the player bank (see [Seasons](#seasons)) and returns
  to the Draft view. "Back home" just returns to Home; nothing is lost.

## The draft

Draft order is decided once, when the league is created (or a new season
starts), using a **snake draft**: round 1 goes through the teams in order,
round 2 goes in reverse, round 3 forward again, and so on, until every
queen in the player bank has a slot. This is standard fantasy-draft
fairness — the team that picks last in round 1 picks first in round 2.

Concretely, the whole draft is precomputed as one flat list of team IDs —
one entry per pick — and a single pointer (`currentPick`) tracks where the
draft is. Drafting a queen does three things:

1. Removes her from the bank.
2. Appends her to the current team's roster.
3. Advances `currentPick` by one.

The draft ends automatically once the pointer reaches the end of that
list (equivalently, once the bank is empty) — there's no fixed roster
size to configure; the whole bank gets drafted, split as evenly as the
snake order allows.

While drafting, the Draft view shows:

- A banner naming whose turn it is, plus "Pick _n_ of _total_ · Round _r_."
- A grid of every undrafted queen as a card with a "Draft" button.
- A rosters panel listing every team's picks so far, with the team that's
  on the clock highlighted.

When the bank empties, the pick grid is replaced with a "that's a wrap"
message and a button into the League dashboard.

## Season stats

The werk room lobby leads with a standings leaderboard, one card per team,
ranked by cash won (ties broken by maxi wins, then mini wins) with the
leader marked 👑. Each card shows three numbers:

- **Mini wins** — mini-challenge wins.
- **Maxi wins** — maxi-challenge (main challenge) wins.
- **Cash won** — prize money, formatted as `$12,500`.

These are computed by `getTeamStats(team)` in `state.js`, which just sums
the `miniWins` / `maxiWins` / `cashWon` fields of every queen on that
team's roster (looked up via `getQueen(id)`) — nothing is stored on the
team itself. Since those fields live on the (placeholder) queen data
rather than on the league, they're the same regardless of season; real
per-episode/per-season results need actual scoring, which is still a
"BE logic" todo item.

## Seasons

A league persists across seasons — only the roster and draft state reset.
Starting a new season (from the League dashboard):

1. Increments the season number.
2. Empties every team's roster.
3. Refills the player bank with the full queen list, shuffled.
4. Rebuilds the snake draft order with the teams shuffled into a new
   random starting order (so the same team isn't stuck picking last every
   time).
5. Sends everyone back into the Draft view to do it all again.

The league name, room code, and the teams themselves (their names) carry
over unchanged.

## Data model

The whole league lives as one JSON object under the `brickroad:league`
localStorage key (see `state.js`):

```js
{
  name: "The Pit Crew",
  roomCode: "F7K2QX",
  season: 2,
  status: "drafting",       // "drafting" | "complete"
  teams: [
    { id: "t1-...", name: "Team Sickening", roster: ["q07", "q14", ...] },
    ...
  ],
  bank: ["q01", "q03", ...],  // queen ids left to draft, this season
  draftOrder: ["t1-...", "t2-...", "t1-...", ...], // one team id per pick
  currentPick: 5,             // index into draftOrder
}
```

Queen data itself (name, house, tagline, and the `miniWins` / `maxiWins`
/ `cashWon` stats) isn't duplicated into the league — `teams[].roster` and
`bank` just hold queen ids, looked up against the static list in
`queens.js` (`getQueen(id)`) when rendering or computing stats.
