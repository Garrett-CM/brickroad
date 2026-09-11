import {
    loadLeague,
    createLeague,
    draftPick,
    startNewSeason,
    getCurrentTeam,
    getQueen,
    getTeamStats,
} from "./state.js";

let league = loadLeague();
let teamRowCount = 0;

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

const views = {
    home: document.getElementById("view-home"),
    create: document.getElementById("view-create"),
    draft: document.getElementById("view-draft"),
    league: document.getElementById("view-league"),
};

function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
        el.hidden = key !== name;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* -----------------------------------------------------------
   Home — continue banner
----------------------------------------------------------- */

function refreshContinueBanner() {
    const banner = document.getElementById("continue-banner");
    if (!league) {
        banner.hidden = true;
        return;
    }
    banner.hidden = false;
    document.getElementById("continue-league-name").textContent = league.name;
    document.getElementById("continue-league-season").textContent =
        `Season ${league.season}`;
}

/* -----------------------------------------------------------
   Create league view — team builder
----------------------------------------------------------- */

const teamList = document.getElementById("team-list");
const teamCountLabel = document.getElementById("team-count");
const MAX_TEAMS = 12;
const MIN_TEAMS = 2;

function addTeamRow() {
    if (teamList.children.length >= MAX_TEAMS) return;

    teamRowCount += 1;
    const index = teamRowCount;

    const row = document.createElement("li");
    row.className = "team-row";
    row.dataset.rowId = String(index);
    row.innerHTML = `
        <span class="team-row-number">${teamList.children.length + 1}</span>
        <input
            type="text"
            class="team-name-input"
            placeholder="Team name"
            maxlength="30"
        >
        <button type="button" class="team-remove-btn" aria-label="Remove team">×</button>
    `;

    row.querySelector(".team-remove-btn").addEventListener("click", () => {
        if (teamList.children.length <= MIN_TEAMS) return;
        row.remove();
        renumberTeamRows();
    });

    teamList.appendChild(row);
    renumberTeamRows();
}

function renumberTeamRows() {
    [...teamList.children].forEach((row, i) => {
        row.querySelector(".team-row-number").textContent = String(i + 1);
        row.querySelector(".team-remove-btn").disabled =
            teamList.children.length <= MIN_TEAMS;
    });
    teamCountLabel.textContent = `${teamList.children.length} teams`;
}

function resetCreateForm() {
    teamList.innerHTML = "";
    teamRowCount = 0;
    addTeamRow();
    addTeamRow();
    document.getElementById("league-name").value = "";
    setCreateError("");
}

function setCreateError(message) {
    const el = document.getElementById("create-error");
    el.textContent = message;
    el.hidden = !message;
}

document.getElementById("add-team-btn").addEventListener("click", () => {
    addTeamRow();
});

document.getElementById("create-league-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("league-name").value.trim();
    const teamNames = [...teamList.querySelectorAll(".team-name-input")]
        .map((input) => input.value.trim())
        .filter(Boolean);

    if (!name) {
        setCreateError("Your league needs a name.");
        return;
    }
    if (teamNames.length < MIN_TEAMS) {
        setCreateError(`Add at least ${MIN_TEAMS} teams with names.`);
        return;
    }
    const uniqueNames = new Set(teamNames.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== teamNames.length) {
        setCreateError("Team names need to be unique.");
        return;
    }

    league = createLeague(name, teamNames);
    renderDraftView();
    showView("draft");
});

document.getElementById("back-to-home-from-create").addEventListener("click", () => {
    refreshContinueBanner();
    showView("home");
});

document.getElementById("create-league-btn").addEventListener("click", () => {
    resetCreateForm();
    showView("create");
});

document.getElementById("continue-league-btn").addEventListener("click", () => {
    if (!league) return;
    if (league.status === "drafting") {
        renderDraftView();
        showView("draft");
    } else {
        renderLeagueView();
        showView("league");
    }
});

// Join form has nowhere to go yet (no backend rooms) — keep it from
// reloading the page and be upfront about it.
document.getElementById("join-form").addEventListener("submit", (e) => {
    e.preventDefault();
    setJoinNotice("Joining by room code needs a backend — coming soon!");
});

function setJoinNotice(message) {
    let el = document.getElementById("join-notice");
    if (!el) {
        el = document.createElement("p");
        el.id = "join-notice";
        el.className = "form-error";
        document.querySelector(".join-form").appendChild(el);
    }
    el.textContent = message;
}

/* -----------------------------------------------------------
   Draft view
----------------------------------------------------------- */

