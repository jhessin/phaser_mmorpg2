import Spawner from './Spawner';
import PlayerModel from './PlayerModel';
import { SpawnerType } from './utils';
import { ChestModel, MonsterModel } from '.';

export default class GameManager {
  scene: Phaser.Scene;

  mapData: Phaser.Tilemaps.ObjectLayer[];

  // TODO find the right types for these
  spawners: Map<string, Spawner>;

  chests: Map<string, ChestModel>;

  monsters: Map<string, MonsterModel>;

  players: Map<string, PlayerModel>;

  playerLocations: [number, number][];

  chestLocations: Map<string, [number, number][]>;

  monsterLocations: Map<string, [number, number][]>;

  constructor(
    scene: Phaser.Scene,
    mapData: Phaser.Tilemaps.ObjectLayer[],
  ) {
    this.scene = scene;
    this.mapData = mapData;

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
    this.setupEventListener();
    this.setupSpawners();
    this.spawnPlayer();
  }

  parseMapData() {
    this.mapData.forEach((layer) => {
      if (layer.name === 'player_locations') {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x, obj.y]);
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach((obj) => {
          if (this.chestLocations.get(obj.properties.spawner)) {
            this.chestLocations.get(obj.properties.spawner).push([obj.x, obj.y]);
          } else {
            this.chestLocations.set(obj.properties.spawner, [[obj.x, obj.y]]);
          }
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations.get(obj.properties.spawner)) {
            this.monsterLocations.get(obj.properties.spawner).push([obj.x, obj.y]);
          } else {
            this.monsterLocations.set(obj.properties.spawner, [[obj.x, obj.y]]);
          }
        });
      }
    });
  }

  setupEventListener() {
    this.scene.events.on('pickUpChest', (chestId: string, playerId: string) => {
      // update the spawner
      if (this.chests.has(chestId)) {
        const { gold } = this.chests.get(chestId);

        // updating the players gold
        this.players.get(playerId).updateGold(gold);
        this.scene.events.emit('updateScore', this.players.get(playerId).gold);

        // removing the chest
        this.spawners.get(this.chests.get(chestId).spawnerId).removeObject(chestId);
        this.scene.events.emit('chestRemoved', chestId);
      }
    });

    this.scene.events.on('monsterAttacked', (monsterId: string, playerId: string) => {
      // update the spawner
      if (this.monsters.has(monsterId)) {
        const { gold, attack } = this.monsters.get(monsterId);

        // subtract health monster model
        this.monsters.get(monsterId).loseHealth();

        // check the monsters health, and if dead remove that object
        if (this.monsters.get(monsterId).health <= 0) {
          // updating the players gold
          this.players.get(playerId).updateGold(gold);
          this.scene.events.emit('updateScore', this.players.get(playerId).gold);

          // removing the monster
          this.spawners.get(this.monsters.get(monsterId).spawnerId).removeObject(monsterId);
          this.scene.events.emit('monsterRemoved', monsterId);

          // add bonus health to the player
          this.players.get(playerId).updateHealth(2);
          this.scene.events.emit('updatePlayerHealth', playerId, this.players.get(playerId).health);
        } else {
          // update the players health
          this.players.get(playerId).updateHealth(-attack);
          this.scene.events.emit('updatePlayerHealth', playerId, this.players.get(playerId).health);

          // update the monsters health
          this.scene.events.emit('updateMonsterHealth', monsterId, this.monsters.get(monsterId).health);

          // check the player's health, if below 0 have the player respawn
          if (this.players.get(playerId).health <= 0) {
            // update the gold the player has
            this.players.get(playerId).updateGold(-this.players.get(playerId).gold / 2);
            this.scene.events.emit('updateScore', this.players.get(playerId).gold);

            // respawn the player
            this.players.get(playerId).respawn();
            this.scene.events.emit('respawnPlayer', this.players.get(playerId));
          }
        }
      }
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
    Object.keys(this.chestLocations).forEach((key) => {
      config.id = `chest-${key}`;

      spawner = new Spawner(
        config,
        this.chestLocations.get(key),
        this.addChest.bind(this),
        this.deleteChest.bind(this),
      );
      this.spawners.set(spawner.id, spawner);
    });

    // create monster spawners
    Object.keys(this.monsterLocations).forEach((key) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        this.monsterLocations.get(key),
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this),
      );
      this.spawners.set(spawner.id, spawner);
    });
  }

  spawnPlayer() {
    const player = new PlayerModel(this.playerLocations);
    this.players.set(player.id, player);
    this.scene.events.emit('spawnPlayer', player);
  }

  addChest(chestId: string, chest: ChestModel) {
    this.chests.set(chestId, chest);
    this.scene.events.emit('chestSpawned', chest);
  }

  deleteChest(chestId: string) {
    this.chests.delete(chestId);
  }

  addMonster(monsterId: string, monster: MonsterModel) {
    this.monsters.set(monsterId, monster);
    this.scene.events.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId: string) {
    this.monsters.delete(monsterId);
  }

  moveMonsters() {
    this.scene.events.emit('monsterMovement', this.monsters);
  }
}
