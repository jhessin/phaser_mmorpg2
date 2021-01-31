import 'phaser';
import io from 'socket.io-client';
import scene from './scenes';
import './style.css';

// set the configuration of the game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scene,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: {
        y: 0,
      },
    },
  },

  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  render: {
    pixelArt: true,
    roundPixels: true,
  },
};

export default class Game extends Phaser.Game {
  globals: {
    socket: SocketIOClient.Socket,
  };

  constructor() {
    super(config);
    this.globals = {
      socket: io(),
    };
    this.scene.start('Boot');
  }
}

// typescript hoopla
declare global {
  interface Window { game: Game; }
}

window.onload = () => {
  window.game = new Game();
};
