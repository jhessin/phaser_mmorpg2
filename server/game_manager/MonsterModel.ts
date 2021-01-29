import { v4 } from 'uuid';
import { randomNumber } from './utils';

export default class MonsterModel {
  id: string;

  spawnerId: string;

  x: number;

  y: number;

  gold: number;

  frame: number;

  health: number;

  maxHealth: number;

  attack: number;

  constructor(
    x: number, y: number,
    gold: number,
    spawnerId: string,
    frame: number,
    health: number,
    attack: number,
  ) {
    this.id = `${spawnerId}-${v4()}`;
    this.spawnerId = spawnerId;
    this.x = x * 2;
    this.y = y * 2;
    this.gold = gold;
    this.frame = frame;
    this.health = health;
    this.maxHealth = health;
    this.attack = attack;
  }

  loseHealth() {
    this.health -= 1;
  }

  move() {
    const randomPosition = randomNumber(1, 8);
    const distance = 64;

    switch (randomPosition) {
      case 1:
        this.x += distance;
        break;
      case 2:
        this.x -= distance;
        break;
      case 3:
        this.y += distance;
        break;
      case 4:
        this.y -= distance;
        break;
      case 5:
        this.x += distance;
        this.y += distance;
        break;
      case 6:
        this.x += distance;
        this.y -= distance;
        break;
      case 7:
        this.x -= distance;
        this.y += distance;
        break;
      case 8:
        this.x -= distance;
        this.y -= distance;
        break;
      default:
        break;
    }
  }
}
