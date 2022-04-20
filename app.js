const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const registerCommands = async client => {
    console.log("Registering commands...");

    // TODO improve loading of commands
    const commands = [
        {
            name: "ping",
            description: "Replies with Pong!"
        },
        {
            name: "complex",
            description: "A complex command example",
            options: [
                {
                    type: 3,
                    name: "arg1",
                    description: "Argument 1",
                    choices: [
                        {
                            name: "value1",
                            value: "value1"
                        },
                        {
                            name: "value2",
                            value: "value2"
                        }
                    ],
                    required: true
                }
            ]
        }
    ];

    try {
        const clientId = client.user.id;
        const rest = new REST({ version: "10" }).setToken(global.DISCORD_BOT_TOKEN);
        const route = Routes.applicationCommands(clientId);
        await rest.put(route, { body: commands });
    } catch (error) {
        console.error("\nFailed while registering commands :(\n");
        console.log(error);
        process.exit(1);
    }
    console.log("Finished registering commands!");
};

const runCommand = async interaction => {
    console.log("command name", interaction.commandName);
    console.log("chosen options", interaction.options._hoistedOptions);
};

const { Client, Intents } = require("discord.js");
const setup = require("./setup");

// Setup environment
setup.setupEnvironment();

// Setup client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Setup events
client.once("ready", async () => {
    await registerCommands(client);
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    runCommand(interaction);

    const { commandName } = interaction;

    if (commandName === "ping") {
        await interaction.reply("Pong!");
    } else if (commandName === "server") {
        await interaction.reply("Server info.");
    } else if (commandName === "user") {
        await interaction.reply("User info.");
    }
});

// Start bot
client.login(global.DISCORD_BOT_TOKEN);
