const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

const isYoutubeURL = text => {
    return /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/.test(text);
};

const isYoutubePlaylist = text => {
    return /^.*(youtu.be\/|list=)([^#\&\?]*).*/.test(text);
};

const youtubeVideoId = url => {
    const match = url.match(
        /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
    );
    return match ? match[1] : null;
};

const youtubePlaylistId = url => {
    const match = url.match(/[?&]list=([^#\&\?]+)/);
    return match ? match[1] : null;
};

const videosList = async searchText => {
    let videosSearchResults = null;
    if (isYoutubePlaylist(searchText)) {
        const playListId = youtubePlaylistId(searchText);
        const playlistRes = await ytSearch({ listId: playListId });
        videosSearchResults = playlistRes.videos.length > 0 ? playlistRes.videos : [];
    } else if (isYoutubeURL(searchText)) {
        const videoId = youtubeVideoId(searchText);
        const video = await ytSearch({ videoId: videoId });
        videosSearchResults = video ? [video] : null;
    } else {
        const queryRes = await ytSearch({ query: searchText });
        const video = queryRes.videos.length > 0 ? queryRes.videos[0] : null;
        videosSearchResults = video ? [video] : null;
    }

    if (!videosSearchResults) return [];

    return videosSearchResults.map(video => ({
        title: video.title,
        url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`,
        image: video.image || video.thumbnail,
        duration: video.seconds || video.duration.seconds
    }));
};

const audioStream = url => {
    const stream = ytdl(url, { filter: "audioonly" });
    if (!stream) throw new Error("Can't load audio stream");
    return stream;
};

module.exports = {
    isYoutubeURL: isYoutubeURL,
    videosList: videosList,
    audioStream: audioStream
};
