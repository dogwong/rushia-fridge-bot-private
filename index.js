require("dotenv").config({ path: "local-dev.env" });
const fs = require("fs");
const dayjs = require("dayjs");
const cron = require("node-cron");
const { Client, Intents, Activity } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});


async function init() {
  // check env variables
  function nullCheck(...args) {
    args.map(arg => {
      if (!process.env[arg])
        throw new Error(`Missing env variable: ${arg}`);
    });
  }
  // pre-launch env variable check
  nullCheck("DCBOT_TOKEN");

  client.login(process.env["DCBOT_TOKEN"]);
};
init();

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  require("./component/autoResponder").init(client);
  
});


client.on("ratelimit", async (rateLimitInfo) => {
  console.log("RateLimit!", rateLimitInfo);
});

client.on("messageCreate", async message => {
  // console.log("messageCreate", message);
});
