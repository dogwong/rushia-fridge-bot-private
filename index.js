require("dotenv").config();
const fs = require("fs");
const dayjs = require("dayjs");
const cron = require("node-cron");
const { Client, Collection, Events, GatewayIntentBits, Partials, Activity, SlashCommandBuilder, REST, Routes } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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
  
  client.user.setStatus('idle');
});


client.on("ratelimit", async (rateLimitInfo) => {
  console.log("RateLimit!", rateLimitInfo);
});

client.on("messageCreate", async message => {
  // console.log("messageCreate", message);
});
