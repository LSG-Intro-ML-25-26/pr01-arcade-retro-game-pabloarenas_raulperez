//  ==========================================
//  PROYECTO: Zombie Survival Merchant
//  ==========================================
//  --- VARIABLES ---
let ronda = 1
let vivos = 0
let oro = 50
let velocidad = 100
let dificultad = [5, 10, 15, 20, 30]
//  --- SPRITE ---
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
//  --- SISTEMA DE TEXTO (Splash para evitar bugs visuales) ---
function iniciar_historia() {
    /** 
    Usa game.splash para asegurar fondo negro y letras limpias.
    Esto elimina el bug de letras amontonadas.
    
 */
    //  Limpiamos marcos para que no queden restos
    game.setDialogFrame(null)
    scene.setBackgroundColor(15)
    pause(200)
    //  game.splash es mucho más estable que show_long_text para estos errores
    game.splash("ZOMBIE SURVIVAL", "MERCHANT")
    game.splash("HISTORIA:", `Eres el ultimo mercader.
Protege tu stock.`)
    //  Separamos la misión para que no se pisen las letras
    game.splash("MISION: Mata zombies,", "gana oro y mejora.")
    game.splash("OBJETIVO FINAL:", "SOBREVIVE 5 DIAS")
    //  Iniciamos el juego
    scene.setBackgroundColor(13)
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
    z.setPosition(randint(0, 160), randint(0, 120))
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
    
    scene.setBackgroundColor(15)
    //  Story choices es seguro porque usa su propia interfaz
    story.showPlayerChoices("Botas (+Vel)", "Continuar")
    if (story.checkLastAnswer("Botas (+Vel)") && oro >= 40) {
        oro -= 40
        velocidad += 20
        controller.moveSprite(protagonista, velocidad, velocidad)
    }
    
    info.setScore(oro)
    scene.setBackgroundColor(13)
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
