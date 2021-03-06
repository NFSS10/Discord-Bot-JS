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
    client.on("voiceStateUpdate", (oldState, newState) => _onVoiceStateUpdate(client, oldState, newState));
    client.on("interactionCreate", async interaction => _onInteractionCreate(client, interaction));

    // Start bot
    client.login(global.DISCORD_BOT_TOKEN);
})();

global.cleanup = async () => {
    console.log("Running global cleanup...");
    Object.values(COMMANDS_INSTALLED).forEach(async c => await c.cleanup());
    console.log("Global cleanup finished!");
};

const _installCommands = async client => {
    try {
        const commandsFilesCodeArr = [];

        console.log("Loading commands...");
        const commandsPath = nodePath.join(__dirname, "commands/");
        const commandsFiles = fs.readdirSync(commandsPath);
        commandsFiles.forEach(file => {
            const filePath = nodePath.join(commandsPath, file);
            const commandCode = require(filePath);
            commandsFilesCodeArr.push(commandCode);
        });

        if (global.EXTRA_COMMANDS_ZIP_URL) {
            console.log("Loading commands-extra....");
            const commandsExtraPath = nodePath.join(__dirname, "commands-extra/");
            const commandsExtraFiles = fs.readdirSync(commandsExtraPath);
            commandsExtraFiles.forEach(file => {
                const filePath = nodePath.join(commandsExtraPath, file);
                const commandCode = require(filePath);
                commandsFilesCodeArr.push(commandCode);
            });
        }

        console.log("Registering commands...");
        const commandsRegistry = [];
        commandsFilesCodeArr.forEach(commandCode => {
            const commandName = commandCode.name;
            if (commandName === "quotes" && !global.COMMANDS_QUOTES_ENABLED) return;
            if (commandName === "music" && !global.COMMANDS_MUSIC_ENABLED) return;

            COMMANDS_INSTALLED[commandName] = {
                commandsList: commandCode.commands.map(c => c.name),
                runCommand: commandCode.runCommand,
                cleanup: commandCode.cleanup,
                onceBotReady: commandCode.onceBotReady
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
    Object.values(COMMANDS_INSTALLED).forEach(c => c.onceBotReady(client));
    console.log("\nBot is ready!!!\n");
};

const _onVoiceStateUpdate = async (client, oldState, newState) => {
    // ignore users voice state changes
    if (!oldState.member.user.bot) return;

    // check if is this bot's voice state change
    if (oldState.id !== client.user.id) return;

    // the voice state changes was made by the bot but it's not
    // connected to a voice channel so it means it was disconnected
    // thus we should a cleanup
    if (!newState.channel) global.cleanup();
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
