import { v4 } from 'uuid';

export default class ChestModel {
  id: string;

  spawnerId: string;

  x: number;

  y: number;

  gold: number;

  constructor(x: number, y: number, gold: number, spawnerId: string) {
    this.id = `${spawnerId}-${v4()}`;
    this.spawnerId = spawnerId;
    this.x = x;
    this.y = y;
    this.gold = gold;
  }
}
