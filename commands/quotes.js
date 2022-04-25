const mongoose = require("mongoose");
const lib = require("../lib");

const runCommand = async (client, interaction) => {
    const subcommand = interaction?.options?._subcommand;
    switch (subcommand) {
        case "list":
            list(interaction);
            break;
        case "random":
            random(interaction);
            break;
        case "show":
            show(interaction);
            break;
        case "add":
            add(interaction);
            break;
        case "remove":
            remove(interaction);
            break;
        default:
            await interaction.reply("Invalid command");
    }
};

const cleanup = async () => {};

const list = async interaction => {
    const quotes = await _getQuotes();

    let msg = "**Quotes**:\n>>> ";
    msg += quotes.map((quote, i) => `**${i}** - ${quote.text}`).join("\n");

    await interaction.reply(msg);
};

const random = async interaction => {
    const quotes = await _getQuotes();

    if (quotes.length === 0) {
        await interaction.reply("No quotes");
        return;
    }

    const randomIdx = Math.floor(Math.random() * quotes.length);
    let msg = ">>> ";
    msg += quotes[randomIdx].text;

    await interaction.reply(msg);
};

const show = async interaction => {
    const quotes = await _getQuotes();

    const args = interaction.options._hoistedOptions;
    const number = lib.argsValue(args, "number");

    if (number < 0 || number > quotes.length - 1) {
        await interaction.reply("Invalid number");
        return;
    }

    let msg = ">>> ";
    msg += quotes[number].text;

    await interaction.reply(msg);
};

const add = async interaction => {
    const args = interaction.options._hoistedOptions;
    const text = lib.argsValue(args, "text");

    await _addQuote(text);

    const msg = `Quote added: "${text}"`;

    await interaction.reply(msg);
};

const remove = async interaction => {
    const quotes = await _getQuotes();

    const args = interaction.options._hoistedOptions;
    const number = lib.argsValue(args, "number");

    if (number < 0 || number > quotes.length - 1) {
        await interaction.reply("Invalid number");
        return;
    }

    const quote = quotes[number];
    await _removeQuote(quote);

    const msg = `Removed quote: "${quote.text}"`;

    await interaction.reply(msg);
};

const Quote = mongoose.model(
    "Quote",
    new mongoose.Schema({
        text: {
            type: String,
            required: true
        }
    })
);

const _getQuotes = async () => {
    const quotes = await Quote.find({});
    return quotes;
};

const _addQuote = async text => {
    const data = new Quote({ text: text });
    const res = await data.save();
    return res;
};

const _removeQuote = async quote => {
    const res = await Quote.deleteOne({ _id: quote._id });
    return res;
};

module.exports = {
    name: "quotes",
    runCommand: runCommand,
    cleanup: cleanup,
    commands: [
        {
            name: "quotes",
            description: "Show a random quote",
            options: [
                {
                    type: 1,
                    name: "list",
                    description: "Show all quotes"
                },
                {
                    type: 1,
                    name: "random",
                    description: "Shows a random quote from the quotes list"
                },
                {
                    type: 1,
                    name: "show",
                    description: "Shows a specific quote from the quotes list",
                    options: [
                        {
                            type: 4,
                            name: "number",
                            description: "The number of the quote in the quotes list",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    name: "add",
                    description: "Add a new quote",
                    options: [
                        {
                            type: 3,
                            name: "text",
                            description: "The text of the quote that is being added",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    name: "remove",
                    description: "Remove a quote",
                    options: [
                        {
                            type: 4,
                            name: "number",
                            description: "The number of the quote in the quotes list",
                            required: true
                        }
                    ]
                }
            ]
        }
    ]
};
