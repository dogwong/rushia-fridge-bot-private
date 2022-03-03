const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const simpleGit = require('simple-git')();
const fs = require("fs");

const STRINGS = require("./strings.json");

/** @type {import("discord.js").Client} */
let client;

const COMMAND_CHANNEL = "943436102134530098";

function shutdown () {
  setTimeout(() => {
    process.exit();
  }, 1000);
}

async function init(discordInstance) {
  client = discordInstance;

  console.log("autoResponder init");

  console.log("Reading git commit info...");
  let botCommitId = "";
  /** @type {import("dayjs").Dayjs} */
  let botLastUpdate;
  let botCommitCount = "";
  await new Promise((resolve, reject) => {
    simpleGit.revparse(["HEAD"], (err, result) => {
      if (err) {
        console.log("get commit id failed");
      } else {
        botCommitId = result;
        console.log("rev", result);
      }
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    simpleGit.log({"-1": null}, (err, result) => {
      if (err) {
        console.log("get commit time failed");
      } else {
        botLastUpdate = dayjs(result.latest.date, "YYYY-MM-DD HH:mm:ss Z");
        console.log("date", result.latest.date);
      }
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    simpleGit.raw(["rev-list", "--count", "HEAD"], (err, result) => {
      if (err) {
        console.log("get commit count failed");
      } else {
        botCommitCount = (result).trim()
        console.log("count", result);
      }
      resolve();
    });
  });

  console.log("Read git commit info done", botCommitId, botCommitCount, botLastUpdate.utcOffset(8).format("YYYY-MM-DD HH:mm"));

  console.log("Reading auto responses...");
  let responseTxt = fs.readFileSync("./component/responses.txt", "utf8");
  let responseList = responseTxt.split("\n").map(response => {
    try {
      let responseObj = JSON.parse(response);

      if (!responseObj.code || (!responseObj.text_reply && !responseObj.file_reply)) {
        return null;
      }

      let ignoreEmoji = responseObj.code[1] == "1" ? true : false;
      let globalEnable = responseObj.code[2] == "1" ? true : false;
      let useReply = responseObj.code[3] == "1" ? true : false;

      return {
        code: responseObj.code,
        ignoreEmoji: ignoreEmoji,
        globalEnable,
        useReply,
        keyword: responseObj.keyword.toLowerCase(),
        reply: responseObj.text_reply.trim(),
        fileReply: responseObj.file_reply.trim(),
      };
    } catch (error) {
      console.log("parse response failed", error);
    }
    
    return null;
  }).filter(response => response);

  console.log(responseList);


  let isBotEnabled = true;
  let isTestMode = process.env["TEST_MODE"] ? true : false;

  let guild = await client.guilds.fetch("919202470125797426");
  let emojis = await guild.emojis.fetch();

  const channelText = await client.channels.cache.get(COMMAND_CHANNEL); // 指令

  let replyPrefix = "";
  if (isTestMode) {
    replyPrefix = `${STRINGS.test_mode} `;
    await channelText.send(replyPrefix + `${STRINGS.startup} (bot started up)\n自動回覆條件 ${responseList.length} 個`);
  } else {
    await channelText.send(replyPrefix + `${STRINGS.startup} (bot started up)\nrev \`${botCommitId.substring(0, 7)}\` , version ${botCommitCount} @ ${botLastUpdate.utcOffset(8).format("YYYY-MM-DD HH:mm")}\n自動回覆條件 ${responseList.length} 個`);
  }

  process.on('SIGINT', async function () {
    console.log("SIGINT received, please wait...");
    await channelText.send(replyPrefix + `${STRINGS.startup} (bot stopping)`);
    shutdown();
  });


  client.on("messageCreate", async message => {
    if (message.author.bot) return;

    // console.log("messageCreate", message);
    // channel filter
    // if (message.channelId !== "935999729672802344" && message.channelId !== "939808103837347860") return;

    if (message.content) {
      const content = message.content;
      // role filter
      
      let allowedRole = message.member.roles.cache.has("919614615938289764") || 
        message.author.id === "177732847422013440"; // me

      // if (allowedRole && content.startsWith("send ")) {
        

      // } else 
      if (allowedRole && message.channelId === COMMAND_CHANNEL && content.startsWith("<@")) {
        let regexp = new RegExp(`^<@!?${client.user.id}> (.*)`, "igs");
        let result = regexp.exec(content);

        if (!result || result.length !== 2) return;

        if (result[1] === "on") {
          if (isBotEnabled) {
            message.reply(replyPrefix + "自動回覆已經開啟");
          } else {
            isBotEnabled = true;
            message.reply(replyPrefix + "開啟自動回覆");
            // client.user.setPresence({
            //   status: "online",
            // });
          }
        } else if (result[1] === "off") {
          if (isBotEnabled) {
            isBotEnabled = false;
            message.reply(replyPrefix + "關閉自動回覆");
            // client.user.setPresence({
            //   status: "idle",
            // });
            // client.user.setStatus("idle");
          } else {
            message.reply(replyPrefix + "自動回覆已經關閉");
          }
        } else if (message.author.id === "177732847422013440" && result[1] === "restart") {
          await message.reply(replyPrefix + `${STRINGS.shutdown} (bot shutting down)`);
          shutdown();
        } else if (result[1].startsWith("send ")) {
          let command = /^send <#(\d+)> (.*)/igs.exec(result[1]);
          console.log("result", command);

          if (!command || command.length !== 3) return;

          // check if channel exists
          message.guild.channels.fetch(command[1]).then(channel => {
            
            if (channel.isText()) {
              const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId(`sd confirm`)
                    .setLabel("確定")
                    .setStyle("PRIMARY"),
                  new MessageButton()
                    .setCustomId(`sd cancel`)
                    .setLabel("取消")
                    .setStyle("SECONDARY"),
                );
              const embed = new MessageEmbed()
                .setColor("#77d4bc")
                .setTitle(`確認發送`)
                .setDescription(command[2])
                .setFields([{
                  name: `至 #${channel.name} ?`,
                  value: `${channel.id}`,
                }]);

              message.reply({
                embeds: [
                  embed,
                ],
                components: [row],
              });

            } else {
              message.reply(replyPrefix + `<#${command[1]}> 不是文字頻道`);
            }
          })
          .catch(e => {
            if (e.httpStatus === 404) {
              message.reply(replyPrefix + `錯誤: 找不到頻道 (\`${command[1]}\`) 請檢查bot是否有檢視該頻道的權限`);
            } else {
              message.reply(replyPrefix + `錯誤: ${e?.code} (${e?.httpStatus}) ${e.name}\n${e?.message}`);
            }
          });
        }

      } else if (!isTestMode || (isTestMode && message.channelId === COMMAND_CHANNEL)) {
        const allowedChannel = [
          "943436102134530098", // 指令
          "935999729672802344", // 試bot
          "939808103837347860", // 試bot - test
          "923190510670213121", // v豚討論區
          "933306836864614421", // 雜談
          "931163765590872095", // 練舞室
          "932667071618228276", // 不可以澀澀！
          "923306378020421672", // 點唱站
          "931180514293981284", // 可以澀澀！
          "923557754667421726", // 眾籌參與者討論區
          "943172731338366996", // 打氣區
        ].includes(message.channelId);
        let lowerContent = content.toLowerCase();
        const noEmojiContent = lowerContent.replace(/<a?:\w+:\d+/g, "");

        // search through the list
        for (let i = 0; i < responseList.length; i++) {
          const trigger = responseList[i];
          let ok = false;

          // detect keyword within emoji
          if (trigger.ignoreEmoji) {
            lowerContent = noEmojiContent;            
          } else {
            if (!lowerContent.includes(trigger.keyword)) {
              continue;
            }
          }
          // contains keyword
          let index = lowerContent.indexOf(trigger.keyword);

          // check keyword position
          // "文字完全符合", 1, "文字包含", 2, "文字開頭為", 3, "文字結尾為", 4, "其他(起註備寫)", 5
          if (trigger.code[0] == "1" && index === 0 && lowerContent.length == trigger.keyword.length) {
            ok = true;
          } else if (trigger.code[0] == "2" && index >= 0) {
            ok = true;
          } else if (trigger.code[0] == "3" && index === 0) {
            ok = true;
          } else if (trigger.code[0] == "4" && index === lowerContent.length - trigger.keyword.length) {
            ok = true;
          }

          if (!ok) {
            continue;
          }

          // channel filter
          if (trigger.globalEnable || (!isTestMode && allowedChannel && isBotEnabled) || (isTestMode && message.channelId === COMMAND_CHANNEL)) {
            let reply = `${trigger.reply.replace("<@>", `<@${message.author.id}>`)}`;
            let options = {
              content: replyPrefix + `${reply}`,
            };
            if (trigger.fileReply) {
              options.files = [trigger.fileReply];
            }
            if (trigger.useReply) {
              message.reply(options);
            } else {
              message.channel.send(options);
            }
            break;
          }
        }
        
      }
    }
    
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;
    console.log(interaction);

    /**
     * @type {import("discord.js").Message}
     */
    let reference = await interaction.message.fetchReference();
    if (!reference) {
      interaction.reply({
        ephemeral: true,
        content: "錯誤: 找不到原訊息",
      });
      return;
    }
    // await interaction.deferReply();
    if (interaction.user.id !== reference.author.id) {
      interaction.reply({
        ephemeral: true,
        content: "你不是原作者",
      });
      return;
    }

    if (interaction.customId === "sd confirm") {
      const content = interaction.message.embeds[0].description;
      const inputChannelId = interaction.message.embeds[0].fields[0].value;
      if (/[^\d]+/i.test(inputChannelId)) {
        await interaction.followUp(`錯誤: embeds[0].fields[0].value #`);
        return;
      }
      let channelId = inputChannelId;

      const channel = await interaction.guild.channels.fetch(channelId);
      if (!channel) {
        await interaction.followUp(`錯誤: 找不到頻道 (\`${result[1]}\`) 請檢查bot是否有檢視該頻道的權限`);
        return;
      } else if (!channel.isText()) {
        message.reply(`<#${channelId}> 不是文字頻道`);
        return;
      }

      channel.send(content).then(() => {
        interaction.message.edit({
          content: "已發送",
          embeds: [],
          components: [],
        });
      }).catch(e => {
        let replyMessage = "";
        if (e.httpStatus === 404) {
          replyMessage = `錯誤: 找不到頻道 (\`${result[1]}\`) 請檢查bot是否有檢視該頻道的權限`;
        } else {
          replyMessage = `錯誤: ${e?.code} (${e?.httpStatus}) ${e.name}\n${e?.message}`;
        }
        interaction.message.edit({
          content: replyMessage,
          embeds: [],
          components: [],
        });
      });

    } else if (interaction.customId === "sd cancel") {
      interaction.message.edit({
        content: "已取消",
        embeds: [],
        components: [],
      });
    }

  });
}

module.exports.init = init;
