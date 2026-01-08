// Código generado automáticamente. No editar.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "mapa":
            case "mapa1":return tiles.createTilemap(hex`100010000b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0d0d0c0d0d0d0d0d0d0d0d0d0c0d0b0b0c0c0c0c0c0c0c0c0c0c01010c0c0b0b0d010c0c0c0d0d0d0c0c0d010d0c0b0b0c0c010c0d0d0c0c0c0d0d0d010c0b0b0c0d010c0c0c0c0d0d0d0d0d010c0b0b0c0d01010c070909080d0d0d010c0b0b0d0c0d010c030202040d0d0d010c0b0b0d0c0d0c0c030202040d0d0d010c0b0b0d0c0d0c0d060a0a050c0d0d0d0c0b0b0d0d0c010d0c0c0c0c0c0d010c0c0b0b0d0d0c0101010101010101010c0d0b0b0d0c0c01010d0d0c0c0d0d0c0c0d0b0b0d0c0d0d0d0c0d0d0d0c0c0c0c0c0b0b0d0c0d0c0c0d0d0d0d0d0d0d0c0c0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b`, img`
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
`, [myTiles.transparency16,sprites.castle.tileGrass2,sprites.castle.tilePath5,sprites.castle.tilePath4,sprites.castle.tilePath6,sprites.castle.tilePath9,sprites.castle.tilePath7,sprites.castle.tilePath1,sprites.castle.tilePath3,sprites.castle.tilePath2,sprites.castle.tilePath8,sprites.builtin.forestTiles0,sprites.castle.tileGrass1,sprites.castle.tileGrass3], TileScale.Sixteen);
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
