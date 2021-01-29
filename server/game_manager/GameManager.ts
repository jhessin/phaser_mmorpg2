import socketio from 'socket.io';
import * as levelData from '../../assets/level/large_level.json';
import { PlayerData } from '../utils/types';
import ChestModel from './ChestModel';
import MonsterModel from './MonsterModel';
import PlayerModel from './PlayerModel';
import Spawner from './Spawner';
import { SpawnerType } from './utils';

export function toObject(map: Map<string, any>): Record<string, any> {
  return Array.from(map).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
}

export function getTiledProperty(obj: LayerObject, propertyName: string) {
  if (!obj.properties) return null;
  for (let i = 0; i < obj.properties.length; i += 1) {
    const property = obj.properties[i];
    if (property.name === propertyName) {
      return property.value;
    }
  }
  return null;
}

type LayerObject = {
  gid: number;
  height: number;
  id: number;
  name: string;
  properties?: {
    name: string;
    type: string;
    value: string;
  }[];
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};

type LayerData = {
  data?: number[];
  height?: number;
  id?: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  width?: number;
  x: number;
  y: number;
  objects?: LayerObject[];
};

export default class GameManager {
  spawners: Map<string, any>;

  chests: Map<string, any>;

  monsters: Map<string, any>;

  players: Map<string, PlayerModel>;

  playerLocations: [number, number][];

  chestLocations: Map<string, [number, number][]>;

  monsterLocations: Map<string, [number, number][]>;

  io: socketio.Server;

  constructor(io: socketio.Server) {
    this.io = io;
    this.spawners = new Map();
    this.chests = new Map();
    this.monsters = new Map();
    this.players = new Map();

    this.playerLocations = [];
    this.chestLocations = new Map();
    this.monsterLocations = new Map();
  }

  setup() {
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
  }

  parseMapData() {
    levelData.layers.forEach((layer: LayerData) => {
      if (layer.name === 'player_locations') {
        if (layer.objects) {
          layer.objects.forEach((obj: LayerObject) => {
            this.playerLocations.push([obj.x, obj.y]);
          });
        }
      } else if (layer.name === 'monster_locations') {
        if (layer.objects) {
          layer.objects.forEach((obj: LayerObject) => {
            const spawner = getTiledProperty(obj, 'spawner');
            if (obj.properties && spawner) {
              const location = this.monsterLocations.get(spawner);
              if (location) location.push([obj.x, obj.y]);
              else this.monsterLocations.set(spawner, [[obj.x, obj.y]]);
            }
          });
        }
      } else if (layer.name === 'chest_locations') {
        if (layer.objects) {
          layer.objects.forEach((obj: LayerObject) => {
            const spawner = getTiledProperty(obj, 'spawner');
            if (obj.properties && spawner) {
              const location = this.chestLocations.get(spawner);
              if (location) location.push([obj.x, obj.y]);
              else this.chestLocations.set(spawner, [[obj.x, obj.y]]);
            }
          });
        }
      }
    });
  }

