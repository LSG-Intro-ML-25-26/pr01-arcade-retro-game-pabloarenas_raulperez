//  --- VARIABLES GLOBALES ---
let dinero = 50
let caos = 0
let dia = 1
//  Estados: 0=Tienda, 1=Sotano, 2=Plaza
let ubicacion_actual = 0
//  Crear al Mercader
let mercader = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . 2 2 2 2 2 . . . . . . .
    . . . 2 2 2 2 2 2 2 . . . . . .
    . . . 2 2 f f f 2 2 . . . . . .
    . . . 2 f f 1 f f 2 . . . . . .
    . . . . f 1 1 1 f . . . . . . .
    . . . . f 1 f 1 f . . . . . . .
    . . . . 8 8 8 8 8 . . . . . . .
    . . . . 8 8 8 8 8 . . . . . . .
    . . . . 8 . . . 8 . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`, SpriteKind.Player)
controller.moveSprite(mercader)
scene.cameraFollowSprite(mercader)
//  Mostrar Dinero
info.setScore(dinero)
//  --- CONFIGURACIÓN DE MAPAS ---
function cargar_tienda() {
    
    ubicacion_actual = 0
    //  IMPORTANTE: Aquí la Persona 1 (Arte) debe dibujar la tienda en el editor visual
    //  Pon baldosas de suelo y PAREDES rojas alrededor
    tiles.setCurrentTilemap(tilemap`level1`)
    scene.setBackgroundColor(6)
    //  Color suelo
    mercader.setPosition(80, 60)
}

function cargar_sotano() {
    
    ubicacion_actual = 1
    //  La Persona 1 debe dibujar un mapa oscuro aquí
    tiles.setCurrentTilemap(tilemap`level2`)
    scene.setBackgroundColor(15)
    //  Negro
    mercader.setPosition(20, 20)
}

//  Cargar primer mapa
cargar_tienda()
//  --- SISTEMA DE CLIENTES (LORE) ---
//  Generar un cliente cada 7 segundos
game.onUpdateInterval(7000, function generar_cliente() {
    let cliente: Sprite;
    //  Solo aparecen clientes si estamos en la tienda
    if (ubicacion_actual == 0) {
        cliente = sprites.create(img`
            . . . . . . . . . . . . . . . .
            . . . . . . 5 5 . . . . . . . .
            . . . . . 5 5 5 5 . . . . . . .
            . . . . . 5 f f 5 . . . . . . .
            . . . . . 5 f f 5 . . . . . . .
            . . . . . 5 5 5 5 . . . . . . .
            . . . . . . 5 5 . . . . . . . .
            . . . . . d d d d . . . . . . .
            . . . . . d d d d . . . . . . .
            . . . . . d . . d . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        `, SpriteKind.Enemy)
        //  Aparece en la puerta (ajustar coordenadas según tu dibujo)
        cliente.setPosition(80, 10)
        cliente.follow(mercader, 30)
    }
    
})
//  --- INTERACCIÓN Y VENTAS ---
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function on_overlap_cliente(sprite: Sprite, otherSprite: Sprite) {
    
    //  Detener movimiento para hablar
    otherSprite.follow(null)
    //  Diálogo de Lore usando la extensión Story
    story.printCharacterText("Necesito armas...", "Cliente")
    //  Opciones
    story.showPlayerChoices("Espada (10$)", "Daga Maldita (50$)", "Echarlo")
    if (story.checkLastAnswer("Espada (10$)")) {
        dinero += 10
        caos -= 1
        story.printCharacterText("Gracias, servirá.", "Cliente")
    } else if (story.checkLastAnswer("Daga Maldita (50$)")) {
        dinero += 50
        caos += 5
        //  SUBE EL CAOS
        story.printCharacterText("Jejeje... poder ilimitado.", "Cliente")
        scene.cameraShake(4, 500)
    } else {
        story.printCharacterText("¡Bah! Me voy.", "Cliente")
    }
    
    //  Actualizar marcador y borrar cliente
    info.setScore(dinero)
    otherSprite.destroy(effects.disintegrate, 500)
})
//  --- NOTICIAS AL FINAL DEL DÍA ---
//  El día dura 30 segundos
game.onUpdateInterval(30000, function ciclo_dia() {
    
    dia += 1
    //  Texto de noticias
    game.showLongText("DÍA " + ("" + dia) + " COMPLETADO.", DialogLayout.Center)
    if (caos > 20) {
        game.showLongText("NOTICIA URGENTE: ¡Ataques en el reino! Se dice que el mercader vende armas malditas...", DialogLayout.Full)
    } else if (caos < 0) {
        game.showLongText("NOTICIA: Tiempos de paz. La cosecha es buena.", DialogLayout.Full)
    } else {
        game.showLongText("NOTICIA: Todo tranquilo por ahora.", DialogLayout.Full)
    }
    
})
//  --- CAMBIO DE MAPAS (Simulado con botones A y B por ahora) ---
//  Programador: Cambia esto por colisión con escaleras más tarde
controller.A.onEvent(ControllerButtonEvent.Pressed, function cambiar_zona_a() {
    cargar_tienda()
    story.printCharacterText("Has entrado en la TIENDA")
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function cambiar_zona_b() {
    cargar_sotano()
    story.printCharacterText("Has bajado al SÓTANO")
})
