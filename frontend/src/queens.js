// Placeholder player bank — fictional queens for drafting until the real
// "queen db" (see README todo) ships from the backend. Shape matches what
// the future API is expected to return, so swapping this out later should
// be a one-line change in state.js.
//
// miniWins / maxiWins / cashWon are placeholder in-show season stats
// (mini-challenge wins, maxi-challenge wins, prize cash) — stand-ins for
// real per-episode results until scoring ("BE logic" in the README todo)
// exists. They're fixed per queen rather than reset each season, which is
// a known simplification: see NOTES.md.

export const QUEEN_BANK = [
    { id: "q01", name: "Chardonnay Devereaux", house: "House of Devereaux", tagline: "Reads you like a bedtime story.", miniWins: 2, maxiWins: 3, cashWon: 15000 },
    { id: "q02", name: "Fantasia Voltage", house: "House of Voltage", tagline: "Runway is a contact sport.", miniWins: 1, maxiWins: 4, cashWon: 20000 },
    { id: "q03", name: "Ivy Le Fey", house: "House of Le Fey", tagline: "Comedy queen, tragic hemline.", miniWins: 3, maxiWins: 1, cashWon: 5000 },
    { id: "q04", name: "Bambi Steele", house: "House of Steele", tagline: "Lip syncs like she owes rent.", miniWins: 0, maxiWins: 1, cashWon: 2500 },
    { id: "q05", name: "Miracle Whipp", house: "House of Whipp", tagline: "Cooks a look and a comeback.", miniWins: 4, maxiWins: 2, cashWon: 10000 },
    { id: "q06", name: "Vesper Nightshade", house: "House of Nightshade", tagline: "Goth glam, zero apologies.", miniWins: 1, maxiWins: 0, cashWon: 0 },
    { id: "q07", name: "Coco Mirage", house: "House of Mirage", tagline: "Illusion looks, zero shade.", miniWins: 2, maxiWins: 2, cashWon: 7500 },
    { id: "q08", name: "Delta Foxx", house: "House of Foxx", tagline: "Pageant polish, street smarts.", miniWins: 0, maxiWins: 2, cashWon: 10000 },
    { id: "q09", name: "Praline Sinclair", house: "House of Sinclair", tagline: "Southern charm, sharp tongue.", miniWins: 1, maxiWins: 1, cashWon: 2500 },
    { id: "q10", name: "Zsa Zsa Volt", house: "House of Volt", tagline: "Camp icon in training.", miniWins: 0, maxiWins: 0, cashWon: 0 },
    { id: "q11", name: "Marmalade Sky", house: "House of Sky", tagline: "Sweet face, feral werk ethic.", miniWins: 2, maxiWins: 1, cashWon: 5000 },
    { id: "q12", name: "Rue Diamante", house: "House of Diamante", tagline: "Sparkles louder than she talks.", miniWins: 3, maxiWins: 3, cashWon: 12500 },
    { id: "q13", name: "Cinnamon Blaze", house: "House of Blaze", tagline: "Turns every challenge into fire.", miniWins: 1, maxiWins: 3, cashWon: 15000 },
    { id: "q14", name: "Odessa Quartz", house: "House of Quartz", tagline: "Cool, crystalline, unbothered.", miniWins: 2, maxiWins: 0, cashWon: 0 },
    { id: "q15", name: "Bettie Coupe", house: "House of Coupe", tagline: "Vintage glam, modern shade.", miniWins: 0, maxiWins: 1, cashWon: 2500 },
    { id: "q16", name: "Nova Renegade", house: "House of Renegade", tagline: "Underdog with a killer death drop.", miniWins: 3, maxiWins: 2, cashWon: 7500 },
    { id: "q17", name: "Juniper Frost", house: "House of Frost", tagline: "Ice queen with a warm heart.", miniWins: 1, maxiWins: 0, cashWon: 0 },
    { id: "q18", name: "Salsa Diablo", house: "House of Diablo", tagline: "Spicy in every category.", miniWins: 2, maxiWins: 2, cashWon: 5000 },
    { id: "q19", name: "Opaline Rush", house: "House of Rush", tagline: "Runs the werk room on adrenaline.", miniWins: 4, maxiWins: 1, cashWon: 2500 },
    { id: "q20", name: "Tallulah Grand", house: "House of Grand", tagline: "Everything's an entrance.", miniWins: 0, maxiWins: 4, cashWon: 20000 },
    { id: "q21", name: "Ginger Vixen", house: "House of Vixen", tagline: "Fierce, foxy, unfiltered.", miniWins: 1, maxiWins: 1, cashWon: 5000 },
    { id: "q22", name: "Celeste Vogue", house: "House of Vogue", tagline: "Editorial face, back-alley humor.", miniWins: 2, maxiWins: 0, cashWon: 0 },
    { id: "q23", name: "Peaches Monét", house: "House of Monét", tagline: "Painted looks, painted lies.", miniWins: 0, maxiWins: 2, cashWon: 7500 },
    { id: "q24", name: "Storm Delacroix", house: "House of Delacroix", tagline: "Thunderous entrances only.", miniWins: 1, maxiWins: 2, cashWon: 5000 },
];