  setupEventListeners() {
    this.io.on('connection', (socket: socketio.Socket) => {
      // console.log(`${socket.id} connected.`);
      // player disconnected
      socket.on('disconnect', () => {
        // console.log(`${socket.id} disconnected.`);
        // delete user data from server
        this.players.delete(socket.id);

        // emit a message to all players to remove this player
        socket.broadcast.emit('disconnectPlayer', socket.id);
      });

      socket.on('newPlayer', async () => {
        // console.log(`${socket.id} newPlayer.`);
        // create a new player
        this.spawnPlayer(socket.id);

        // console.log(`${socket.id} emiting initial data.`);

        // send the players object to new player
        socket.emit('currentPlayers', toObject(this.players));

        // send the monsters object to the new player
        socket.emit('currentMonsters', toObject(this.monsters));

        // send the chests object to the new player
        socket.emit('currentChests', toObject(this.chests));

        // inform other players of the new player
        socket.broadcast.emit('spawnPlayer', this.players.get(socket.id));
        // console.log(`${socket.id} finished emiting initial data.`);
      });

      socket.on('playerMovement', (playerData: PlayerData) => {
        const player = this.players.get(socket.id);
        if (player) {
          player.x = playerData.x;
          player.y = playerData.y;
          player.flipX = playerData.flipX;
          player.attacking = playerData.playerAttacking;
          player.currentDirection = playerData.currentDirection;

          // emit a message to other players about the player that moved
          socket.broadcast.emit('playerMoved', playerData);
        }
      });

      socket.on('pickUpChest', (chestId: string) => {
        // update the spawner
        if (this.chests.has(chestId)) {
          const { gold } = this.chests.get(chestId);

          // updating the players gold
          const player = this.players.get(socket.id);
          player.updateGold(gold);
          socket.emit('updateScore', player.gold);

          // removing the chest
          this.spawners.get(this.chests.get(chestId).spawnerId).removeObject(chestId);
        }
      });

      socket.on('monsterAttacked', (monsterId: string) => {
        // update the spawner
        if (this.monsters.has(monsterId)) {
          const { gold, attack } = this.monsters.get(monsterId);

          // subtract health monster model
          this.monsters.get(monsterId).loseHealth();

          // check the monsters health, and if dead remove that object
          if (this.monsters.get(monsterId).health <= 0) {
            // updating the players gold
            this.players.get(socket.id).updateGold(gold);
            socket.emit('updateScore', this.players.get(socket.id).gold);

            // removing the monster
            this.spawners.get(this.monsters.get(monsterId).spawnerId).removeObject(monsterId);
            this.io.emit('monsterRemoved', monsterId);

            // add bonus health to the player
            this.players.get(socket.id).updateHealth(2);
            this.io.emit('updatePlayerHealth', socket.id, this.players.get(socket.id).health);
          } else {
            // update the players health
            this.players.get(socket.id).updateHealth(-attack);
            this.io.emit('updatePlayerHealth', socket.id, this.players.get(socket.id).health);

            // update the monsters health
            this.io.emit('updateMonsterHealth', monsterId, this.monsters.get(monsterId).health);

            // check the player's health, if below 0 have the player respawn
            if (this.players.get(socket.id).health <= 0) {
              // update the gold the player has
              this.players.get(socket.id).updateGold(-this.players.get(socket.id).gold / 2);
              socket.emit('updateScore', this.players.get(socket.id).gold);

              // respawn the player
              this.players.get(socket.id).respawn();
              this.io.emit('respawnPlayer', this.players.get(socket.id));
            }
          }
        }
      });
    });
  }

  setupSpawners() {
    const config = {
      spawnInterval: 3000,
      limit: 3,
      spawnerType: SpawnerType.CHEST,
      id: '',
    };
    let spawner;

    // create chest spawners
    this.chestLocations.forEach((locations: [number, number][], key: string) => {
      config.id = `chest-${key}`;

      spawner = new Spawner(
        config,
        locations,
        this.addChest.bind(this),
        this.deleteChest.bind(this),
      );
      this.spawners.set(spawner.id, spawner);
    });

    // create monster spawners
    this.monsterLocations.forEach((locations: [number, number][], key: string) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        locations,
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this),
      );
      this.spawners.set(spawner.id, spawner);
    });
  }

  spawnPlayer(id: string) {
    const player = new PlayerModel(id, this.playerLocations);
    this.players.set(player.id, player);
    // console.log(`${id} Player Spawned.`);
  }

  addChest(chestId: string, chest: ChestModel) {
    this.chests.set(chestId, chest);
    this.io.emit('chestSpawned', chest);
  }

  deleteChest(chestId: string) {
    this.chests.delete(chestId);
    this.io.emit('chestRemoved', chestId);
  }

  addMonster(monsterId: string, monster: MonsterModel) {
    this.monsters.set(monsterId, monster);
    this.io.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId: string) {
    this.monsters.delete(monsterId);
    this.io.emit('monsterRemoved', monsterId);
  }

  moveMonsters() {
    this.monsters.forEach((monster: MonsterModel) => {
      monster.move();
    });
    this.io.emit('monsterMovement', toObject(this.monsters));
  }
}
