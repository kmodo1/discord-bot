const Discord = require("discord.js");
const redis = require("redis");
const { renderGoogleChart } = require("../utils/charrender.js");
/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @param {redis.RedisClient} client
 */
module.exports.run = async (bot, message, client) => {
    if (!global.Cooldown)
        return await message.channel.send("Sorry, please wait for one request to fufill before trying again!");
    if (!message.content.split(" ")[1])
        getSendChart(message, client, message.author);
    else {
        var str = message.content.toLowerCase().split(" ")[1];
        var user = message.guild.members.cache.find(m => m.user.id == str.replace(/\D/g, ''));
        if (!user)
            user = message.guild.members.cache.find(m => m.user.tag.toLowerCase() == str);
        if (!user)
            user = message.guild.members.cache.find(m => m.user.username.toLowerCase() == str);
        if (!user) return message.channel.send("Please supply a valid user username, tag, id, or mention");
        getSendChart(message, client, user.user);
    }
}
module.exports.help = {
    name: "getxpchart",
    red: true
}
/**
 * @param {Discord.Message} message
 * @param {redis.RedisClient} client
 * @param {Discord.User} user 
 */
function getSendChart(message, client, user) {
    client.get(`${user.id}gains`, function (err, res) {
        if (err) return console.log(err);
        if (!res) return message.reply("Sorry, nothing stored yet!");
        res = JSON.parse(res);
        let drawChart = `function drawChart() {
        let sd = \"${res.SD}\";
        let d = Date.parse(sd);
        let ar = [ ${res.XP} ];
        let arr = [
            ['Date', 'XpGain']
        ];
        for (let i = 0; i < ar.length; i++) {
            arr.push([dt(d + (86400000 * i)), ar[i]]);
        }
        var data = google.visualization.arrayToDataTable(arr);
        var options = {
            title: 'Daily Xp Gain for ${user.username}',
            curveType: 'function',
            legend: { position: 'bottom' }
        };
        const chart = new google.visualization.LineChart(container);
        chart.draw(data, options);
        function dt(a) {
            let d = new Date(a);
            console.log(a);
            return ((d.getMonth() + 1) + "/" + d.getDate() + "/" + (d.getFullYear() + "").substring(2));
        }
    }`;
        try {
            global.Cooldown = false;
            renderGoogleChart(drawChart)
                .then(async image => {
                    global.Cooldown = true;
                    await message.channel.send(new Discord.MessageAttachment(image));
                })
                .catch(err => {
                    global.Cooldown = true;
                    console.log(err);
                });
            setTimeout(() => {
                global.Cooldown = true;
            }, 30000);
        } catch (err) {
            global.Cooldown = true;
            console.log(err);
        }
    });
}