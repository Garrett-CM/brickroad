// League/draft state — persisted to localStorage until there's a backend
// to own it (see README todo: "BE logic"). One league per browser for now.

import { QUEEN_BANK } from "./queens.js";

const STORAGE_KEY = "brickroad:league";
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function generateRoomCode() {
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return code;
}

// Snake order: round 1 forward, round 2 reverse, round 3 forward, etc,
// flattened to exactly `totalPicks` picks long (last round may be partial
// once the bank runs dry).
function buildSnakeOrder(teamIds, totalPicks) {
    const order = [];
    let round = 0;
    while (order.length < totalPicks) {
        const roundTeams = round % 2 === 0 ? teamIds : [...teamIds].reverse();
        for (const teamId of roundTeams) {
            if (order.length >= totalPicks) break;
            order.push(teamId);
        }
        round++;
    }
    return order;
}

export function loadLeague() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveLeague(league) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(league));
    return league;
}

export function clearLeague() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getQueen(id) {
    return QUEEN_BANK.find((q) => q.id === id);
}

export function createLeague(name, teamNames) {
    const teams = teamNames.map((teamName, i) => ({
        id: `t${i + 1}-${Date.now()}`,
        name: teamName,
        roster: [],
    }));

    const bank = shuffle(QUEEN_BANK.map((q) => q.id));
    const draftOrder = buildSnakeOrder(
        shuffle(teams.map((t) => t.id)),
        bank.length
    );

    const league = {
        name,
        roomCode: generateRoomCode(),
        season: 1,
        teams,
        bank,
        draftOrder,
        currentPick: 0,
        status: "drafting", // 'drafting' | 'complete'
    };

    return saveLeague(league);
}

export function getCurrentTeam(league) {
    if (league.status !== "drafting") return null;
    const teamId = league.draftOrder[league.currentPick];
    return league.teams.find((t) => t.id === teamId) || null;
}

export function draftPick(league, queenId) {
    if (league.status !== "drafting") return league;
    const team = getCurrentTeam(league);
    if (!team) return league;

    const bankIndex = league.bank.indexOf(queenId);
    if (bankIndex === -1) return league; // already taken, ignore

    league.bank.splice(bankIndex, 1);
    team.roster.push(queenId);
    league.currentPick += 1;

    if (league.currentPick >= league.draftOrder.length || league.bank.length === 0) {
        league.status = "complete";
    }

    return saveLeague(league);
}

// New season: same league & teams, fresh cast, empty rosters, re-shuffled
// draft order so nobody's stuck picking last every time.
export function startNewSeason(league) {
    league.season += 1;
    league.teams.forEach((team) => {
        team.roster = [];
    });
    league.bank = shuffle(QUEEN_BANK.map((q) => q.id));
    league.draftOrder = buildSnakeOrder(
        shuffle(league.teams.map((t) => t.id)),
        league.bank.length
    );
    league.currentPick = 0;
    league.status = "drafting";

    return saveLeague(league);
}
