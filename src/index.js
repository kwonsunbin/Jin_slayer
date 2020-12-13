const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const {constantManager, mapManager} = require('./data/Manager');
const {Player} = require('./models/Player');
const {
  battleEvent,
  treasureEvent,
  trapEvent,
  restEvent,
  randomEvent,
} = require('./events/eventUtils');

const app = express();
app.use(express.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

mongoose.connect(
    'mongodb+srv://kwon123:Nzp1O4Ljj7w0bEl1@cluster0.z68nk.mongodb.net/test',
    {useNewUrlParser: true, useUnifiedTopology: true},
);

const authentication = async (req, res, next) => {
  const {authorization} = req.headers;
  if (!authorization) return res.sendStatus(401);
  const [bearer, key] = authorization.split(' ');
  if (bearer !== 'Bearer') return res.sendStatus(401);
  const player = await Player.findOne({key});
  if (!player) return res.sendStatus(401);

  req.player = player;
  next();
};

app.get('/', (req, res) => {
  res.render('index', {gameName: constantManager.gameName});
});

app.get('/game', (req, res) => {
  res.render('game');
});

app.post('/signup', async (req, res) => {
  const {name} = req.body;

  if (await Player.exists({name})) {
    return res.status(400).send({error: 'Player already exists'});
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

  return res.send({key});
});

app.post('/action', authentication, async (req, res) => {
  const {action} = req.body;
  const player = req.player;
  let event = null;
  if (action === 'query') {
    const field = mapManager.getField(req.player.x, req.player.y);
    return res.send({player, field});
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
    let field = mapManager.getField(x, y);
    if (!field) res.sendStatus(400);
    player.x = x;
    player.y = y;

    let events = field.events;
    if (events === 'random') {
      // 랜덤 이벤트 필드인 경우, 랜덤으로 이벤트를 발생시킨다.
      events = randomEvent();
    }
    switch (events) {
      case 'start':
        event = {description: '평원의 시작점이다.'};
        break;
      case 'battle':
        const {battleScript, result, playerHP} = battleEvent(player);
        if (result === 'win') {
          // 배틀 승리
          player.HP = playerHP;
        } else if (result == 'lose') {
          // 배틀 패배
          player.x = 0;
          player.y = 0;
          player.HP = 10;
          field = mapManager.getField(0, 0);
        } else {
          // 배틀 무승부
          player.HP = playerHP;
        }
        event = {
          description: battleScript,
        };
        break;
      case 'treasure':
        const {itemScript} = treasureEvent(player);
        event = {
          description: itemScript,
        };
        break;
      case 'trap':
        const {trapScript} = trapEvent(player);
        if (player.HP == 0) {
          player.x = 0;
          player.y = 0;
          player.HP = 10;
          field = mapManager.getField(0, 0);
        }
        event = {description: trapScript};
        break;
      case 'rest':
        const {restScript} = restEvent(player);
        event = {description: restScript};
        break;
      case 'nothing':
        event = {description: '아무것도 없었다.'};
        break;
      default:
        event = {};
    }

    const actions = [];

    field.canGo.forEach((direction) => {
      actions.push({url: '/action', text: 'text', params: {direction}});
    });

    await player.save();
    return res.send({player, field, event, actions});
  }
});

app.listen(3000);
