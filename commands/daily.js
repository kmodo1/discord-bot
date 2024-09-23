const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const fetch = require("node-fetch");
const redis = require("redis");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 */
module.exports.run = async (bot, message, client) => {
    //returns the daily leaderboards for _other_bot xp gain
    client.get("xpdata", async function (err, res) {
        if (err) console.log(err);
        var info1, info2;
        try {
            info1 = JSON.parse(res);
        } catch (err) {
            logmsg(err, bot, message);
        }
        try {
            info2 = await get_other_bot();
            if (info2.message)
                return message.reply("Error(on _other_bot's end): " + info2.message);
        } catch (err) {
            return logmsg(err, bot, message);
        }
        let info = [];
        info[0] = {
            "timedif": info2['time'].time - info1['time'].time
        };
        var count = 1;
        for (const x in info2) {
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
        var temp = [];
        temp[0] = info[0];
        info.splice(0, 1);
        var leng = info.length;
        for (let h = 0; h < leng; h++) {
            var maxind = 0;
            for (let j = 0; j < info.length; j++) {
                if (info[maxind].xpgain < info[j].xpgain) {
                    maxind = j;
                }
            }
            temp[h + 1] = info[maxind];
            info.splice(maxind, 1);
        }
        var em = new Discord.MessageEmbed()
            .setAuthor("_other_bot stats for " + message.guild.name, message.guild.iconURL())
            .setFooter(message.author.tag + "(" + message.author.id + ")", message.author.avatarURL())
            .setColor("#7af8e8")
            .setTimestamp(Date.now());
        await bot.guilds.cache.find(g => g.id == "[server id]").members.fetch();
        if (temp.length < 2) {
            em.addField("Leaderboard for xp gain in the last " + ms(temp[0].timedif), "No one has talked today yet :(");
        }
        else if (temp.length < 11) {
            var msg2 = "```js\n";
            for (let m = 1; m < temp.length; m++) {
                var temp92188 = bot.guilds.cache.find(g => g.id == "[server id]").members.cache.get(temp[m].id);
                if (!temp92188)
                    msg2 += m + ": " + temp[m].id + ", " + temp[m].xpgain + "\n";
                else if (temp92188.nickname)
                    msg2 += m + ": " + temp92188.nickname + ", " + temp[m].xpgain + "\n";
                else
                    msg2 += m + ": " + temp92188.user.username + ", " + temp[m].xpgain + "\n";
            }
            msg2 += "```";
            em.addField("Leaderboard for xp gain in the last " + ms(temp[0].timedif, { long: true }), msg2);
        }
        else {
            var msg2 = "```js\n";
            for (let m = 1; m < 11; m++) {
                var temp92188 = bot.guilds.cache.find(g => g.id == "[server id]").members.cache.get(temp[m].id);
                if (!temp92188)
                    msg2 += m + ": " + temp[m].id + ", " + temp[m].xpgain + "\n";
                else if (temp92188.nickname)
                    msg2 += m + ": " + temp92188.nickname + ", " + temp[m].xpgain + "\n";
                else
                    msg2 += m + ": " + temp92188.user.username + ", " + temp[m].xpgain + "\n";
            }
            msg2 += "```";
            em.addField("Leaderboard for xp gain in the last " + ms(temp[0].timedif, { long: true }), msg2);
        }
        if (temp.find(e => e.id == message.author.id)) {
            let temp777 = temp.find(e => e.id == message.author.id);
            em.addField("Your position", "```js\n" + temp.indexOf(temp777) + ": " + message.author.username + ", " + temp[temp.indexOf(temp777)].xpgain + "\n```");
        }
        message.channel.send(em);
    });
}
module.exports.help = {
    name: "daily",
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
async function get_other_bot() { //ges _other_bot info, parses it, and returns an array of the lvl 2+ people
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