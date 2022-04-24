const lib = require("../lib");

const runCommand = async interaction => {
    const subcommand = interaction?.options?._subcommand;
    switch (subcommand) {
        case "play":
            play(interaction);
            break;
        default:
            await interaction.reply("Invalid command");
    }
};

const play = async interaction => {
    console.log("Running play command...");
    console.log("name", interaction.commandName);
    console.log("options", interaction.options._hoistedOptions);

    // lib.Utils.argsValue();
    // lib.Youtube.isYoutubeURL();
};

module.exports = {
    runCommand: runCommand,
    commands: [
        {
            name: "play",
            description: "Plays a song",
            options: [
                {
                    type: 3,
                    name: "song",
                    description: "The song to be played. Support Youtube/Shopiy and search by youtube",
                    required: true
                }
            ]
        }
    ]
};
