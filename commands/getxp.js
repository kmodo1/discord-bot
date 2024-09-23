const Discord = require("discord.js");
const redis = require("redis");
/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @param {redis.RedisClient} client
 */
module.exports.run = async (bot, message, client) => {
	if (!message.content.split(" ")[1])
		getSendXp(message, client, message.author);
	else {
		var str = message.content.toLowerCase().split(" ")[1];
		var user = message.guild.members.cache.find(m => m.user.id == str.replace(/\D/g, ''));
		if (!user)
			user = message.guild.members.cache.find(m => m.user.tag.toLowerCase() == str);
		if (!user)
			user = message.guild.members.cache.find(m => m.user.username.toLowerCase() == str);
		if (!user) return message.channel.send("Please supply a valid user username, tag, id, or mention");
		getSendXp(message, client, user.user);
	}
}
module.exports.help = {
	name: "getxp",
	red: true
}
/**
 * @param {Discord.Message} message 
 * @param {redis.RedisClient} client 
 * @param {Discord.User} user 
 */
function getSendXp(message, client, user) {
	client.get(`${user.id}gains`, function (err, res) {
		if (err) return console.log(err);
		if (!res) return message.reply("Sorry, nothing stored yet!");
		res = JSON.parse(res);
		var ar = res.XP;
		var tot = 0;
		for (var i of ar)
			tot += i;
		var avg = tot / ar.length;
		var embed = new Discord.MessageEmbed()
			.setAuthor(`Last 10 days of xp gain for ${user.tag}`, user.avatarURL())
			.setDescription(`Average daily XPgain: ${avg}\nTotal daily XPgain: ${tot}`)
			.setTimestamp(Date.now())
			.setFooter("Created by " + message.author.tag);
		var a = "```js\n";
		for (let i = ar.length - 1; i > ar.length - 11 && i > -1; i--) {
			if ((ar.length - i) == 1)
				a += `${ar.length - i} day ago: ${ar[i]}\n`
			else
				a += `${ar.length - i} days ago: ${ar[i]}\n`;
		}
		a = a.substring(0, a.length - 1);
		a += "```"
		embed.addField("Last 10 days of xp", a);
		message.channel.send(embed);
	});
}