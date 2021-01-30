import 'phaser';
import UiButton from '../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
  titleText: Phaser.GameObjects.Text;

  startGameButton: UiButton;

  constructor() {
    super('Title');
  }

  create() {
    // create title text
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Zenva MMORPG', { fontSize: '64px', color: '#fff' });
    this.titleText.setOrigin(0.5);

    // create the Play game button
    this.startGameButton = new UiButton(this, this.scale.width / 2, this.scale.height * 0.65, 'button1', 'button2', 'Start', this.startScene.bind(this, 'Game'));
  }

  startScene(targetScene: string) {
    this.scene.start(targetScene);
  }
}
