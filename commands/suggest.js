const Discord = require("discord.js");
const ms = require("ms");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //does stuff
    try {
        var channel;
        var cancelled = false;
        var type = 1;
        var suggestion = "";
        if (message.channel.name.includes("[suggestions channel]")) {
            switch (message.channel.name) {
                case "[different suggestions channel]": type = 1; break;
                case "[different suggestions channel]": type = 2; break;
                case "[different suggestions channel]": type = 3; break
                case "[different suggestions channel]": type = 4; break;
                case "[different suggestions channel]": default: return message.reply("Please use `-suggest` in #[bot-channel], or `-suggest [suggestion] in one of the suggestions channels`");
            }
            suggestion = message.content.substring(9);
            message.delete();
        }
        else {
            var filter = m => (parseInt(m.content) && (0 < parseInt(m.content) && parseInt(m.content) < 5) && (parseInt(m.content) != 3));
            await message.author.send("What type of suggestion is this?\n1: Content(YT, Stream, etc) Suggestion\n2: Discord Suggestions(also includes [bot name])\n3: Other Suggestion (Jokes, more specific things, etc) (CURRENTLY SHUT DOWN)\n4: [type] suggestions(Only suggest if [some condition])\n`You may say cancel to cancel`")
                .then(async (m) => {
                    channel = m.channel;
                    await channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                        .then(async messages => {
                            if (messages.first().content.toLowerCase() == "cancel") {
                                cancelled = true;
                                return channel.send("Cancelled");
                            }
                            type = parseInt(messages.first().content.toLowerCase());
                        })
                        .catch(() => {
                            cancelled = true;
                            return;
                        })
                })
                .catch(() => {
                    cancelled = true;
                    return message.channel.send(`<@!${message.author.id}>, I can't dm you!`);
                });
            if (cancelled) return;
            filter = m => (m.content);
            await channel.send("What is the suggestion?")
                .then(async () => {
                    await channel.awaitMessages(filter, { max: 1, time: ms("20m"), errors: ['time'] })
                        .then(async messages => {
                            if (messages.first().content.toLowerCase() == "cancel") {
                                cancelled = true;
                                return channel.send("Cancelled");
                            }
                            suggestion = messages.first().content;
                        })
                        .catch(() => {
                            cancelled = true;
                            return;
                        })
                })
                .catch(() => {
                    cancelled = true;
                    return message.channel.send(`<@!${message.author.id}>, I can't dm you!`);
                });
            if (cancelled) return;
        }
    } catch (err) {
        return logmsg(err, bot, message);
    }
    var temp = "";
    var chn;
    var color = "";
    if (!suggestion) return message.channel.send(`<@!${message.author.id}>, you need to supply a suggestion`).then(m => {
        setTimeout(() => {
            if (message.deletable)
                message.delete();
            m.delete();
        }, 5000);
    });
    switch (type) {
        case 1: case "[type]": temp = "[suggestion type]:"; color = "#665454"; chn = message.guild.channels.cache.find(c => c.name.toLowerCase() == "[different suggestion channel]"); break;
        case 2: case "[type]": temp = "[suggestion type]:"; color = "#665454"; chn = message.guild.channels.cache.find(c => c.name.toLowerCase() == "[different suggestion channel]"); break;
        case 3: case "[type]": temp = "[suggestion type]:"; color = "#17ac86"; chn = message.guild.channels.cache.find(c => c.name.toLowerCase() == "[different suggestion channel]"); break;
        case 4: case "[type]": temp = "[suggestion type]: "; color = "#665454"; chn = message.guild.channels.cache.find(c => c.name.toLowerCase() == "[different suggestion channel]"); break;
    }
    var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL())
        .addField(temp, suggestion)
        .setColor(color)
        .setTimestamp(Date.now())
        .setFooter("Created");
    chn.send(embed)
        .then(async m => {
            await m.react("⬆");
            await m.react("⬇");
        });
    bot.channels.cache.get("[logging channel]").send(embed);
}
module.exports.help = {
    name: "suggest",
    red: false
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