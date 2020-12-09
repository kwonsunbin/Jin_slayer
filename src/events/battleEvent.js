const battleEvent = (monster, player) => {
  let playerHP = player.HP;
  let monsterHP = monster.hp;
  let turn = 0;
  battleScript = [];

  damageGiven = player.str - monster.def < 0 ? 0 : player.str - monster.def;
  damageGotten = monster.str - player.def < 0 ? 0 : monster.str - player.def;
  while (true) {
    turn += 1;
    if (turn == 10) {
      battleScript.push('무승부다.');
      return { HP: playerHP, battleScript, result: 'draw' };
    }
    battleScript.push(
      `${player.name}은 ${monster.name}에게 ${damageGiven}의 피해를 주었다.`
    );
    monsterHP = monsterHP - damageGiven;
    battleScript.push(`${monster.name}의 HP는 ${monsterHP}이 남았다.`);

    if (monsterHP <= 0) {
      battleScript.push(`${player.name}는 ${monster.name}을 무찔렀다.`);
      return { HP: playerHP, battleScript, result: 'win' };
    }
    battleScript.push(
      `${monster.name}은 ${player.name}에게 ${damageGotten}의 피해를 주었다.`
    );

    playerHP = playerHP - damageGotten;
    battleScript.push(`${player.name}의 HP는 ${playerHP}이 남았다.`);

    if (playerHP <= 0) {
      battleScript.push(
        `${player.name}은 사망했다. 평원의 시작점으로 되돌아간다.`
      );
      return { battleScript, result: 'lose' };
    }
  }
};

module.exports = battleEvent;
