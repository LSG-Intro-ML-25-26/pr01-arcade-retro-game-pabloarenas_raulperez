//  ==========================================
//  PROYECTO: LA CABAÑA - NOCHE ETERNA
//  ==========================================
//  --- VARIABLES GLOBALES ---
let ronda = 1
let vivos = 0
let oro = 50
let dificultad = [5, 10, 15, 20, 30]
//  Variables de objetos temporales
let velocidad_base = 100
let velocidad_actual = 100
let tiene_escudo = false
//  --- LORE (HISTORIA DIARIA) ---
let diario_de_la_nina = ["Día 1: Papá se fue a buscar ayuda hace una semana... La cabaña cruje. He encontrado su viejo revólver.", "Día 2: No son animales. Anoche los vi caminar en dos patas. Rasguñan las paredes. Tengo que proteger mi hogar.", "Día 3: El miedo no me deja dormir. He encontrado provisiones viejas, pero necesito más. Un extraño mercader ha pasado por aquí...", "Día 4: ¡Están furiosos! Golpean las ventanas. Sus gritos suenan como niños llorando... Sé que vienen a por mí.", "Día 5: Es el final. El bosque entero ruge. Si sobrevivo a esta noche, saldré de aquí al amanecer. ¡Venid a por mí!"]
//  --- BARRA DE ESCUDO ---
let barra_escudo = statusbars.create(20, 4, StatusBarKind.Energy)
barra_escudo.setFlag(SpriteFlag.Invisible, true)
barra_escudo.setBarBorder(1, 15)
barra_escudo.setColor(8, 2)
//  --- SPRITE DEL JUGADOR ---
let protagonista = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . 2 2 2 2 2 . . . . . . .
    . . . 2 2 2 2 2 2 2 . . . . . .
    . . . 2 f f f f f 2 . . . . . .
    . . . 2 f 1 f 1 f 2 . . . . . .
    . . . . f 1 1 1 f . . . . . . .
    . . . . f 1 f 1 f . . . . . . .
    . . . . 8 8 8 8 8 . . . . . . .
    . . . . 8 8 8 8 8 . . . . . . .
    . . . . 8 . . . 8 . . . . . . .
`, SpriteKind.Player)
protagonista.setFlag(SpriteFlag.Invisible, true)
//  --- CONFIGURACIÓN VISUAL (ESTILO DE TEXTO) ---
function configurar_dialogo_blanco() {
    //  Caja blanca con borde negro
    let caja_estilo = img`
        f f f f f f f f f f f f f f f f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f f f f f f f f f f f f f f f f
    `
    game.setDialogFrame(caja_estilo)
    game.setDialogTextColor(15)
}

//  Texto negro
//  --- MAPA Y OBJETOS ---
function cargar_mapa() {
    tiles.setCurrentTilemap(assets.tilemap`mapa`)
    scene.cameraFollowSprite(protagonista)
}

function generar_items_random() {
    let img_actual: Image;
    let cantidad_actual: number;
    let item: Sprite;
    let posicion_encontrada: boolean;
    let col: number;
    let fil: number;
    let ubicacion: tiles.Location;
    let mis_imagenes = [assets.image`miImagen`, assets.image`miImagen1`, assets.image`miImagen2`]
    let mis_cantidades = [1, 10, 10]
    for (let i = 0; i < mis_imagenes.length; i++) {
        img_actual = mis_imagenes[i]
        cantidad_actual = mis_cantidades[i]
        for (let j = 0; j < cantidad_actual; j++) {
            item = sprites.create(img_actual, SpriteKind.Food)
            posicion_encontrada = false
            while (!posicion_encontrada) {
                col = randint(1, 20)
                fil = randint(1, 20)
                ubicacion = tiles.getTileLocation(col, fil)
                if (!tiles.tileAtLocationIsWall(ubicacion)) {
                    tiles.placeOnTile(item, ubicacion)
                    posicion_encontrada = true
                }
                
            }
        }
    }
}

//  --- SISTEMA DE GESTIÓN DE OBJETOS ---
function resetear_objetos_temporales() {
    
    game.showLongText(`El sol sale...
Tus mejoras se han roto.`, DialogLayout.Center)
    velocidad_actual = velocidad_base
    controller.moveSprite(protagonista, velocidad_actual, velocidad_actual)
    barra_escudo.setFlag(SpriteFlag.Invisible, true)
    tiene_escudo = false
}

function activar_escudo() {
    
    tiene_escudo = true
    barra_escudo.value = 3
    barra_escudo.max = 3
    barra_escudo.attachToSprite(protagonista, -4, 0)
    barra_escudo.setFlag(SpriteFlag.Invisible, false)
}

//  --- SISTEMA DE TEXTO Y LORE ---
function mostrar_historia_dia(n: number) {
    //  Fondo negro y ocultar personaje para modo cine
    scene.setBackgroundColor(15)
    protagonista.setFlag(SpriteFlag.Invisible, true)
    let indice = n - 1
    if (indice < diario_de_la_nina.length) {
        game.showLongText(diario_de_la_nina[indice], DialogLayout.Center)
    } else {
        game.showLongText("Día " + ("" + n) + ": Sobrevive...", DialogLayout.Center)
    }
    
    //  Volver al juego
    cargar_mapa()
    protagonista.setFlag(SpriteFlag.Invisible, false)
}

function iniciar_juego() {
    configurar_dialogo_blanco()
    scene.setBackgroundColor(15)
    pause(500)
    game.splash("LA CABAÑA", "NOCHE ETERNA")
    game.showLongText(`Estás sola en el bosque.
