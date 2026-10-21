import { assetUrl } from "./paths.js";

// Custom Json Loader
async function loadJson(path) {
  const response = await fetch(assetUrl(path));

  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  return response.json();
}

// Fetches Gods w/ Pantheon filtering
export async function loadGods(pantheons) {
    const requests = pantheons.map((pantheon) => 
        loadJson(`data/gods/${pantheon}.json`)
    );

    const gods = await Promise.all(requests);
    return gods.flat();
};

// Loads Items based on God Scaling
export async function loadItems(god, auto) {
    const requests = [
        loadJson('data/items/items.json'),
        loadJson('data/items/items_hybrid.json')
    ];

    if (auto) {
        requests.push(loadJson('data/items/items_auto.json'));
    }

    if (god.scaling === "int") {
        requests.push(loadJson('data/items/items_int.json'));
    } else if (god.scaling === "hybrid") {
        requests.push(loadJson('data/items/items_int.json'));
        requests.push(loadJson('data/items/items_str.json'));
    } else {
        requests.push(loadJson('data/items/items_str.json'));
    }

    const response = await Promise.all(requests);
    return response.flat();
}

// Additional Loaders
export async function loadRelics() {
    return loadJson('data/items/relics.json');
}

export async function loadRelicUpgrades() {
    return loadJson('data/items/relics_upgrade.json');
}

export async function loadStarters() {
    return loadJson('data/items/starters.json');
}
