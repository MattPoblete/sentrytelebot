import * as dotenv from 'dotenv';
import telebot from 'telebot';
import express, {json} from 'express';

dotenv.config();

const bot_token = process.env.BOT_TOKEN as string
const app_port = process.env.APP_PORT
const channel_id = process.env.CHANNEL_ID as string
const url = process.env.SENTRY_ISSUE_DETAIL_URL
const app: express.Application = express()

const bot = new telebot({
  token: bot_token,
});

app.use(json())

app.get('/', (req,res) => {
  res.status(200).send('🤖 👍');
})

const emojis = {
  info: 'ℹ️',
  error: '⭕️',
  warning: '⚠'
}

app.post('/', async (req,res) => {
  const messageData = {
    env: req.body.event.environment,
    title: req.body.event.title,
    level: req.body.level,
    culprit: req.body.culprit,
    location: req.body.event.location,
    id: req.body.id,
    emoji: ''
  } 
  //console.log(req.body)

  if(messageData.location == null){
    messageData.location = 'unknown file path'
  }
  if(messageData.culprit == undefined){
    messageData.culprit = 'Unknown error'
  }
  switch (messageData.level) {
    case 'info':
      messageData.emoji = emojis.info
      break;
    case 'warning':
      messageData.emoji = emojis.warning
      break;
    case 'error':
      messageData.emoji = emojis.error
      break;
    default:
      break;
  }

  const message = `${messageData.emoji}<i>(${messageData.level} in ${messageData.env} environment)</i>${messageData.emoji}
${messageData.culprit}
<b>${messageData.title}</b>
<code><i>${messageData.location}</i></code>
<a href="${url}${messageData.id}">view in Sentry</a>`;

  bot.sendMessage(channel_id, message, {parseMode:'HTML'})
  .catch((e)=> {console.log(e.description)});
})

/* bot.on('update', (ctx) => {
  console.log(ctx[0].channel_post);
}) */

bot.start();
app.listen(app_port, ()=> {console.log('Listening on port ', app_port)});
