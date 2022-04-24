const { joinVoiceChannel } = require("@discordjs/voice");
const lib = require("../lib");

const runCommand = async (client, interaction) => {
    const commandName = interaction.commandName;
    switch (commandName) {
        case "play":
            play(client, interaction);
            break;
        default:
            await interaction.reply("Invalid command");
    }
};

const play = async (client, interaction) => {
    console.log("Running play command...");
    const userVoiceChannel = interaction.member.voice.channel;
    if (!userVoiceChannel) {
        await interaction.reply("Need to be inside a voice channel to run this command");
        return;
    }

    const connection = joinVoiceChannel({
        channelId: userVoiceChannel.id,
        guildId: userVoiceChannel.guild.id,
        adapterCreator: userVoiceChannel.guild.voiceAdapterCreator
    });

    const args = interaction.options._hoistedOptions;
    const searchText = lib.Utils.argsValue(args, "song");

    const songs = _songsList(searchText);
    console.log("songs:", songs);
};

const _songsList = searchText => {
    // TODO add spotify support before falling back to youtube

    const songs = lib.Youtube.videosList(searchText);
    return songs;
};

module.exports = {
    name: "music",
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
