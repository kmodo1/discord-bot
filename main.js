const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const fetch = require("node-fetch");
const redis = require("redis");
const MersenneTwister = require("mersenne-twister");
const mt = new MersenneTwister();
const client = redis.createClient(process.env.REDIS_URL);
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'] });
var cooldowns = {};
var farminglogs = {};
var uniquemembers = 27746;
bot.commands = new Discord.Collection();
global.Cooldown = true;
var aaaaaa = true;
fs.readdir("./commands/", (err, files) => { //reads the command files and sets them into a collection
  if (err) console.log(err);
  let jsfiles = files.filter(file => file.split(".").pop() === "js");
  if (jsfiles.length <= 0) {
    console.log("Couldn't find commands.");
    return;
  }
  jsfiles.forEach((file, i) => {
    let cm = require(`./commands/${file}`);
    console.log(`${file} loaded!`);
    bot.commands.set(cm.help.name, cm);
  });
});
bot.on("ready", async () => { //various functions that execute when the bot starts
  console.log(`${bot.user.username} is online!`);
  bot.guilds.cache.forEach(async g => {
    await g.members.fetch();
    await g.roles.fetch();
  });
  bot.user.setActivity("EVERYTHING", { type: "WATCHING" });
  setInterval(async () => {
    var date = new Date();
    if ((date.getHours() - 5 == 0 && (date.getMinutes() == 0 || date.getMinutes() == 1)) && aaaaaa) {
      aaaaaa = false;
      setTimeout(() => {
        aaaaaa = true
      }, ms("10m"));
      logxpgain().then(() => {
        require("./utils/test.js").run(client).then(async () => {
          console.log("Updating _other_bot info...");
          client.set("xpdata", JSON.stringify(await get_other_bot()), function (err, res) {
            if (err) console.log(err);
          });
          console.log("Done!");
        })
      })
    }
  }, ms("1m"));
  //THIS CODE LOOKS FOR PREVIOUSLY MADE GIVEAWYS AND MAKES SURE THEY END CORRECTLY
  const messages = await bot.channels.cache.find(c => c.name == "giveaways").messages.fetch({ limit: 100 });
  var messagearray = [];
  let i = 0;
  messages.forEach(msg => {
    messagearray[i] = msg;
    i++;
  });
  messagearray = messagearray.filter(m => m.embeds[0] && (m.author.id == "[bot id]" || m.author.id == "[testing bot id]"));
  messagearray = messagearray.filter(m => m.embeds[0].footer.text == "Ends");
  for (let k = 0; k < messagearray.length; k++) {
    var time = messagearray[k].embeds[0].timestamp - Date.now()
    if (time < 0) time = 10000;
    try {
      setTimeout(async () => {
        var m = messagearray[k];
        var embd = messagearray[k].embeds[0];
        var reaction = await m.reactions.cache.get("🎉");
        await reaction.users.fetch();
        var rctns = reaction.users.cache;
        var userarray = [];
        for (const usr of rctns) {
          userarray[userarray.length] = usr[1];
        }
        var temp = "";
        let temp2 = "";
        if (embd.fields[0].value > reaction.count)
          embd.fields[0].value = reaction.count - 1;
        for (var i = 0; i < embd.fields[0].value; i++) {
          var temp3;
          do {
            temp2 = `${userarray[Math.floor(mt.random() * userarray.length)]}, `;
            temp3 = await m.guild.members.fetch(temp2.replace(/\D/g, ''));
          } while ((temp.indexOf(temp2) != -1) || (temp3.id == "[testing bot id]" || temp3.id == "[bot id]"));
          temp += temp2;
        }
        var prize = embd.description.substring(14, embd.description.length - 7);
        m.channel.send("Congrats " + temp + " you have won " + prize + "! " + m.url);
        var embd = m.embeds[0];
        var embed = new Discord.MessageEmbed()
          .setColor("#ffff99")
          .setAuthor("Giveaway Ended!", "[bot avatar]")
          .setDescription(":tada: Prize: " + prize + " :tada:")
          .addField("Winners: ", temp, true)
          .addField("Hosted By: ", `${embd.fields[1].value}`, true)
          .setFooter("Ended")
          .setTimestamp(embd.timestamp);
        if (embd.fields[2] && embd.fields[2].value)
          embed.addField("Required role", embd.fields[2].value);
        m.edit(embed);
      }, time);
    } catch (err) {
      logmsg(err, messagearray[k]);
    }
  }
  updateUniqueMembers();
  setInterval(updateUniqueMembers, ms("10h"));
  guild = bot.guilds.cache.find(g => g.id == "[server id]");
  client.get("giveaways2", async function (err, res) {
    if (err) console.log(err);
    if (res) {
      res = JSON.parse(res);
      for (const obj of res) {
        var time = (obj.len - (Date.now() - obj.date));
        if (time < -1 * ms("1d"))
          continue;
        try {
          var chn = await bot.channels.fetch(obj.chnid);
          var msg = await chn.messages.fetch(obj.msgid);
        } catch (err) {
          console.log("Issue with gstart2: " + err);
          continue;
        }
        if (time < 0) time = 100;
        console.log(`msgid: ${msg.id}, chnid: ${chn.id}, time: ${ms(time)}`);
        setTimeout(async () => {
          if (msg.embeds[0].footer.text != "Ends") return;
          var reaction = await msg.reactions.cache.get("🎉");
          var embd = msg.embeds[0];
          await reaction.users.fetch();
          var rctns = reaction.users.cache;
          var userarray = [];
          for (const usr of rctns) {
            userarray[userarray.length] = usr[1];
          }
          var temp = "";
          var temp2;
          var temp3;
          if (embd.fields[0].value > reaction.count)
            embd.fields[0].value = reaction.count - 1;
          for (var i = 0; i < embd.fields[0].value; i++) {
            do {
              temp2 = `${userarray[Math.floor(mt.random() * userarray.length)]}, `;
              temp3 = msg.guild.members.cache.get(temp2.replace(/\D/g, ''));
            } while ((temp.indexOf(temp2) != -1) || (temp3.id == "[testing bot id]" || temp3.id == "[bot id]"));
            temp += temp2;
          }
          var prize = embd.description.substring(14, embd.description.length - 7);
          chn.send("Congrats " + temp + " you have won " + prize + "! " + msg.url);
          var embd = msg.embeds[0];
          var embed = new Discord.MessageEmbed()
            .setColor("#ffff99")
            .setAuthor("Giveaway Ended!", "[bot avatar]")
            .setDescription(":tada: Prize: " + prize + " :tada:")
            .addField("Winners: ", temp, true)
            .addField("Hosted By: ", `${embd.fields[1].value}`, true)
            .setFooter("Ended")
            .setTimestamp(embd.timestamp);
          msg.edit(embed);
          client.get("giveaways2", function (err, res) {
            if (err) console.log(err);
            if (res) {
              res = JSON.parse(res);
              var ind = res.indexOf(res.find(m => m.msgid == msg.id));
              res.splice(ind, 1);
              return client.set("giveaways2", JSON.stringify(res));
            }
          });
        }, time);
      }
    }
  });
});
bot.on("message", async message => { // various functions that execute when certain messages are sent
  if (message.content.toLowerCase().includes("--ignore")) return;
  if (message.author.id != "[my id]" && message.channel.type == "dm") return; //doesn't process dms from people that aren't me
  if ((message.channel.name == "[command channel]" || message.channel.name == "[level-up-channel]") && (message.author.id == "[_other_bot id]" || message.author.id == "[my id]")) { //only works with messages sent by me or _other_bot in a channel called [level-up-channel] or [bot-channel-2]
    client.get("lvlroles", function (err, res) {
      try {
        var lvlroles = JSON.parse(res); //gets the lvlroles file
      } catch (err) {
        logmsg(err, message);
      }
      lvlroles.forEach(async element => { //sorts through the lvlroles and if the level matches one of the values, assigns the associated role
        try {
          if (message.content.endsWith(`level ${element.level}!`)) {
            await message.mentions.members.first().roles.add(message.guild.roles.cache.find(r => r.id == element.role));
          }
        } catch (err) {
          logmsg(err, message);
        }
      });
    });
  }
  if (message.author.bot) return;
  if (message.attachments.first()) {
    await message.fetch();
    var em = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setDescription(message.id)
      .setTimestamp(Date.now())
      .setFooter(`ID: ${message.author.id} | Created`);
    message.attachments.forEach(async ma => {
      em.attachFiles(ma)
    });
    bot.channels.cache.find(c => c.name.includes("images")).send(em);
  }
  if (message.content.startsWith("-")) {
    let cmd = message.content.split(" ")[0].toLowerCase().substring(1);
    let commandfile = bot.commands.get(cmd);
    if (commandfile) {
      if (message.channel.type != "dm")
        if (message.channel.name.includes("[suggestions channel]") && (cmd == "suggest" || cmd == "approve" || cmd == "deny"))
          return commandfile.run(bot, message);
      if (message.guild) {
        if ((message.guild.id == "[server id]" && (message.channel.name == "[bot-channel]" || message.channel.name == "[bot-channel-2]")) || message.guild.id == "[testing/admin server]" || message.author.id == "[my id]") {  //works in test server, [server owner's name] server, and for me
          if (cmd == "stats")
            commandfile.run(bot, message, uniquemembers);
          else if (commandfile.help.red)
            commandfile.run(bot, message, client);
          else if (cmd == "eval")
            commandfile.run(bot, message, uniquemembers, client, cooldowns, farminglogs);
          else commandfile.run(bot, message);
          return
        }
      }
      else {
        if (message.author.id == "[my id]") {   //works for me
          if (cmd == "stats")
            commandfile.run(bot, message, uniquemembers);
          else if (commandfile.help.red)
            commandfile.run(bot, message, client);
          else if (cmd == "eval")
            commandfile.run(bot, message, uniquemembers, client, cooldowns, farminglogs);
          else commandfile.run(bot, message);
          return;
        }
      }
      if (cmd == "hmute" || cmd == "hunmute" || cmd == "hpromote" || cmd == "hdemote") return commandfile.run(bot, message)
    }
  }
  client.get("options", function (err, res) {
    if (err) console.log(err);
    res = JSON.parse(res);
    if (!farminglogs[message.author.id] && message.content.length <= res.LENGTHREQ) {
      farminglogs[message.author.id] = 1;
    }
    else {
      if (message.content.length <= res.LENGTHREQ) {
        farminglogs[message.author.id]++;
      }
      else {
        farminglogs[message.author.id] = 0;
      }
    }
    if (farminglogs[message.author.id] >= 10 && farminglogs[message.author.id] % 5 == 0) {
      var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setDescription(`In <#${message.channel.id}>, [message](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
        .setFooter(`User ID: ${message.author.id}`)
        .setTimestamp(Date.now())
        .addField("Number of messages < " + (res.LENGTHREQ + 1) + " length:", farminglogs[message.author.id]);
      bot.channels.cache.get("[logging channel]").send(embed);
    }
  });
  if (!message.member) return;
  var mbr = message.member;
  client.get("options", function (err, res) {
    if (err) console.log(err);
    res = JSON.parse(res);
    if (!res.ENABLED) return;
    if (message.content.length < res.LENGTHREQ || message.channel.name == '[bot-channel]' || message.channel.name == 'music-select' || message.channel.name == '[level-up-channel]' || message.channel.name == '[chat channel]' || message.channel.name == '[welcome channel]') return;
    if (cooldowns[message.author.id] == undefined || ((cooldowns["" + message.author.id] - Date.now()) < (res.COOLDOWN * -1))) {
      var temp = (mt.random() * res.TOKEN_CHANCE);
      cooldowns[message.author.id] = Date.now();
      if (temp <= 1) {
        client.get("" + message.author.id, function (err, res) {
          if (err) console.log(err);
          if (res) {
            res = JSON.parse(res);
            console.log(message.author.id + " : " + res._currency);
            if (Number.isInteger(res.MODIFIER))
              res._currency += res.MODIFIER;
            else {
              var last = res.MODIFIER % 1;
              res._currency += Math.floor(res.MODIFIER);
              if (mt.random() < last)
                res._currency++;
            }
            client.set("" + message.author.id, JSON.stringify(res), function (err, res) {
              if (err) console.log(err);
            });
          }
          else
            client.set("" + message.author.id, JSON.stringify({ TOKENS: 1, MODIFIER: 1 }), function (err, res) {
              if (err) console.log(err);
            });
        });
      }
    }
    else {
      return;
    }
  });
  if (mbr.roles.cache.find(r => r.name.toLowerCase() == "muted") && message.author.id != "[my id]") {
    if (message.channel.permissionsFor(bot.user).toArray().indexOf("MANAGE_MESSAGES") != -1) {
      return message.delete();
    }
  }
});
bot.on("messageReactionAdd", async (reaction, user) => { //stuff that happens when reactions are added
  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.log('Something went wrong when fetching the reaction: ', error);
      return;
    }
  }
  if (user.id == "[testing bot id]" || user.id == "[bot id]") return;
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.log('Something went wrong when fetching the reaction: ', error);
      return;
    }
  }
  var msg = await reaction.message.fetch();
  if (!msg.guild) return;
  if (reaction.emoji.name == "🎉") {
    if ((msg.author.id == "[testing bot id]" || msg.author.id == "[bot id]") && msg.embeds[0]) {
      if (msg.embeds[0].footer)
        if (msg.embeds[0].footer.text.toLowerCase() == "ends" && msg.embeds[0].fields[2]) {
          let mbr = msg.guild.members.cache.find(m => m.id == user.id);
          let type = msg.embeds[0].fields[2].name;
          if (type == "Required role") {
            let rl = msg.guild.roles.cache.find(r => r.id == msg.embeds[0].fields[2].value.replace(/\D/g, ''));
            if (!mbr.roles.cache.has(rl.id))
              await msg.reactions.cache.get("🎉").users.remove(mbr.id);
          }
          else if (type == "Required role (all are required)") {
            for (let i of msg.embeds[0].fields[2].value.split(", ")) {
              if (!mbr.roles.cache.has(i.replace(/\D/g, ''))) {
                await msg.reactions.cache.get("🎉").users.remove(mbr.id);
                return console.log(i);
              }
            }
          }
          else if (type == "Required role (one is required)") {
            let takerole = true;;
            for (let i of msg.embeds[0].fields[2].value.split(", ")) {
              if (mbr.roles.cache.has(i.replace(/\D/g, ''))) {
                takerole = false;
              }
            }
            setTimeout(async () => {
              if (takerole) {
                await msg.reactions.cache.get("🎉").users.remove(mbr.id);
                return;
              }
            }, 100);
          }
        }
    }
  }
  var mbr = await msg.guild.members.fetch(user.id);
  if (msg.channel.name.toLowerCase() != "giveaways" && mbr.roles.cache.find(r => r.name.toLowerCase() == "muted") && !msg.channel.name.includes("suggest") && !msg.channel.name.includes("role")) {
    if (msg.channel.permissionsFor(bot.user).toArray().indexOf("MANAGE_MESSAGES") != -1) {
      if (reaction.emoji.id)
        await msg.reactions.cache.get(reaction.emoji.id).users.remove(user.id);
      else
        await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
    }
  }
  if (msg.id == "[reaction message id]")
    client.get(`${user.id}`, async function (err, res) {
      if (err) return console.log(err);
      if (!res) {
        if (reaction.emoji.id)
          return await msg.reactions.cache.get(reaction.emoji.id).users.remove(user.id);
        if (reaction.emoji.name)
          return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
      }
      res = JSON.parse(res);
      var taketokens = true;
      if (reaction.emoji.id)
        if (!res._currency && res._currency !== 0) return await msg.reactions.cache.get(reaction.emoji.id).users.remove(user.id);
      if (reaction.emoji.name)
        if (!res._currency && res._currency !== 0) return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
      var rl;
      if (reaction.emoji.id)
        switch ("" + reaction.emoji.id) {
          case "[specific reaction id]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.id).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          default: return await msg.reactions.cache.get(reaction.emoji.id).users.remove(user.id);
        }
      else
        switch ("" + reaction.emoji.name) {
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          case "[specific reaction]":
            rl = mbr.guild.roles.cache.get("[specific role id]");
            if (mbr.roles.cache.has(rl.id))
              return await mbr.roles.remove(rl);
            if (res._specific_role_name) {
              taketokens = false;
              await mbr.roles.add(rl);
            }
            else {
              if (res._currency >= 10)
                await mbr.roles.add(rl);
              else {
                taketokens = false
                return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
              }
            }
            res._specific_role_name = true;
            break;
          default: return await msg.reactions.cache.get(reaction.emoji.name).users.remove(user.id);
        }
      if (taketokens)
        res._currency = res._currency - 10;
      setTimeout(() => {
        client.set(`${user.id}`, JSON.stringify(res), function (err, res) {
          if (err) console.log(err);
        });
      }, 10);
    });
});
bot.on("guildMemberAdd", async mbr => {
  if (mbr.user.username == "[specific bot name]") {
    mbr.ban({days: 0, reason: "bot"})
  }
  if (mt.random() < 0.5) uniquemembers++;
  setTimeout(async () => {
    if (!mbr) return;
    var rl1 = mbr.guild.roles.cache.get("[specific new member role]");
    var rl2 = mbr.guild.roles.cache.get("[specific new member role]");
    if (!rl1 || !rl2) return;
    try {
      await mbr.roles.add(rl1);
      await mbr.roles.add(rl2);
    } catch (err) {
      if (err.name != "DiscordAPIError" && err.message != "Unknown Member")
        console.log(err);
    }
  }, ms("10m"));
});
bot.on("messageDelete", async message => {
  if (!message) return;
  if (!message.id) return;
  if (!message.partial) {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;
  }
  var ch = (bot.channels.cache.find(c => c.name.includes("images")));
  var cnt = 0;
  do {
    let msgs = (await ch.messages.fetch({ limit: 100 })).array();
    var msg = msgs.find(m => m.embeds[0].description == message.id);
    cnt++;
  } while (!msg && cnt < 5);
  if (!msg) return;
  var e = msg.embeds[0];
  if (!e) return;
  msg.attachments.forEach(ma => {
    e.attachFiles(ma)
  });
  e.fields = [];
  bot.channels.cache.find(c => c.name.includes("dyno-log")).send(e);
});
async function logmsg(err, msg) { //logs a message to both the console, and a channel in the test server, with a random error code, the date, user tag, message, and user id
  let d = new Date();
  let errorcode = Math.floor(Math.random() * 1000000);
  msg.channel.send("Something went wrong, please make sure you followed the syntax correctly!, Errorcode: " + errorcode);
  console.log(err);
  console.log("Message: " + msg.content + ", User: " + msg.author.tag + "(ID: " + msg.author.id + "), Errorcode: " + errorcode);
  console.log("Time:" + d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " at: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds());
  let embed = new Discord.MessageEmbed()
    .setTitle(err.name)
    .setDescription(err.message)
    .addField("Message: ", msg.content)
    .setFooter("User: " + msg.author.tag + "(ID: " + msg.author.id + "), Errorcode: " + errorcode)
    .setColor("#fc6400")
    .setTimestamp(Date.now());
  let guild = bot.guilds.cache.find(g => g.id == "[testing/admin server]");
  let channel = guild.channels.cache.find(c => c.name == "[error channel]");
  try {
    return channel.send(embed);
  } catch (err) {
    console.log(err);
  }
}
async function updateUniqueMembers() { //updates the counter for how many unique members have joined the server - uses the cached _other_bot messages in #[welcome channel]
  console.log("Updating unique members...");
  var msgmap = await bot.channels.cache.find(c => c.name == "[welcome channel]").messages.fetch({ limit: 100 });
  for (let e = 0; e < 1000; e++) {
    var min = msgmap.last();
    msgmap = msgmap.concat(msgmap, await bot.channels.cache.find(c => c.name == "[welcome channel]").messages.fetch({ limit: 100, before: "" + min.id }));
  }
  var messagearray = [];
  msgmap.forEach(msg => {
    if (msg.mentions.users.first()) {
      if (messagearray.indexOf(msg.mentions.users.first().id) == -1)
        messagearray[messagearray.length] = msg.mentions.users.first().id;
    }
  });
  console.log("Done!");
  return uniquemembers = messagearray.length;
}
async function get_other_bot() { //gets _other_bot info, parses it, and returns an array of the lvl 2+ people
  try {
    xpinfo = await fetch(`https://_other_bot.xyz/api/plugins/levels/leaderboard/[server id]?limit=1000&page=0`)
      .then(response => response.json());
    if (!xpinfo)
      return {
        message: "Something went wrong while fetching the information!"
      };
    if (!xpinfo.players && xpinfo.players) {
      return xpinfo.error;
    }
    xpinfo = xpinfo.players;
    if (!xpinfo)
      return {
        message: "Something went wrong while fetching the information!"
      };
    xpinfo.unshift({ "time": Date.now() });
  } catch (err) {
    if (typeof err == fetch.FetchError) {
      return {
        message: "Something went wrong while fetching the information!"
      };
    }
    console.log(err);
  }
  let info = {};
  info['time'] = xpinfo[0];
  for (let i = 1; i < xpinfo.length; i++) {
    if (xpinfo[i].level > 1) {
      info[xpinfo[i].id] = {
        "xp": xpinfo[i].xp,
      }
    }
    else {
      i = xpinfo.length;
    }
  }
  return info;
}
async function logxpgain() { //logs daily total xp gain to a channel
  client.get("xpdata", async function (err, res) {
    console.log("Logging xpgain...")
    if (err) console.log(err);
    var d = new Date(Date.now() - ms("7h"))
    var info1, info2;
    try {
      info1 = JSON.parse(res);
    } catch (err) {
      console.log(err);
    }
    try {
      info2 = await get_other_bot();
    } catch (err) {
      console.log(err);
    }
    let info = [];
    info[0] = {
      "timedif": info2['time'].time - info1['time'].time
    };
    var count = 1;
    for (const x in info2) {
      if (info2.hasOwnProperty(x)) {
        if (x != 'time') {
          if (!info1[x]) {
            info[count] = {
              "id": x,
              "xpgain": info2[x].xp
            }
            count++;
          }
          else {
            if ((info2[x].xp - info1[x].xp) > 0) {
              info[count] = {
                "id": x,
                "xpgain": info2[x].xp - info1[x].xp
              }
              count++;
            }
          }
        }
      }
    }
    var sum = 0;
    for (let m = 1; m < info.length; m++) {
      sum += info[m].xpgain;
    }
    var month = d.getMonth() + 1;
    try {
      bot.channels.cache.find(c => c.name == "xp").send(month + "/" + d.getDate() + "/" + (d.getFullYear() + ": ").substring(2) + sum);
    } catch (err) {
      console.log(err);
    }
    console.log(`Done: ${sum}`);
    return sum;
  });
}
bot.login(process.env.TOKEN);