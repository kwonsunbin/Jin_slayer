const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  key: String,

  level: {type: Number, default: 1},
  exp: {type: Number, default: 0},

  maxHP: {type: Number, default: 10},
  HP: {type: Number, default: 10},
  str: {type: Number, default: 5},
  def: {type: Number, default: 5},
  x: {type: Number, default: 0},
  y: {type: Number, default: 0},
  inventory: {type: Array, default: []},
});
schema.methods.incrementHP = function(val) {
  const hp = this.HP + val;
  this.HP = Math.min(Math.max(0, hp), this.maxHP);
};
schema.methods.decrementHP = function(val) {
  const hp = this.HP - val;
  this.HP = Math.max(hp, 0);
};
schema.methods.incrementEXP = function(val) {
  let exp = this.exp + val;
  let lvl = this.level;
  let levelUp = false;
  while (true) {
    if (exp < lvl * 20) break;
    exp -= lvl * 20;
    lvl += 1;
    this.str += 1;
    this.def += 1;
    this.maxHP += 1;
    levelUp = true;
  }
  this.exp = exp;
  this.level = lvl;

  return levelUp;
};
const Player = mongoose.model('Player', schema);

module.exports = {
  Player,
};
