/* eslint-disable max-len */
const monsters = require('../data/monsters.json');
const items = require('../data/items.json');
const {randomChoice} = require('../utils');

const battleEvent = (player) => {
  const monster = randomChoice(monsters);
  let playerHP = player.HP;
  let monsterHP = monster.hp;
  let turn = 0;
  let result = '';
  const battleScript = [];

  damageGiven = player.str - monster.def < 0 ? 0 : player.str - monster.def;
  damageGotten = monster.str - player.def < 0 ? 0 : monster.str - player.def;
  while (true) {
    turn += 1;
    if (turn == 10) {
      battleScript.push('무승부다.');
      result = 'draw';
      break;
    }
    battleScript.push(
        `${player.name}은/는 ${monster.name}에게 ${damageGiven}의 피해를 주었다.`,
    );
    monsterHP = Math.max(monsterHP - damageGiven, 0);
    battleScript.push(
        `${player.name}의 HP: (${playerHP}/${player.maxHP}), ${monster.name}의 HP: (${monsterHP}/${monster.hp})\n`,
    );

    if (monsterHP <= 0) {
      battleScript.push(`${player.name}은/는 ${monster.name}을/를 무찔러 경험치 ${monster.exp}를 획득했다.`);
      const levelUp = player.incrementEXP(monster.exp);
      if (levelUp) {
        playerHP = player.maxHP;
        battleScript.push('***LEVEL UP: 체력이 회복되고, 능력치가 올라갔다.***');
      }
      result = 'win';
      break;
    }
    battleScript.push(
        `${monster.name}은/는 ${player.name}에게 ${damageGotten}의 피해를 주었다.`,
    );

    playerHP = Math.max(playerHP - damageGotten, 0);
    battleScript.push(
        `${player.name}의 HP: (${playerHP}/${player.maxHP}), ${monster.name}의 HP: (${monsterHP}/${monster.hp})\n`,
    );

    if (playerHP <= 0) {
      battleScript.push(
          `${player.name}은/는 사망했다. 평원의 시작점으로 되돌아갔다.`,
      );
      result = 'lose';
      break;
    }
  }
  battleScript.unshift(`${monster.name}이/가 나올 것 같은 그런 스산한 분위기가 느껴진다.`);
  return {
    battleScript: battleScript.join('\n'),
    result,
    playerHP,
  };
};

const treasureEvent = (player) => {
  const item = randomChoice(items);
  const itemScript = [`보물상자를 발견! \n${item.name}을/를 획득했다.`];
  player.inventory.push(item.name);
  itemScript.push(`가방에 ${item.name}을/를 넣었다.`);
  if (item.def) {
    player.def = player.def + item.def;
    itemScript.push(
        `def 능력치가 ${item.def}만큼 상승하여 ${player.def}이/가 되었다.`,
    );
  }
  if (item.str) {
    player.str = player.str + item.str;
    itemScript.push(
        `str 능력치가 ${item.str}만큼 상승하여 ${player.str}이/가 되었다.`,
    );
  }
  return {itemScript: itemScript.join('\n')};
};

const trapEvent = (player) => {
  const randomDamage = randomChoice([1, 2, 3, 4, 5]);
  player.decrementHP(randomDamage);
  if (player.HP == 0) {
    return {trapScript: `함정에 빠져 HP ${randomDamage} 감소해 사망했다. 평원의 시작점으로 되돌아갔다.`};
  } else {
    return {trapScript: `함정에 빠졌다. HP ${randomDamage} 감소.`};
  }
};

const restEvent = (player) => {
  const randomHeal = randomChoice([1, 2, 3, 4, 5]);
  player.incrementHP(randomHeal);
  return {restScript: `마음이 편안해진다. HP ${randomHeal} 회복.`};
};
const randomEvent = () => {
  return randomChoice(['battle', 'treasure', 'trap', 'rest', 'nothing']);
};
module.exports = {
  battleEvent,
  treasureEvent,
  trapEvent,
  restEvent,
  randomEvent,
};
