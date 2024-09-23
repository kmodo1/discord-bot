const Discord = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const fetch = require("node-fetch");
const redis = require("redis");
const MersenneTwister = require("mersenne-twister");
const m = new MersenneTwister();
const Item = require("../utils/Item.js");
/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Number} uniquemembers
 * @param {redis.RedisClient} client 
 * @param {Object} cooldowns
 * @param {Object} farminglogs
 */
module.exports.run = async (bot, message, uniquemembers, client, cooldowns, farminglogs) => {
    //execute the javascript code given
    if (message.author.id != "[my id]") return;
    try {
        if (message.content.includes("await"))
            eval(message.content.substring(5));
        else
            new Function("bot", "message", "client", "uniquemembers", "cooldowns", "farminglogs", message.content.substring(5))(bot, message, client, uniquemembers, cooldowns, farminglogs);
    } catch (err) {
        if (err.message != "Cannot read property 'catch' of undefined") {
            return logmsg(err, bot, message);
        }
    }
    if (message.guild)
        if (message.channel.permissionsFor(bot.user).has("MANAGE_MESSAGES"))
            if (message && !message.content.includes("--nodelete"))
                message.delete();
}
module.exports.help = {
    name: "eval",
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
async function updateUniqueMembers(bot, message) { //updates the counter for how many unique members have joined the server - uses the cached _other_bot messages in #[welcome channel]
    console.log("Updating unique members...");
    var msgmap = await bot.channels.cache.find(c => c.name == "[welcome channel]").messages.fetch({ limit: 100 });
    for (let e = 0; e < 100; e++) {
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
async function logxpgain(bot, client) { //logs daily total xp gain to a channel
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
        console.log(`Done: ${sum}`);
        return sum;
    });
}