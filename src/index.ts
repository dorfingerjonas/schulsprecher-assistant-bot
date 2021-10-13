import Discord from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env['NODE_ENV'] === 'development' ?
  process.env['DISCORD_DEV_TOKEN'] :
  process.env['DISCORD_PROD_TOKEN'];
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user!.tag}`);
});

client.on('message', message => {
  console.log(message.content);
});

client.login(token).catch(console.error);
