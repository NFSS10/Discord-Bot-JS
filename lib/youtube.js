const isYoutubeURL = text => {
    return /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/.test(text);
};

const videosList = searchText => {
    // TODO
    return [];
};

const audioStream = url => {
    // TODO
};

module.exports = {
    isYoutubeURL: isYoutubeURL,
    videosList: videosList,
    audioStream: audioStream
};
