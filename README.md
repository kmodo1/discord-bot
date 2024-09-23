# Discord Bot

This bot was something I started making near the start of the 2020 school year, and was something I did for a 3 main reasons:
- I wanted to learn JavaScript, and get better at coding
- I liked Discord, and wanted to learn how to make a Discord bot myself
- I was requested to by the owner of the server

At the time I made this bot, I had only take my first year of computer science classes, and other than some summer camps and youtube videos, I didn't know much about coding, which you can probably see if you look through the code. I continued working on this bot for a while, and I still sometimes do some maintenance on it, but I haven't been actively developing it for years. Now, something to note is that this bot is the **cleaned** version, meaning that I've scrubbed the personal information that I could reasonably remove (e.g. my user id, the server's id, etc), so it will not run in the current state, and a couple commands have been removed, but the modifications were minimal.

## Functionality
- Currency system: The bot gives people currency rarely based on their chatting, with variables that can be modified by server admins. This currency can be spent on special color roles, various items, and various other trinkets.
- Giveaways: The bot allows you to create custom giveaways with differing time limits, required roles, winner amounts, and rewards.
- Suggestions: The bot allows users to make their own suggestions, and allows admins to accept or reject these suggestions in specific channels.
- Xp logging and level roles: This bot relies on the xp calculations of a different discord bot, but it can use that to automatically assign roles, display a daily xp leaderboard, and give each user an individualized chart of their xp gains. 
- Stats: The bot allows you to see stats on yourself (e.g. when you joined the server, how old your account is, etc) as well as on others, the server, and random other things (like the bot's ping to discord and to you).

For further explanation of what each command does, read through the commands/help.js file.

## How to Run
This bot has a variety of features, but something to notice is that much of them are hardcoded based on certain roles, channels, users, etc. This bot was made to work on one specific server, and I took shortcuts towards that goal, which does make it a little harder to get running. However, if you replace all those specific channel ids and user ids with things on your server, or just delete them, you can run the bot simply by getting a heroku server up and running, getting a discord token and bot set up on the discord developers portal, and then running the bot on heroku with the proper settings (make sure it does npm install and etc).