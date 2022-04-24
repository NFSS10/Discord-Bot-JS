const nodePath = require("path");

const runCommand = async (client, interaction) => {
    const path = nodePath.join(__dirname, "../package.json");
    const packagedJson = require(path);

    const version = packagedJson.version;
    const description = packagedJson.description;

    let msg = ">>> ";
    msg += `**Version:** ${version}\n`;
    msg += `**Description:** ${description}`;

    await interaction.reply(msg);
};

module.exports = {
    name: "about",
    runCommand: runCommand,
    commands: [
        {
            name: "about",
            description: "Show information about this bot"
        }
    ]
};
