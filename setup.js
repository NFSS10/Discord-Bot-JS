const dotenv = require("dotenv");

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
    global.COMMANDS_QUOTES_ENABLED = process.env.COMMANDS_QUOTES_ENABLED !== "false";
};

const setupDevelopmentEnv = async () => {};

const setupProductionEnv = async () => {};

const clear = () => {
    // TODO
};

const killBot = () => {
    // TODO
    clear();
};

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

        // call `killBot()` on exit
        process.on("exit", () => killBot());
        process.on("SIGINT", () => killBot());
        process.on("SIGTERM", () => killBot());
        process.on("uncaughtException", () => killBot());

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
