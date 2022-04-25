const { getVoiceConnection } = require("@discordjs/voice");

const runCommand = async (client, interaction) => {
    const commandName = interaction.commandName;
    switch (commandName) {
        case "leave":
            await leave(client, interaction);
            break;
        default:
            await interaction.reply("Invalid command");
    }
};

const leave = async (client, interaction) => {
    const connection = getVoiceConnection(interaction.guildId);
    if (connection) connection.destroy();
    await global.cleanup();

    await interaction.reply("Bye! :)");
};

const cleanup = async () => {};

module.exports = {
    name: "about",
    runCommand: runCommand,
    cleanup: cleanup,
    commands: [
        {
            name: "leave",
            description: "Disconnects from the voice channel"
        }
    ]
};
