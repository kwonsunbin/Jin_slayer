const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const crypto = require('crypto');

const { constantManager, mapManager } = require('./data/Manager');
const { Player } = require('./models/Player');
const monsters = require('./data/monsters.json');
const items = require('./data/items.json');
const battleEvent = require('./events/battleEvent');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

mongoose.connect(
  'mongodb+srv://kwon123:Nzp1O4Ljj7w0bEl1@cluster0.z68nk.mongodb.net/test',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);
  const [bearer, key] = authorization.split(' ');
  if (bearer !== 'Bearer') return res.sendStatus(401);
  const player = await Player.findOne({ key });
  if (!player) return res.sendStatus(401);

  req.player = player;
  next();
};
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInteger = () => Math.floor(Math.random() * 5);

app.get('/', (req, res) => {
  res.render('index', { gameName: constantManager.gameName });
});

app.get('/game', (req, res) => {
  res.render('game');
});

app.post('/signup', async (req, res) => {
  const { name } = req.body;

  if (await Player.exists({ name })) {
    return res.status(400).send({ error: 'Player already exists' });
  }

  const player = new Player({
    name,
    maxHP: 10,
    HP: 10,
    str: 5,
    def: 5,
    x: 0,
    y: 0,
  });

  const key = crypto.randomBytes(24).toString('hex');
  player.key = key;

  await player.save();

  return res.send({ key });
});

app.post('/action', authentication, async (req, res) => {
  const { action } = req.body;
  const player = req.player;
  let event = null;
  if (action === 'query') {
    const field = mapManager.getField(req.player.x, req.player.y);
    return res.send({ player, field });
  } else if (action === 'move') {
    const direction = parseInt(req.body.direction, 0); // 0 북. 1 동 . 2 남. 3 서.
    let x = req.player.x;
    let y = req.player.y;
    if (direction === 0) {
      y -= 1;
    } else if (direction === 1) {
      x += 1;
    } else if (direction === 2) {
      y += 1;
    } else if (direction === 3) {
      x -= 1;
    } else {
      res.sendStatus(400);
    }
    const field = mapManager.getField(x, y);
    if (!field) res.sendStatus(400);
    player.x = x;
    player.y = y;

    const events = field.events;
    let randInt;
    let monster;
    let item;
    switch (events) {
      case 'start':
        event = { description: '평원의 시작점이다.' };
        break;
      case 'battle':
        monster = randomChoice(monsters);
        const { battleScript, result, HP } = battleEvent(monster, player);
        if (result === 'win') {
          player.HP = HP;
        } else if (result == 'lose') {
          player.x = 0;
          player.y = 0;
          player.HP = 5;
        } else {
          player.HP = HP;
        }
        event = {
          description:
            `${monster.name}가 나올 것 같은 그런 스산한 분위기가 느껴진다. \n` +
            battleScript.join('\n'),
        };
        break;
      case 'treasure':
        item = randomChoice(items);
        let itemScript = [];
        player.inventory.push(item.name);
        itemScript.push(`가방에 ${item.name}을 넣었다.`);
        if (item.def) {
          player.def = player.def + item.def;
          itemScript.push(
            `def 능력치가 ${item.def}만큼 상승하여 ${player.def}가 되었다.`
          );
        }
        if (item.str) {
          player.str = player.str + item.str;
          itemScript.push(
            `str 능력치가 ${item.str}만큼 상승하여 ${player.str}가 되었다.`
          );
        }
        event = {
          description:
            `보물상자를 발견! \n${item.name}을 획득했다.\n` +
            itemScript.join('\n'),
        };

        break;
      case 'trap':
        randInt = randomInteger();
        event = { description: `함정에 빠졌다. HP ${randInt} 감소.` };
        player.decrementHP(randInt);
        break;
      case 'rest':
        randInt = randomInteger();
        event = {
          description: `마음이 편안해진다. HP ${randInt} 회복.`,
        };
        player.incrementHP(randInt);
        break;
      case 'nothing':
        event = {
          description: '아무것도 없었다.',
        };
        break;
      default:
        event = {};
    }

    const actions = [];

    field.canGo.forEach((direction) => {
      actions.push({ url: '/action', text: 'text', params: { direction } });
    });

    await player.save();
    return res.send({ player, field, event, actions });
  }
});

app.listen(3000);
