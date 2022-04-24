const { joinVoiceChannel } = require("@discordjs/voice");
const lib = require("../lib");

const runCommand = async (client, interaction) => {
    const commandName = interaction.commandName;
    switch (commandName) {
        case "play":
            await play(client, interaction);
            break;
        default:
            await interaction.reply("Invalid command");
    }
};

const MUSIC_QUEUE = [];
let MUSIC_PLAYING = null;
const play = async (client, interaction) => {
    console.log("Running play command...");
    const userVoiceChannel = interaction.member.voice.channel;
    if (!userVoiceChannel) {
        await interaction.reply("Need to be inside a voice channel to run this command");
        return;
    }

    const args = interaction.options._hoistedOptions;
    const searchText = lib.Utils.argsValue(args, "song");

    // defer reply because operation can take some time
    await interaction.deferReply();

    // TODO add spotify support before falling back to youtube
    const videos = await lib.Youtube.videosList(searchText);
    if (videos.length === 0) {
        await interaction.editReply("No results");
        return;
    }

    const songs = videos.map(video => ({ ...video, source: "youtube" }));

    if (MUSIC_PLAYING) {
        MUSIC_QUEUE.push(...songs);
        const msg = _addToQueueMsg(searchText, songs);
        await interaction.editReply(msg);
        return;
    }

    if (MUSIC_PLAYING) return;

    const song = songs.shift();
    if (!song) {
        await interaction.editReply("**Error:** No songs in queue");
        return;
    }

    _playSong(userVoiceChannel, song);
    const embed = { title: "Playing:", description: song.title, color: "#6ab437" };
    const msg = { embeds: [embed] };
    await interaction.followUp(msg);
};

const _addToQueueMsg = (searchText, songs) => {
    const embed = {};

    let title = "";
    let description = "";
    if (songs.length > 1) {
        title = `Added ${songs.length} songs to the queue\n`;
        description = searchText;
    } else {
        title = "Added to queue:\n";
        description = songs[0].title;
    }

    embed.title = title;
    embed.description = description;
    embed.color = "#529fe3";

    return { embeds: [embed] };
};

const _playSong = (voiceChannel, song) => {
    // const connection = joinVoiceChannel({
    //     channelId: userVoiceChannel.id,
    //     guildId: userVoiceChannel.guild.id,
    //     adapterCreator: userVoiceChannel.guild.voiceAdapterCreator
    // });
    // TODO play audio logic
    MUSIC_PLAYING = song;
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
