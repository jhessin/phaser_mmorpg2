export default class Chest extends Phaser.Physics.Arcade.Image {
  coins: number;

  id: string;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    key: string,
    frame: number,
    coins: number,
    id: string,
  ) {
    super(scene, x, y, key, frame);
    this.scene = scene; // the scene this game object will be added to
    this.coins = coins; // the amount of coins this chest contains
    this.id = id;

    // enable physics
    this.scene.physics.world.enable(this);
    // add the player to our existing scene
    this.scene.add.existing(this);
    // scale the chest game object
    this.setScale(2);
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
  }
}
