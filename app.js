const fs = require("fs");
const nodePath = require("path");
const { Client, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const setup = require("./setup");

const COMMANDS_INSTALLED = {};
(async () => {
    // Setup environment
    await setup.setupEnvironment();

    // Setup client
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
    client.once("ready", () => _onceReady(client));
    client.on("interactionCreate", async interaction => _onInteractionCreate(client, interaction));

    // Start bot
    client.login(global.DISCORD_BOT_TOKEN);
})();

const _installCommands = async client => {
    try {
        console.log("Loading commands...");
        const commandsPath = nodePath.join(__dirname, "commands");
        const commandsFiles = fs.readdirSync(commandsPath);

        console.log("Registering commands...");
        const commandsRegistry = [];
        commandsFiles.forEach(file => {
            const filePath = nodePath.join(commandsPath, file);
            const commandCode = require(filePath);

            const commandName = commandCode.name;
            if (commandName === "quotes" && !global.COMMANDS_QUOTES_ENABLED) return;

            COMMANDS_INSTALLED[commandName] = {
                commandsList: commandCode.commands.map(c => c.name),
                runCommand: commandCode.runCommand
            };
            commandsRegistry.push(...commandCode.commands);
        });

        console.log("Updating bot commands registry...");
        const clientId = client.user.id;
        const rest = new REST({ version: "10" }).setToken(global.DISCORD_BOT_TOKEN);

        const route =
            global.ENV === "DEV"
                ? Routes.applicationGuildCommands(clientId, global.DEV_GUILD_ID)
                : Routes.applicationCommands(clientId);

        await rest.put(route, { body: commandsRegistry });
    } catch (error) {
        console.error("\nFailed while installing commands :(\n");
        console.log(error);
        process.exit(1);
    }
};

const _onceReady = async client => {
    await _installCommands(client);
    console.log("\nBot is ready!!!\n");
};

const _onInteractionCreate = async (client, interaction) => {
    try {
        if (!interaction.isCommand()) return;

        const commandName = interaction.commandName;
        const installedCommand = Object.values(COMMANDS_INSTALLED).find(c => c.commandsList.includes(commandName));

        if (!installedCommand) {
            await interaction.reply("Couldn't run command :(");
            return;
        }

        const runCommand = installedCommand.runCommand;
        await runCommand(client, interaction);
    } catch (error) {
        console.error("\nFailed while installing commands :(\n");
        console.log(error);
        process.exit(1);
    }
};
