export enum Direction {
  RIGHT, LEFT, UP, DOWN,
}

export type PlayerData = {
  id: string,
  x: number,
  y: number,
  flipX: boolean,
  playerAttacking: boolean,
  currentDirection: Direction,
};
