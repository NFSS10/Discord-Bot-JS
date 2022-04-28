# Discord Bot JS

Just another Discord bot ¯\_(ツ)\_/¯

## Project setup

**1º** Install

```bash
yarn install
```

**2º** Setup environment variables. You can use a `.env` file to set the variables.

**Required environment variables:**
| Name | Description |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ENV** | Environment the bot will run on (`DEV` for development and `PROD` for production). |
| **DISCORD_BOT_TOKEN** | Discord bot token. [How to generate token](docs/SETUP.md#3-generate-the-bot-token). |

**Optional environment variables:**
| Name | Default | Description |
| -------------- | ------- | --------------------------------- |
| **MONGODB_URI** | `undefined` | Mongo DB connection URI. |
| **EXTRA_COMMANDS_ZIP_URL** | `undefined` | URL for the .zip that contains extra commands files. |
| **COMMANDS_QUOTES_ENABLED** | `true` | Enables/disables quotes commands. |
| **COMMANDS_MUSIC_ENABLED** | `true` | Enables/disables music commands. |
| **DEV_GUILD_ID** | `undefined` | Guild ID, aka server's ID (**Required if in development environment**). |

## Running in Development

```bash
yarn dev
```

## Running in Production

```bash
yarn start
```