function renderDraftView() {
    if (!league) return;

    document.getElementById("draft-league-name").textContent = league.name;
    document.getElementById("draft-season-badge").textContent =
        `Season ${league.season}`;
    document.getElementById("draft-room-code").textContent =
        `Code ${league.roomCode}`;

    const bankGrid = document.getElementById("bank-grid");
    const rosterList = document.getElementById("roster-list");
    const turnBanner = document.getElementById("turn-banner");
    const draftComplete = document.getElementById("draft-complete");

    if (league.status === "complete") {
        turnBanner.hidden = true;
        bankGrid.parentElement.hidden = true;
        draftComplete.hidden = false;
    } else {
        turnBanner.hidden = false;
        bankGrid.parentElement.hidden = false;
        draftComplete.hidden = true;

        const currentTeam = getCurrentTeam(league);
        document.getElementById("turn-team-name").textContent = currentTeam.name;
        document.getElementById("turn-progress").textContent =
            `Pick ${league.currentPick + 1} of ${league.draftOrder.length} · Round ${
                Math.floor(league.currentPick / league.teams.length) + 1
            }`;

        bankGrid.innerHTML = "";
        league.bank.forEach((queenId) => {
            const queen = getQueen(queenId);
            const card = document.createElement("article");
            card.className = "queen-card";
            card.innerHTML = `
                <h3 class="queen-name">${queen.name}</h3>
                <p class="queen-house">${queen.house}</p>
                <p class="queen-tagline">${queen.tagline}</p>
                <button type="button" class="btn btn--draft">Draft</button>
            `;
            card.querySelector(".btn--draft").addEventListener("click", () => {
                league = draftPick(league, queenId);
                renderDraftView();
            });
            bankGrid.appendChild(card);
        });
    }

    rosterList.innerHTML = "";
    const onTheClockId = getCurrentTeam(league)?.id;
    league.teams.forEach((team) => {
        const card = document.createElement("div");
        card.className = "roster-card";
        if (team.id === onTheClockId) card.classList.add("roster-card--active");
        card.innerHTML = `
            <h3 class="roster-team-name">${escapeHtml(team.name)}</h3>
            <ul class="roster-picks">
                ${team.roster
                    .map((qId) => `<li>${escapeHtml(getQueen(qId).name)}</li>`)
                    .join("") || '<li class="roster-empty">No picks yet</li>'}
            </ul>
        `;
        rosterList.appendChild(card);
    });
}

document.getElementById("goto-league-btn").addEventListener("click", () => {
    renderLeagueView();
    showView("league");
});

/* -----------------------------------------------------------
   League dashboard view
----------------------------------------------------------- */

function formatCash(amount) {
    return `$${amount.toLocaleString("en-US")}`;
}

function renderStandings() {
    const standings = document.getElementById("standings");
    standings.innerHTML = "";

    const ranked = league.teams
        .map((team) => ({ team, stats: getTeamStats(team) }))
        .sort(
            (a, b) =>
                b.stats.cashWon - a.stats.cashWon ||
                b.stats.maxiWins - a.stats.maxiWins ||
                b.stats.miniWins - a.stats.miniWins
        );

    ranked.forEach(({ team, stats }, i) => {
        const card = document.createElement("div");
        card.className = "standing-card";
        if (i === 0) card.classList.add("standing-card--leader");
        card.innerHTML = `
            <div class="standing-rank">#${i + 1}${i === 0 ? " 👑" : ""}</div>
            <h3 class="standing-team-name">${escapeHtml(team.name)}</h3>
            <div class="standing-stats">
                <div class="stat">
                    <span class="stat-value">${stats.miniWins}</span>
                    <span class="stat-label">Mini wins</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${stats.maxiWins}</span>
                    <span class="stat-label">Maxi wins</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${formatCash(stats.cashWon)}</span>
                    <span class="stat-label">Cash won</span>
                </div>
            </div>
        `;
        standings.appendChild(card);
    });
}

function renderLeagueView() {
    if (!league) return;

    document.getElementById("league-name-title").textContent = league.name;
    document.getElementById("league-season-badge").textContent =
        `Season ${league.season}`;
    document.getElementById("league-room-code").textContent = league.roomCode;

    renderStandings();

    const grid = document.getElementById("league-roster-grid");
    grid.innerHTML = "";
    league.teams.forEach((team) => {
        const card = document.createElement("div");
        card.className = "roster-card";
        card.innerHTML = `
            <h3 class="roster-team-name">${escapeHtml(team.name)}</h3>
            <ul class="roster-picks">
                ${team.roster
                    .map((qId) => `<li>${escapeHtml(getQueen(qId).name)}</li>`)
                    .join("") || '<li class="roster-empty">No picks yet</li>'}
            </ul>
        `;
        grid.appendChild(card);
    });
}

document.getElementById("back-to-home-from-league").addEventListener("click", () => {
    refreshContinueBanner();
    showView("home");
});

document.getElementById("new-season-btn").addEventListener("click", () => {
    if (!league) return;
    const confirmed = window.confirm(
        `Start Season ${league.season + 1}? Rosters will reset and every queen goes back in the bank.`
    );
    if (!confirmed) return;

    league = startNewSeason(league);
    renderDraftView();
    showView("draft");
});

/* -----------------------------------------------------------
   Boot
----------------------------------------------------------- */

resetCreateForm();
refreshContinueBanner();

if (league && league.status === "drafting") {
    renderDraftView();
} else if (league && league.status === "complete") {
    renderLeagueView();
}
showView("home");
