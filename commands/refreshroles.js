const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client
 */
module.exports.run = async (bot, message, client) => {
    //refreshes levelroles
    if (!message.content.split(" ")[1])
        try {
            var msgmap = await bot.channels.cache.find(c => c.name == "[level-up-channel]").messages.fetch({ limit: 100 });
            var rolemsg;
            msgmap.forEach(msg => {
                if (msg.mentions.users.first()) {
                    if (msg.mentions.users.first.id == message.author.id)
                        if (!rolemsg) rolemsg == msg;
                        else if (rolemsg.createdTimestamp < msg.createdTimestamp) rolemsg = msg;
                }
            });
            if (rolemsg)
                client.get("lvlroles", function (err, res) {
                    try {
                        var lvlroles = JSON.parse(res); //gets the lvlroles file
                    } catch (err) {
                        logmsg(err, bot, message);
                    }
                    lvlroles.forEach(async element => { //sorts through the lvlroles and if the level matches one of the values, assigns the associated role
                        try {
                            var lvl = rolemsg.content.split(" ").pop();
                            lvl = parseInt(lvl.substring(0, lvl.length - 1));
                            if (lvl >= element.level) {
                                await message.member.roles.add(message.guild.roles.cache.find(r => r.id == element.role));
                            }
                        } catch (err) {
                            logmsg(err, message);
                        }
                    });
                });
        } catch (err) {
            logmsg(err, bot, message);
        }
    else {
        var channel = bot.channels.cache.find(c => c.name == "[level-up-channel]");
        var msg = await channel.messages.fetch("" + message.content.split(" ")[1]);
        if (!msg) return message.channel.send("Please supply a valid message id to a valid message");
        if (!msg.mentions.users.first()) return message.channel.send("Please supply a valid message id to a valid message");
        if (msg.mentions.users.first().id != message.author.id) return message.channel.send("Not you!");
        client.get("lvlroles", function (err, res) {
            try {
                var lvlroles = JSON.parse(res); //gets the lvlroles file
            } catch (err) {
                logmsg(err, bot, message);
            }
            lvlroles.forEach(async element => { //sorts through the lvlroles and if the level matches one of the values, assigns the associated role
                try {
                    var lvl = msg.content.split(" ").pop();
                    lvl = parseInt(lvl.substring(0, lvl.length - 1));
                    if (lvl >= element.level) {
                        await message.member.roles.add(message.guild.roles.cache.find(r => r.id == element.role));
                    }
                } catch (err) {
                    logmsg(err, bot, message);
                }
            });
        });
    }
}
module.exports.help = {
    name: "refreshroles",
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