export default class GameMap {
  scene: Phaser.Scene;

  key: string;

  tileSetName: string;

  bgLayerName: string;

  blockedLayerName: string;

  tilemap: Phaser.Tilemaps.Tilemap;

  tiles: Phaser.Tilemaps.Tileset;

  backgroundLayer: Phaser.Tilemaps.TilemapLayer;

  blockedLayer: Phaser.Tilemaps.TilemapLayer;

  constructor(
    scene: Phaser.Scene,
    key: string,
    tileSetName: string,
    bgLayerName: string,
    blockedLayerName: string,
  ) {
    this.scene = scene; // the scene this map belongs to
    this.key = key; // Tiled JSON file key name
    this.tileSetName = tileSetName; // Tiled Tileset image key name
    this.bgLayerName = bgLayerName; // the name of the layer created in tiled for the map background
    // the name of the layer created in tiled for the blocked areas
    this.blockedLayerName = blockedLayerName;

    this.createMap();
  }

  createMap() {
    // create the tile map
    this.tilemap = this.scene.make.tilemap({ key: this.key });

    // add the tileset image to our map
    this.tiles = this.tilemap.addTilesetImage(this.tileSetName, this.tileSetName, 32, 32, 1, 2);

    // create our background
    // this.backgroundLayer = this.tilemap.createStaticLayer(this.bgLayerName, this.tiles, 0, 0);
    this.backgroundLayer = this.tilemap.createLayer(this.bgLayerName, this.tiles);
    this.backgroundLayer.setScale(2);

    // create blocked layer
    this.blockedLayer = this.tilemap.createLayer(this.blockedLayerName, this.tiles);
    this.blockedLayer.setScale(2);
    this.blockedLayer.setCollisionByExclusion([-1]);

    // update the world bounds
    this.scene.physics.world.bounds.width = this.tilemap.widthInPixels * 2;
    this.scene.physics.world.bounds.height = this.tilemap.heightInPixels * 2;

    // limit the camera to the size of our map
    this.scene.cameras.main.setBounds(
      0, 0, this.tilemap.widthInPixels * 2, this.tilemap.heightInPixels * 2,
    );
  }
}
