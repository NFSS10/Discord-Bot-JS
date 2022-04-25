const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
} = require("@discordjs/voice");
const lib = require("../lib");

// Variables
let MUSIC_QUEUE = [];
let MUSIC_PLAYING = null;
let AUDIO_PLAYER = null;

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

const cleanup = async () => {
    MUSIC_QUEUE = [];
    MUSIC_PLAYING = null;
    if (AUDIO_PLAYER) AUDIO_PLAYER.stop();
    AUDIO_PLAYER = null;
};

const play = async (client, interaction) => {
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

    MUSIC_QUEUE.push(...songs);
    if (MUSIC_PLAYING) {
        const msg = _addToQueueMsg(searchText, songs);
        await interaction.editReply(msg);
        return;
    }

    if (MUSIC_PLAYING) return;

    try {
        await _playNextSongInQueue(userVoiceChannel, interaction);
    } catch (error) {
        await cleanup();
        console.error(error);
        await interaction.followUp("**ERROR:** Something went wrong :(");
    }
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

const _playNextSongInQueue = async (voiceChannel, interaction) => {
    const song = MUSIC_QUEUE.shift();
    if (!song) {
        const connection = getVoiceConnection(voiceChannel.guild.id);
        if (connection) connection.destroy();

        await cleanup();
        await interaction.followUp("No more songs in queue");
        return;
    }

    // join voice channel and start playing the songs audio
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    // get the song audio stream
    let audioStream = null;
    switch (song.source) {
        case "youtube":
            audioStream = await lib.Youtube.audioStream(song.url);
            break;
        default:
            throw new Error(`Unsupported song source: ${song.source}`);
    }

    // setup audio player
    AUDIO_PLAYER = AUDIO_PLAYER || createAudioPlayer();
    connection.subscribe(AUDIO_PLAYER);

    // start playing audio
    const audioResource = createAudioResource(audioStream);
    AUDIO_PLAYER.on(AudioPlayerStatus.Idle, (oldState, newState) => {
        if (oldState !== AudioPlayerStatus.Playing) return;
        _playNextSongInQueue(voiceChannel, interaction);
    });
    AUDIO_PLAYER.on("error", error => {
        throw error;
    });
    AUDIO_PLAYER.play(audioResource);

    // update playing song
    MUSIC_PLAYING = song || null;
    if (!MUSIC_PLAYING) return;

    // sending message informing which song started playing
    const embed = { title: "Playing:", description: song.title, color: "#6ab437" };
    const msg = { embeds: [embed] };
    await interaction.followUp(msg);
};

module.exports = {
    name: "music",
    runCommand: runCommand,
    cleanup: cleanup,
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
