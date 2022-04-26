const https = require("https");
const extractZip = require("extract-zip");
const fs = require("fs");
const nodePath = require("path");

/**
 * Gets the value of a specific argument that was passed throught the slash commands.
 *
 * @param {Array} args Array of arguments.
 * @param {String} name Name of the argument we want to extract the value.
 * @returns {String|Number} Returns the value of a specific argument.
 */
const argsValue = (args, name) => {
    const match = args.find(arg => arg.name === name);
    return match ? match.value : null;
};

/**
 * Downloads a file from a URL.
 *
 * @param {String} url URL to download the file from.
 * @returns {Promise} Resolves with the file content.
 */
const downloadFile = async url => {
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode !== 200) reject(new Error(`Problem downloading ${url}`));
            resolve(response);
        });
    });
};

/**
 * Downloads a file from a URL and saves it to the disk.
 *
 * @param {String} url URL to download the file from.
 * @param {String} fileName Name of the file that is going to be saved.
 * @param {String} destFolder Path to the folder where the file will be saved.
 * @returns {Promise} Resolves when the file is saved in the disk.
 */
const downloadFileAndSave = async (url, fileName, destFolder) => {
    return new Promise((resolve, reject) => {
        downloadFile(url)
            .then(response => {
                const filePath = nodePath.join(destFolder, fileName);
                const stream = response.pipe(fs.createWriteStream(filePath));
                stream.on("finish", () => resolve(filePath));
            })
            .catch(error => reject(error));
    });
};

/**
 * Unzips a zip file to a specific folder.
 *
 * @param {String} zipPath Path to the zip file.
 * @param {String} destFolder Path to the folder where the zip file will be extracted.
 * @returns {Promise} Resolves when the zip file is extracted.
 */
const unzip = async (zipPath, destFolder) => {
    const fullDestPath = nodePath.resolve(destFolder);
    return extractZip(zipPath, { dir: fullDestPath });
};

module.exports = {
    argsValue: argsValue,
    downloadFile: downloadFile,
    downloadFileAndSave: downloadFileAndSave,
    unzip: unzip
};
