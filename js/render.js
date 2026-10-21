import {
  randomGod,
  randomBuild
} from "./logic.js";
import { assetUrl } from "./paths.js";

// Variables
let currentGod = null;
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
  if (!currentGod) return;

  const auto = getAuto();
  const buildType = getBuildType();

  let build = await randomBuild(currentGod, auto, buildType);

  relicCard.querySelector("img").src = assetUrl(`imgs/relics/${build[0].name}.webp`);
  relicCard.querySelector("img").alt = build[0].name;
  relicCard.querySelector("figcaption").textContent = build[0].name;
  
  starterCard.querySelector("img").src = assetUrl(`imgs/starters/${build[1].name}.webp`);
  starterCard.querySelector("img").alt = build[1].name;
  starterCard.querySelector("figcaption").textContent = build[1].name;

  for (let i = 1; i <=6 ; i++) {
    let itemCard = document.querySelector(`#item${i}-card`);

    itemCard.querySelector("img").src = assetUrl(`imgs/items/${build[i+1].name}.webp`);
    itemCard.querySelector("img").alt = build[i+1].name;
    itemCard.querySelector("figcaption").textContent = build[i+1].name;
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
