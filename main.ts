//  ==========================================
//  PROYECTO: Zombie Survival Merchant
//  ==========================================
//  --- VARIABLES ---
let ronda = 1
let vivos = 0
let oro = 50
let velocidad = 100
let dificultad = [5, 10, 15, 20, 30]
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
//  --- MAPA (Usando tu asset 'mapa') ---
function cargar_mapa() {
    //  Carga tu tilemap llamado "mapa"
    tiles.setCurrentTilemap(assets.tilemap`mapa`)
    //  Hacemos que la cámara siga al jugador
    scene.cameraFollowSprite(protagonista)
}

//  --- SISTEMA DE TEXTO ---
function iniciar_historia() {
    game.setDialogFrame(null)
    scene.setBackgroundColor(15)
    pause(200)
    game.splash("ZOMBIE SURVIVAL", "MERCHANT")
    game.splash("HISTORIA:", `Eres el ultimo mercader.
Protege tu stock.`)
    game.splash("MISION: Mata zombies,", "gana oro y mejora.")
    game.splash("OBJETIVO FINAL:", "SOBREVIVE 5 DIAS")
    //  Cargamos el mapa y mostramos al jugador
    cargar_mapa()
    protagonista.setFlag(SpriteFlag.Invisible, false)
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
    
    let z = sprites.create(img`
        . . . . 5 5 . .
        . . . 5 f f 5 .
        . . . d d d d .
    `, SpriteKind.Enemy)
    //  --- AJUSTE DE TAMAÑO ---
    //  Como las funciones automáticas fallaban, definimos el área manualmente.
    //  Si tu mapa es muy grande, aumenta estos números (ej. 500, 1000).
    let ancho_zona = 250
    let alto_zona = 250
    z.setPosition(randint(10, ancho_zona), randint(10, alto_zona))
    //  Si aparecen muy cerca del jugador, los movemos para evitar daño injusto
    if (Math.abs(z.x - protagonista.x) < 40) {
        z.x += 60
    }
    
    z.follow(protagonista, 30 + ronda * 3)
}

function nueva_ronda(n: number) {
    
    game.splash("DIA " + ("" + n))
    vivos = dificultad[n - 1]
    for (let i = 0; i < vivos; i++) {
        spawn()
    }
}

//  --- TIENDA Y AVANCE ---
function tienda() {
    
    //  Pausamos el seguimiento de cámara momentáneamente
    scene.cameraFollowSprite(null)
    scene.setBackgroundColor(15)
    story.showPlayerChoices("Botas (+Vel)", "Continuar")
    if (story.checkLastAnswer("Botas (+Vel)") && oro >= 40) {
        oro -= 40
        velocidad += 20
        controller.moveSprite(protagonista, velocidad, velocidad)
    }
    
    info.setScore(oro)
    //  Al salir, recargamos mapa y cámara
    cargar_mapa()
    proximo_paso()
}

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
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function choque(p: Sprite, e: Sprite) {
    info.changeLifeBy(-1)
    e.destroy()
    
    vivos -= 1
    if (vivos <= 0) {
        tienda()
    }
    
})
function proximo_paso() {
    
    ronda += 1
    if (ronda > 5) {
        game.over(true)
    } else {
        nueva_ronda(ronda)
    }
    
}

//  --- INICIO ---
controller.moveSprite(protagonista, velocidad, velocidad)
info.setScore(oro)
info.setLife(3)
iniciar_historia()
nueva_ronda(ronda)
