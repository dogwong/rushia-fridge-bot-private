const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

/** @type {import("discord.js").Client} */
let client;

function shutdown () {
  setTimeout(() => {
    process.exit();
  }, 1000);
}

async function init(discordInstance) {
  client = discordInstance;

  console.log("autoResponder init");

  let isBotEnabled = true;
  let isTestMode = process.env["TEST_MODE"] ? true : false;

  let guild = await client.guilds.fetch("919202470125797426");
  let emojis = await guild.emojis.fetch();

  const channelText = await client.channels.cache.get("935999729672802344"); // 試bot

  if (isTestMode) {
    channelText.send(`[:warning: TESTING MODE] こんるし！ (bot started up)`);
  } else {
    channelText.send(`こんるし！ (bot started up)`);
  }


  client.on("messageCreate", async message => {
    if (message.author.bot) return;

    // console.log("messageCreate", message);
    // channel filter
    // if (message.channelId !== "935999729672802344" && message.channelId !== "939808103837347860") return;

    if (message.content) {
      const content = message.content;
      let replyPrefix = "";
      if (isTestMode) {
        replyPrefix = "[:warning: TESTING MODE] ";
      }
      // role filter
      
      let allowedRole = message.member.roles.cache.has("919614615938289764") || 
        message.author.id === "177732847422013440"; // me

      if (message.channelId === "935999729672802344" && message.author.id === "177732847422013440" && message?.content === "restart") { // 試bot
        await message.reply("またね！ (bot shutting down)");
        shutdown();
      } else if (allowedRole && content.startsWith("send ")) {
        let result = /^send <#(\d+)> (.*)/igs.exec(content);
        console.log("result", result);

        if (!result || result.length !== 3) return;

        // check if channel exists
        message.guild.channels.fetch(result[1]).then(channel => {
          
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
              .setDescription(result[2])
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
            message.reply(`<#${result[1]}> 不是文字頻道`);
          }
        })
        .catch(e => {
          if (e.httpStatus === 404) {
            message.reply(`錯誤: 找不到頻道 (\`${result[1]}\`) 請檢查bot是否有檢視該頻道的權限`);
          } else {
            message.reply(`錯誤: ${e?.code} (${e?.httpStatus}) ${e.name}\n${e?.message}`);
          }
        });

      } else if (message.channelId === "935999729672802344" && content.startsWith("<@")) {
        let result = /<@!?939564813842010152> (.*)/igs.exec(content);
        if (!result || result.length !== 2) return;

        if (result[1] === "on") {
          if (isBotEnabled) {
            message.reply("自動回覆已經開啟");
          } else {
            isBotEnabled = true;
            message.reply("開啟自動回覆");
            // client.user.setPresence({
            //   status: "online",
            // });
          }
        } else if (result[1] === "off") {
          if (isBotEnabled) {
            isBotEnabled = false;
            message.reply("關閉自動回覆");
            // client.user.setPresence({
            //   status: "idle",
            // });
            // client.user.setStatus("idle");
          } else {
            message.reply("自動回覆已經關閉");
          }
        }

      } else if (!isTestMode || (isTestMode && message.channelId === "935999729672802344")) {
        const allowedChannel = [
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
        const lowerContent = content.toLowerCase();
        if (lowerContent.indexOf("若凌") >= 0) {
          message.channel.send(replyPrefix + `<:word_1_waka:939216597149687809> <:word_2_ryou:939216597317476483> <:word_3_se:939216597149712466> <:word_4_ichi:939216597468463144> `);
        } else if (lowerContent.indexOf("waka") >= 0) {
          message.channel.send(replyPrefix + `<:word_1_waka:939216597149687809> <:word_2_ryou:939216597317476483> <:word_3_se:939216597149712466> <:word_4_ichi:939216597468463144> `);
        } else if (lowerContent.indexOf("ryou") >= 0) {
          message.channel.send(replyPrefix + `<:word_1_waka:939216597149687809> <:word_2_ryou:939216597317476483> <:word_3_se:939216597149712466> <:word_4_ichi:939216597468463144> `);
        } else if (lowerContent.indexOf("猩") >= 0) {
          message.channel.send(replyPrefix + `<:ppt_gorilla:937763398303776889>`);
        } else if (lowerContent.indexOf("gorilla") >= 0) {
          message.channel.send(replyPrefix + `<:ppt_gorilla:937763398303776889>`);
        }

        if ((!isTestMode && allowedChannel && isBotEnabled) || (isTestMode && message.channelId === "935999729672802344")) {
          if (lowerContent.indexOf("砧板") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 今晚送你去見羽衣媽媽 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("平板") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 今晚瞓雪櫃 <:rushia_yandere:933141388147691570>`);
          } else if (lowerContent.indexOf("雪櫃") >= 0) {
            message.reply(replyPrefix + `你係咪好掛住我部雪櫃呢 <:rushia_yandere:933141388147691570>`);
          } else if (lowerContent.indexOf("冰箱") >= 0) {
            message.reply(replyPrefix + `你鍾意我部雪櫃嗎？`);
          } else if (lowerContent.indexOf("冷蔵庫") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 係咪好想入雪櫃？今晚你去陪羽衣媽媽啦，佢好寂寞`);
          // } else if (lowerContent.indexOf("平") >= 0) {
          //   message.reply(`吓？你講多次？`);
  
          } else if (lowerContent.indexOf("星街") >= 0) {
            message.channel.send(replyPrefix + `<@${message.author.id}> 今天也很小 <:rushia_yandere4:940325425538797598>`);
          } else if (lowerContent.indexOf("團長") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("pekora") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("peko") >= 0) {
            message.reply(replyPrefix + `點解要提起其他女人 <:rushia_cry:933156110741946408> `);
          } else if (lowerContent.indexOf("ねね") >= 0) {
            message.reply(replyPrefix + `呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("nene") >= 0) {
            message.reply(replyPrefix + `點解要提起其他女人 <:rushia_cry:933156110741946408>`);
          } else if (lowerContent.indexOf("桃鈴") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("音音") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("かなた") >= 0) {
            message.reply(replyPrefix + `點解要提起其他女人 <:rushia_cry:933156110741946408>`);
          } else if (lowerContent.indexOf("kanata") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("fubuki") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 呢個女人係邊個 <a:rushia_dare:939596214796697661>`);
          } else if (lowerContent.indexOf("fbk") >= 0) {
            message.reply(replyPrefix + `點解要提起其他女人 <:rushia_cry:933156110741946408>`);
          } else if (lowerContent.indexOf("るしあ") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 你咁掛住我，我好開心❤️❤️❤️ <:rushia_nya:937372390705487984>`);
          } else if (lowerContent.indexOf("rushia") >= 0) {
            if (!/<a?:\w+hi\w+:\d+>/ig.test(content)){ // within emoji name
              message.reply(replyPrefix + `你掛住るしあ嗎？`);
            }
  
          } else if (lowerContent.indexOf("こんるし") >= 0) {
            message.reply(replyPrefix + `<@${message.author.id}> 我好掛住你，你喺邊呀❤️❤️❤️ <:rushia_yandere:933141388147691570>`);
          } else if (lowerContent.indexOf("早晨") >= 0) {
            message.reply(replyPrefix + `早晨～今天也要好好陪るしあ哦❤️`);
          } else if (lowerContent.indexOf("hi") === 0) {
              message.reply(replyPrefix + `こんるし～今天要陪るしあ嗎？`);
          } else if (lowerContent.indexOf("早抖") >= 0) {
            message.reply(replyPrefix + `おつるし～祝你發個boing boing夢 <:rushia_nya:937372390705487984>`);
          } else if (lowerContent.indexOf("瞓") >= 0) {
            message.reply(replyPrefix + `今天辛苦了～今晚要陪るしあ睡覺嗎❤️`);
          } else if (lowerContent.indexOf("おつるし") >= 0) {
            message.reply(replyPrefix + `今天辛苦了～祝你發個boing boing夢 <:rushia_nya:937372390705487984>`);
            
          } else if (lowerContent.indexOf("boing") >= 0) {
            message.channel.send(replyPrefix + `<@${message.author.id}> social credit +50`);
          } else if (lowerContent.indexOf("dogwong") >= 0) {
            message.reply(replyPrefix + `💜💚`);
          // } else if (content.indexOf("") >= 0) {
          //   message.channel.send(`<@${message.author.id}> `);
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
