// Código generado automáticamente. No editar.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "mapa":
            case "mapa1":return tiles.createTilemap(hex`1000100007080808080808080808080808080801060b0b0b0b0b0b0b0b0b0b0b0b0b0b02060b0b0a0a0a0a0a0a090b0b0a0b0b02060b0b0b0a090b090a090a0b0b0b0b02060b0b0b0a090b0b090a0a0a0b0b0b02060b0b0a0a0a0b0b0a0b0a0a0b0a0b02060b090a0a0b0b0a0b0a0a0b0b0a0b02060b090a0a09090b0b0a0b09090b0a02060b0b090a090a0b0b0b090a090b0b02060b0b0b0b0a0a0b0b0a0909090a0b02060b0a0b0b0b090b0a09090b0a0a0b02060b0b0b0a0a0a0a09090b0b0a0a0b02060b0b0b09090b0a09090b0a0b0a0b02060b0a0a0b0b0b0909090a0a0a0a0a02060b0b090b0b0b0b0b0a0a0b0a0a0b0205040404040404040404040404040403`, img`
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 . . . . . . . . . . . . . . 2 
2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 
`, [myTiles.transparency16,sprites.dungeon.purpleOuterNorthEast,sprites.dungeon.purpleOuterEast0,sprites.dungeon.purpleOuterSouthWest,sprites.dungeon.purpleOuterSouth1,sprites.dungeon.purpleOuterSouthEast,sprites.dungeon.purpleOuterWest1,sprites.dungeon.purpleOuterNorthWest,sprites.dungeon.purpleOuterNorth0,sprites.castle.tileDarkGrass3,sprites.castle.tileDarkGrass2,sprites.castle.tileDarkGrass1], TileScale.Sixteen);
        }
        return null;
    })

    helpers._registerFactory("tile", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "transparency16":return transparency16;
        }
        return null;
    })

}
// Código generado automáticamente. No editar.
