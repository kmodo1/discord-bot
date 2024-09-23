const Discord = require("discord.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports.run = async (bot, message) => {
    //help command, basic shows different sections, sections shows help for commands
    switch (message.content.toLowerCase().split(" ")[1]) {
        case undefined:
        case null:
        case "":
        case " ":
            try {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("[bot name] Command Help", bot.user.avatarURL())
                    .setDescription("Made by <@![my id]>, dm me for any issues/bugs/help!")
                    .setColor("#66e666")
                    .addField("Level Roles", "`-help levelroles`", true)
                    .addField("Information", "`-help info`", true)
                    .addField("Giveaways", "`-help giveaways`", true)
                    .addField("Other", "`-help other`", true)
                    .setTimestamp(Date.now())
                    .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
                try {
                    message.channel.send(embed);
                } catch (err) {
                    logmsg(err, bot, message);
                }
            } catch (err) {
                logmsg(err, bot, message);
            }
            break;
        case "levelroles":
        case "lvlroles":
            try {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("Level Role Command Help", bot.user.avatarURL())
                    .setColor("#66e666")
                    .addField("-addlvlrole [level] [roleid]", "`Adds a new level role using the given level and role id`", true)
                    .addField("-rmvlvlrole [level] [roleid]", "`Removes an existing level role using the given level and role id`", true)
                    .setTimestamp(Date.now())
                    .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
                try {
                    message.channel.send(embed);
                } catch (err) {
                    logmsg(err, bot, message);
                };
            } catch (err) {
                logmsg(err, bot, message);
            }
            break;
        case "information":
        case "info":
            try {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("Information Command Help", bot.user.avatarURL())
                    .setColor("#66e666")
                    .addField("-ping", "`Returns both the ping to the user and to Discord's servers`", true)
                    .addField("-stats", "`Gives various server stats(members, emojis, channels, unique members)`", true)
                    .addField("-mystats", "`Gives stats about you(join date, register date, roles)`", true)
                    .addField("-getstats [user id,name, or tag]", "`Gives stats about someone else(join date, register date, roles)`", true)
                    .addField("-daily", "`Gives daily _other_bot xp leaderboards, resets at 12 AM EST`", true)
                    .setTimestamp(Date.now())
                    .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
                try {
                    message.channel.send(embed);
                } catch (err) {
                    logmsg(err, bot, message);
                };
            } catch (err) {
                logmsg(err, bot, message);
            }
            break;
        case "giveaway":
        case "giveaways":
            try {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("Giveaway Command Help", bot.user.avatarURL())
                    .setDescription("You can use --force to bypass confirmations (in -gend and -gcancel)")
                    .setColor("#66e666")
                    .addField("-gstart ", "`Guides you through the process of making a giveaway`", true)
                    .addField("-gend [channel name/id] [msg id]", "`Immediately ends a giveaway and selects winners`", true)
                    .addField("-gcancel [channel name/id] [msg id]", "`Cancels a giveaway`", true)
                    .addField("-gstart2", "`Same as gstart, but allows you to choose the channel`", true)
                    .addField("-greroll", "`Rerolls a giveaway that has already ended`", true)
                    .setTimestamp(Date.now())
                    .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
                try {
                    message.channel.send(embed);
                } catch (err) {
                    logmsg(err, bot, message);
                };
            } catch (err) {
                logmsg(err, bot, message);
            }
            break;
        case "other":
        case "others":
            try {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("Other Command Help", bot.user.avatarURL())
                    .setColor("#a50c0c")
                    .addField("-suggest", "`lets you suggest to a suggest type in dms`", true)
                    .addField("-suggest [suggestion]", "`works in any of the suggestion channels`", true)
                    .addField("-refreshroles", "`parses the last 100 messages in level ups for your last level role and gives you the appropriate roles`", true)
                    .addField("-refreshroles [message id]", "`same as the other version, but you give it the message id to parse`", true)
                    .addField("-myinv", "`shows how many tokens you have and what is in your inventory`", true)
                    .addField("-getinv [user id,name, or tag]", "`gets the same info for someone else`", true)
                    .setTimestamp(Date.now())
                    .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL());
                try {
                    message.channel.send(embed);
                } catch (err) {
                    logmsg(err, bot, message);
                };
            } catch (err) {
                logmsg(err, bot, message);
            }
            break;
        default:
            message.channel.send("Could not find that section, please run -help");
            break;
    }
}
module.exports.help = {
    name: "help",
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