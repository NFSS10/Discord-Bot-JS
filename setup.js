const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const nodePath = require("path");
const lib = require("./lib");

const setupGlobals = async env => {
    // Environment variables (required)
    global.ENV = env || process.env.ENV;
    global.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

    if (global.ENV !== "DEV" && global.ENV !== "PROD") {
        throw new Error(`Invalid environment setup, 'ENV' has an invalid value (${global.ENV})`);
    }
    if (!global.DISCORD_BOT_TOKEN) throw new Error("Invalid environment setup, 'DISCORD_BOT_TOKEN' is not set");

    // Environment variables (optional)
    global.MONGODB_URI = process.env.MONGODB_URI;
    global.EXTRA_COMMANDS_ZIP_URL = process.env.EXTRA_COMMANDS_ZIP_URL;
    global.COMMANDS_QUOTES_ENABLED = process.env.COMMANDS_QUOTES_ENABLED !== "false";
    global.COMMANDS_MUSIC_ENABLED = process.env.COMMANDS_MUSIC_ENABLED !== "false";

    // Environment variables (optional)
    global.DEV_GUILD_ID = process.env.DEV_GUILD_ID;
    if (global.ENV === "DEV" && !global.DEV_GUILD_ID) {
        throw new Error("Invalid DEV setup, 'DEV_GUILD_ID' is required when in development mode");
    }
};

const setupDevelopmentEnv = async () => {};

const setupProductionEnv = async () => {};

const setupMongoose = async () => {
    if (!global.MONGODB_URI) {
        console.log("Skipping Mongoose DB setup, 'MONGODB_URI' is not set");
        return;
    }

    console.log("\nMongoose DB setup...");

    await mongoose.connect(global.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};

const setupExtraCommands = async () => {
    if (!global.EXTRA_COMMANDS_ZIP_URL) {
        console.log("Skipping extra commands setup, 'EXTRA_COMMANDS_ZIP_URL' is not set");
        return;
    }

    console.log("\nExtra commands setup...");

    // ensure folders exist
    const tmpFolderPath = nodePath.join(__dirname, "./tmp/commands-extra");
    const extraCommandsFolderPath = nodePath.join(__dirname, "./commands-extra");
    fs.mkdirSync(tmpFolderPath, { recursive: true });
    fs.mkdirSync(extraCommandsFolderPath, { recursive: true });

    // download and extract extra commands
    console.log(`Downloading zip from ${global.EXTRA_COMMANDS_ZIP_URL}`);
    await lib.Utils.downloadFileAndSave(global.EXTRA_COMMANDS_ZIP_URL, "extra-commands.zip", tmpFolderPath);
    const tmpZipPath = nodePath.join(tmpFolderPath, "extra-commands.zip");
    await lib.Utils.unzip(tmpZipPath, extraCommandsFolderPath);

    // logging info about downloaded files
    console.log("Extra commands files:");
    const files = fs.readdirSync(extraCommandsFolderPath);
    files.forEach(file => console.log(` - ${file}`));

    // delete zip file
    fs.unlinkSync(tmpZipPath);
};

const exitApp = async () => {};

const setupEnvironment = async env => {
    try {
        console.log("\nSetup starting...");
        dotenv.config();

        await setupGlobals(env);

        switch (global.ENV) {
            case "PROD":
                await setupProductionEnv();
                break;
            case "DEV":
                await setupDevelopmentEnv();
                break;
            default:
                throw new Error("Invalid environment");
        }

        await setupMongoose();
        await setupExtraCommands();

        // error handler
        process.on("unhandledRejection", error => {
            console.error("Unhandled promise rejection:", error);
        });

        // handle app exit
        process.on("exit", async () => await exitApp());
        process.on("SIGINT", async () => await exitApp());
        process.on("SIGTERM", async () => await exitApp());
        process.on("uncaughtException", async () => await exitApp());

        console.log("\nSetup completed!");

        // Log some of the setup information
        console.log("ENV:", global.ENV);
        console.log("MONGODB_URI is set:", Boolean(global.MONGODB_URI));
        console.log("");
    } catch (error) {
        console.error("\nSetup failed :(\n");
        console.log(error);
        process.exit(1);
    }
};

module.exports = {
    setupEnvironment: setupEnvironment
};
