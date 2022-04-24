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

module.exports = {
    argsValue: argsValue
};
