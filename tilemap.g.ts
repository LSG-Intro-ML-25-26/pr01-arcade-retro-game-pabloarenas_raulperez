// Código generado automáticamente. No editar.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "mapa":
            case "mapa1":return tiles.createTilemap(hex`10001000010a0a0a0a0a0a0a0a0a0a0a0a0a0a0602040b0b0b040404040404040404040902040b04040b0b0b040b0b0b04040409020b0b03030403030403030303040409020b0b0403040303040404040403040902040b0404040404040b0b040b03040902040b030304040404040b0b0403040902030304030b030304040b0b0303040902040304040b0303040404040304040902040b04030b0403040b04040304040902030b03040b040b0404040b030b0409020304030b030b0b030303030304040902030303040404030304030304040409020b0304040404040b04040b04040409020b0b04040b0b04040404040404040905080808080808080808080808080807`, img`
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
`, [myTiles.transparency16,sprites.dungeon.purpleOuterNorthWest,sprites.dungeon.purpleOuterWest0,sprites.castle.tileDarkGrass2,sprites.castle.tileDarkGrass3,sprites.dungeon.purpleOuterSouthEast,sprites.dungeon.purpleOuterNorthEast,sprites.dungeon.purpleOuterSouthWest,sprites.dungeon.purpleOuterSouth1,sprites.dungeon.purpleOuterEast0,sprites.dungeon.purpleOuterNorth1,sprites.castle.tileDarkGrass1], TileScale.Sixteen);
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