Tu cabaña es tu refugio.
Sobrevive 5 noches.`, DialogLayout.Center)
    cargar_mapa()
    generar_items_random()
}

//  --- ACCIÓN ---
controller.A.onEvent(ControllerButtonEvent.Pressed, function disparar() {
    let p: Sprite;
    if (!(protagonista.flags & SpriteFlag.Invisible)) {
        p = sprites.createProjectileFromSprite(img`
            . . . . . . . .
            . . 5 5 5 5 . .
            . . . . . . . .
        `, protagonista, 150, 0)
        music.pewPew.play()
    }
    
})
function spawn() {
    let col: number;
    let fil: number;
    let loc: tiles.Location;
    
    let z = sprites.create(img`
        . . . . 5 5 . .
        . . . 5 f f 5 .
        . . . d d d d .
    `, SpriteKind.Enemy)
    let spawn_valido = false
    while (!spawn_valido) {
        col = randint(1, 20)
        fil = randint(1, 20)
        loc = tiles.getTileLocation(col, fil)
        if (!tiles.tileAtLocationIsWall(loc)) {
            tiles.placeOnTile(z, loc)
            if (Math.abs(z.x - protagonista.x) > 40) {
                spawn_valido = true
            }
            
        }
        
    }
    z.follow(protagonista, 30 + ronda * 3)
}

function nueva_ronda(n: number) {
    
    mostrar_historia_dia(n)
    vivos = dificultad[n - 1]
    for (let i = 0; i < vivos; i++) {
        spawn()
    }
}

//  --- TIENDA AVANZADA ---
function tienda() {
    
    scene.cameraFollowSprite(null)
    scene.setBackgroundColor(15)
    resetear_objetos_temporales()
    let compra_terminada = false
    while (!compra_terminada) {
        game.showLongText(`MERCADER:
'¿Que necesitas?'

ORO: ` + ("" + oro), DialogLayout.Center)
        story.showPlayerChoices("Escudo (30g)", "Botas Temp (20g)", "Vida +1 (50g)", "Siguiente Noche")
        if (story.checkLastAnswer("Siguiente Noche")) {
            compra_terminada = true
        } else if (story.checkLastAnswer("Escudo (30g)")) {
            if (oro >= 30) {
                if (!tiene_escudo) {
                    oro -= 30
                    activar_escudo()
                    game.showLongText("Compraste un escudo.", DialogLayout.Center)
                } else {
                    game.showLongText("Ya tienes escudo.", DialogLayout.Center)
                }
                
            } else {
                game.showLongText("No tienes oro.", DialogLayout.Center)
            }
            
        } else if (story.checkLastAnswer("Botas Temp (20g)")) {
            if (oro >= 20) {
                if (velocidad_actual == velocidad_base) {
                    oro -= 20
                    velocidad_actual += 40
                    controller.moveSprite(protagonista, velocidad_actual, velocidad_actual)
                    game.showLongText("Corres más rápido.", DialogLayout.Center)
                } else {
                    game.showLongText("Ya llevas botas.", DialogLayout.Center)
                }
                
            } else {
                game.showLongText("Necesitas más oro.", DialogLayout.Center)
            }
            
        } else if (story.checkLastAnswer("Vida +1 (50g)")) {
            if (oro >= 50) {
                oro -= 50
                info.changeLifeBy(1)
                music.powerUp.play()
                game.showLongText("Salud recuperada.", DialogLayout.Center)
            } else {
                game.showLongText("Demasiado caro.", DialogLayout.Center)
            }
            
        }
        
        info.setScore(oro)
    }
    cargar_mapa()
    proximo_paso()
}

//  --- COLISIONES ---
//  IMPORTANTE: Aquí he añadido ": Sprite" para arreglar el error.
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function muerte_enemigo(b: Sprite, e: Sprite) {
    
    b.destroy()
    e.destroy(effects.disintegrate, 200)
    vivos -= 1
    oro += 10
    info.setScore(oro)
    if (vivos <= 0) {
        tienda()
    }
    
})
//  IMPORTANTE: Aquí he añadido ": Sprite" para arreglar el error.
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function choque(p: Sprite, e: Sprite) {
    
    e.destroy()
    vivos -= 1
    if (tiene_escudo && barra_escudo.value > 0) {
        barra_escudo.value -= 1
        music.bigCrash.play()
        scene.cameraShake(2, 200)
        if (barra_escudo.value <= 0) {
            barra_escudo.setFlag(SpriteFlag.Invisible, true)
            tiene_escudo = false
            music.wawawawaa.play()
        }
        
    } else {
        info.changeLifeBy(-1)
        scene.cameraShake(4, 500)
    }
    
    if (vivos <= 0) {
        tienda()
    }
    
})
function proximo_paso() {
    
    ronda += 1
    if (ronda > 5) {
        scene.setBackgroundColor(15)
        game.showLongText(`¡AMANECER!
Has sobrevivido.
Fin del juego.`, DialogLayout.Center)
        game.over(true)
    } else {
        nueva_ronda(ronda)
    }
    
}

//  --- INICIO ---
controller.moveSprite(protagonista, velocidad_actual, velocidad_actual)
info.setScore(oro)
info.setLife(3)
iniciar_juego()
nueva_ronda(ronda)
