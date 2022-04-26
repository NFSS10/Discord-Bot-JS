const nodePath = require("path");

const runCommand = async (client, interaction) => {
    const commandName = interaction.commandName;
    switch (commandName) {
        case "about":
            await about(interaction);
            break;
        default:
            await interaction.reply("Invalid command");
    }
};

const about = async interaction => {
    const path = nodePath.join(__dirname, "../package.json");
    const packagedJson = require(path);

    const version = packagedJson.version;
    const description = packagedJson.description;

    let msg = ">>> ";
    msg += `**Version:** ${version}\n`;
    msg += `**Description:** ${description}`;

    await interaction.reply(msg);
};

const cleanup = async () => {};

const onceBotReady = async client => {};

module.exports = {
    name: "about",
    runCommand: runCommand,
    cleanup: cleanup,
    onceBotReady: onceBotReady,
    commands: [
        {
            name: "about",
            description: "Show information about this bot"
        }
    ]
};
