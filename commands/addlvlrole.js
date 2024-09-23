const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
  //adds a lvlrole to the file, with a given level and role
  if (message.guild)
    if (!message.member.permissions.has("MANAGE_ROLES") && message.author.id != "[my id]") return;
  if (message.guild.id != "[server id]") return message.channel.send("You can't do that in this server!");
  try {
    client.get("lvlroles", function (err, res) {
      if (err) console.log(err);
      try {
        var lvlroles = JSON.parse(res); //reads the lvlroles file
      } catch (err) {
        logmsg(err, message);
      }
      let a = message.content.toLowerCase().split(" ")[2];
      let rl = message.guild.roles.cache.find(r => r.id == a);
      if (!rl) rl = message.guild.roles.cache.find(r => r.name.toLowerCase() == a);
      if (!rl) return message.reply("Could not find that role!");
      message.guild.members.cache.find(m => m.id == "[my id]").user.send(`level role added: level ${message.content.toLowerCase().split(" ")[1]} and ${rl.name}`);
      message.channel.send(`level role added: level ${message.content.toLowerCase().split(" ")[1]} and ${rl.name}`);
      lvlroles[lvlroles.length] = {
        "level": message.content.toLowerCase().split(" ")[1],
        "role": rl.id
      }
      client.set("lvlroles", JSON.stringify(lvlroles), function (err, res) {
        if (err) console.log(err);
      });
    });
  } catch (err) {
    logmsg(err, bot, message);
  }
}
module.exports.help = {
  name: "addlvlrole",
  red: true
}
async function logmsg(err, bot, msg) { //logs a message to both the console, and a channel in the test server, with a random error code, the date, user tag, message, and user id
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