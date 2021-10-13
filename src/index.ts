import Discord, { Intents, ThreadChannel } from 'discord.js';
import dotenv from 'dotenv';
import admin, { ServiceAccount } from 'firebase-admin';

import serviceAccount from './schuelervertretung-service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: 'https://schuelervertretung-892f3-default-rtdb.europe-west1.firebasedatabase.app'
});

dotenv.config();

const token = process.env['NODE_ENV'] === 'development' ?
  process.env['DISCORD_DEV_TOKEN'] :
  process.env['DISCORD_PROD_TOKEN'];
const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS
  ]
});

const allowedRoles = [
  'Admin',
  'SV',
  'Mod'
];

const db = admin.database();

client.on('ready', () => {
  console.log(`Logged in as ${ client.user!.tag }`);
});

client.on('messageCreate', message => {
  if (message.content.toLocaleLowerCase().startsWith('!submit')) {
    if (message.member?.roles.cache.some(role => allowedRoles.includes(role.name)) && message.channel.isThread()) {
      const thread = message.channel as ThreadChannel;

      thread.parent?.messages.fetch().then(messages => {
        const original = messages.find(msg => msg.id === thread.id);
        const ref = db.ref('tasks');

        ref.push({
          createdBy: thread.ownerId,
          threadName: thread.name,
          editor: message.author.id,
          originalMsg: {
            author: original?.author.id,
            content: original?.content
          }
        });
      });
    } else {
      message.channel.send('You have no permissions to use this command. Only users with role ``' + allowedRoles.join(', ') + '`` are allowed to.');
    }
  }
});

client.login(token).catch(console.error);
