import {
  randomGod,
  randomBuild
} from "./logic.js";
import { assetUrl } from "./paths.js";

// Variables
let currentGod = null;
let rerollController;
const godNameCard = document.querySelector("#god-name");
const godImage = document.querySelector("#god-image");
const relicCard = document.querySelector("#relic-card");
const starterCard = document.querySelector("#starter-card");
const randomGodButton = document.querySelector("#randomize-god-button");
const randomBuildButton = document.querySelector("#randomize-build-button");


// Pantheon Selector Logic
const selectAll = document.querySelector("#select-all");
const pantheons = document.querySelectorAll(
  'input[name="pantheons"]'
);

selectAll.addEventListener("change", () => {
  pantheons.forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
  });
});

pantheons.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const checkedCount =
      document.querySelectorAll('input[name="pantheons"]:checked').length;

    selectAll.checked = checkedCount === pantheons.length;
    selectAll.indeterminate =
      checkedCount > 0 && checkedCount < pantheons.length;
  });
});

// Gather Needed Build Info
function getBuildType() {
  return document.querySelector('input[name="build-type"]:checked').value;
}

function getAuto() {
  return document.querySelector('input[name="auto"]').checked;
}

function getSelectedPantheons() {
  return [...pantheons].filter((checkbox) => checkbox.checked)
  .map((checkbox) => checkbox.value);
}

function getDamageType() {
  return document.querySelector('input[name="damage-type"]:checked').value;
}

// Render Functions
async function renderGod() {
  const selectedPantheons = getSelectedPantheons();
  const damageType = getDamageType();
  currentGod = await randomGod(selectedPantheons, damageType);
  godNameCard.classList.toggle("no-match", !currentGod);

  if (!currentGod) {
    godNameCard.textContent = "No matching gods";
    godImage.removeAttribute("src");
    godImage.alt = "";
    return;
  }

  godNameCard.textContent = currentGod.name;
  godImage.src = assetUrl(`imgs/gods/${currentGod.name.toLowerCase()}.webp`);
  godImage.alt = currentGod.name;
}

async function renderBuild() {
  rerollController?.abort();
  if (!currentGod) return;

  // Acquiring Build
  const auto = getAuto();
  const buildType = getBuildType();

  const rerollCount = Number(document.querySelector("#reroll-count").value);
  const result = await randomBuild(currentGod, auto, buildType, rerollCount);
  const build = result.build;
  const rerollItems = result.rerollItems;
  let rerollsRemaining = rerollCount;
  const rerollStatus = document.querySelector("#reroll-status");
  function updateRerollStatus() {
    rerollStatus.textContent = `Rerolls Remaining: ${rerollsRemaining}`;
  }
  updateRerollStatus();

  // Rendering Relic and Starter
  relicCard.querySelector("img").src = assetUrl(`imgs/relics/${build[0].name}.webp`);
  relicCard.querySelector("img").alt = build[0].name;
  relicCard.querySelector("figcaption").textContent = build[0].name;
  
  starterCard.querySelector("img").src = assetUrl(`imgs/starters/${build[1].name}.webp`);
  starterCard.querySelector("img").alt = build[1].name;
  starterCard.querySelector("figcaption").textContent = build[1].name;

  // Reroll Controller
  const controller = new AbortController();
  rerollController = controller;

  function consumeReroll() {
    rerollsRemaining--;
    updateRerollStatus();
    if (rerollsRemaining === 0) controller.abort();
  }

  function enableSlotReroll(card, buildIndex, folder, pool) {
    if (rerollsRemaining === 0) return;
    card.addEventListener("click", () => {
      const candidates = pool.filter((item) => item.name !== build[buildIndex].name);
      if (candidates.length === 0) return;
      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      build[buildIndex] = replacement;
      const image = card.querySelector("img");
      image.src = assetUrl(`imgs/${folder}/${replacement.name}.webp`);
      image.alt = replacement.name;
      card.querySelector("figcaption").textContent = replacement.name;
      consumeReroll();
    }, { signal: controller.signal });
  }

  enableSlotReroll(relicCard, 0, "relics", result.rerollRelics);
  enableSlotReroll(starterCard, 1, "starters", result.rerollStarters);

  // Render Loop for Items
  for (let i = 1; i <=6 ; i++) {
    const itemCard = document.querySelector(`#item${i}-card`);
    const buildIndex = i + 1;

    function renderItem(item) {
      const image = itemCard.querySelector("img");

      image.src = assetUrl(`imgs/items/${item.name}.webp`);
      image.alt = item.name;
      itemCard.querySelector("figcaption").textContent = item.name;
    }

    renderItem(build[buildIndex]);

    if (rerollsRemaining === 0 || !rerollItems[0]) continue;

    itemCard.addEventListener("click", () => {
      if (!rerollItems[0]) return;
      build[buildIndex] = rerollItems.shift();
      renderItem(build[buildIndex]);
      consumeReroll();
    }, { signal: controller.signal });
  }
}

async function renderBoth() {
  await renderGod();
  await renderBuild();
}

// Randomize Buttons Functionality
randomBuildButton.addEventListener("click", renderBuild);
randomGodButton.addEventListener("click", renderBoth);

// Run the Render Once on Page Load
renderBoth();
