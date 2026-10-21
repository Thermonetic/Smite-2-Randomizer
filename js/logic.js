import {
    loadGods,
    loadItems,
    loadRelics,
    loadRelicUpgrades,
    loadStarters
} from "./data.js";

// Get a Random God
export async function randomGod(pantheons, damageType = "both") {
    const gods = await loadGods(pantheons);

    const availableGods = gods.filter(
        (god) => damageType === "both" || god.damage === damageType
    );

    if (availableGods.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * availableGods.length);
    return availableGods[index];
}

// Get a Random Starter
async function randomStarter() {
    const starters = await loadStarters();

    return starters[Math.floor(Math.random() * starters.length)];
}

// Get a Random Relic
async function randomRelic() {
    const relics = await loadRelics();

    return relics[Math.floor(Math.random() * relics.length)];
}

// Create a Random Build
export async function randomBuild(god, auto, buildType) {
    const items = await loadItems(god, auto);
    let availableItems = [...items];

    // Relic and Starter
    const relic = await randomRelic();
    const starter = await randomStarter();

    const build = [relic, starter];

    // Item Filtering by Build Type
    if (buildType === "damage") {
        availableItems = items.filter(
            (item) => item.role !== "tank"
        );
    } else if (buildType === "tank") {
        availableItems = items.filter(
            (item) => item.role !== "damage"
        );
    }

    // Relic Upgrade Conditions
    const upgradeChance = 0.1;
    let hasUpgrade = false;
    const relicUpgrades = await loadRelicUpgrades();
    const availableUpgrades = relicUpgrades.filter(
        (upgrade) => upgrade.original !== relic.name
    );

    // Ratatoskr Logic
    const isRataoskr = god.name === "Ratatoskr";
    const acornChance = 0.1;

    const availableAcorns = [
    { name: "Ashwhorl Acorn" },
    { name: "Briskberry Acorn" },
    { name: "Thistlethorn Acorn" }
    ];

    // Item Loop
    for(let i = 0; i < 6; i++) {
        // Ratatoskr Acorn Logic
        if (isRataoskr && availableAcorns.length > 0 && 
            (i === 0 || Math.random() < acornChance)) {
                const index = Math.floor(Math.random() * availableAcorns.length);

                const [acorn] = availableAcorns.splice(index, 1);
                build.push(acorn);
                continue;
        }

        // Relic Upgrade Logic
        const upgradeLogic = !hasUpgrade && Math.random() < upgradeChance;
        if (upgradeLogic) {
            const index = Math.floor(Math.random() * availableUpgrades.length);
            build.push(availableUpgrades[index]);
            hasUpgrade = true;
            continue;
        }

        // Item Selection
        const index = Math.floor(Math.random() * availableItems.length);

        const [selectedItem] = availableItems.splice(index, 1);
        build.push(selectedItem);
    }

    return build;
}