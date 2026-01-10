import obsidian from "eslint-plugin-obsidianmd";
console.log("Configs:", Object.keys(obsidian.configs || {}));
console.log("Rules:", Object.keys(obsidian.rules || {}));
console.log(
  "Recommended Config Rules:",
  JSON.stringify(obsidian.configs.recommended, null, 2),
);
