const isYoutubeURL = text => {
    return /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/.test(text);
};

module.exports = {
    isYoutubeURL: isYoutubeURL
};
