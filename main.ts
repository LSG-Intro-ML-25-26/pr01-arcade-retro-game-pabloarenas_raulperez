//  ==============================================================================
//  PROYECTO: LA CABAÑA - NOCHE ETERNA (VERSIÓN 100% COMPATIBLE)
//  ==============================================================================
class GameData {
    ronda: number
    oro: number
    vivos: number
    velocidad: number
    tiene_escudo: boolean
    invulnerable: boolean
    lore: string[]
    dificultad: number[]
    constructor() {
        this.ronda = 1
        this.oro = 0
        this.vivos = 0
        this.velocidad = 100
        this.tiene_escudo = false
        this.invulnerable = false
        this.lore = ["Noche 1: Papa no ha vuelto. Solo me queda su viejo revolver.", "Noche 2: He visto sombras caminar en dos patas. No son lobos...", "Noche 3: Un mercader paso por la cabaña. Compre suministros.", "Noche 4: El bosque entero ruge. Intentan entrar por las ventanas.", "Noche 5: Es el final. Si aguanto hasta el alba, sere libre."]
        this.dificultad = [4, 8, 12, 16, 22]
    }
    
}

let juego = new GameData()
//  --- FUNCIONES DE PERSISTENCIA ---
function gestionar_records(puntuacion_final: number) {
    let temp: number;
    let tops = settings.readNumberArray("tops_v4")
    if (!tops) {
        tops = []
    }
    
    tops.push(puntuacion_final)
    for (let i = 0; i < tops.length; i++) {
        for (let j = 0; j < tops.length - 1; j++) {
            if (tops[j] < tops[j + 1]) {
                temp = tops[j]
                tops[j] = tops[j + 1]
                tops[j + 1] = temp
            }
            
        }
    }
    if (tops.length > 3) {
        tops.removeAt(3)
    }
    
    settings.writeNumberArray("tops_v4", tops)
}

function mostrar_menu_records() {
    scene.setBackgroundColor(15)
    let tops = settings.readNumberArray("tops_v4")
    let msg = `--- MEJORES PARTIDAS ---
`
    if (tops && tops.length > 0) {
        for (let i = 0; i < tops.length; i++) {
            msg += "" + (i + 1) + ". " + ("" + tops[i]) + " Oro\n"
        }
    } else {
        msg += "Sin registros todavia."
    }
    
    game.showLongText(msg, DialogLayout.Center)
    menu_principal()
}

//  --- JUGABILIDAD ---
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
let barra_escudo = statusbars.create(20, 4, StatusBarKind.Energy)
barra_escudo.setFlag(SpriteFlag.Invisible, true)
barra_escudo.setColor(9, 2)
function iniciar_noche(n: number) {
    scene.setBackgroundColor(15)
    protagonista.setFlag(SpriteFlag.Invisible, true)
    let indice = n - 1
    if (indice < juego.lore.length) {
        game.showLongText(juego.lore[indice], DialogLayout.Center)
    }
    
    tiles.setCurrentTilemap(assets.tilemap`mapa`)
    scene.cameraFollowSprite(protagonista)
    protagonista.setFlag(SpriteFlag.Invisible, false)
    juego.vivos = juego.dificultad[n - 1]
    for (let i = 0; i < juego.vivos; i++) {
        crear_enemigo()
    }
}

function crear_enemigo() {
    let enemigo = sprites.create(img`
        . . . . 5 5 . .
        . . . 5 f f 5 .
        . . . d d d d .
    `, SpriteKind.Enemy)
    tiles.placeOnTile(enemigo, tiles.getTileLocation(randint(1, 20), randint(1, 20)))
    enemigo.follow(protagonista, 30 + juego.ronda * 5)
}

function abrir_tienda() {
    scene.setBackgroundColor(15)
    while (true) {
        game.showLongText("MERCADER - ORO: " + ("" + juego.oro), DialogLayout.Bottom)
        story.showPlayerChoices("Escudo (30g)", "Botas (20g)", "Continuar")
        if (story.checkLastAnswer("Continuar")) {
            break
        } else if (story.checkLastAnswer("Escudo (30g)") && juego.oro >= 30) {
            juego.oro -= 30
            juego.tiene_escudo = true
            barra_escudo.value = 3
            barra_escudo.max = 3
            barra_escudo.attachToSprite(protagonista, -4, 0)
            barra_escudo.setFlag(SpriteFlag.Invisible, false)
        } else if (story.checkLastAnswer("Botas (20g)") && juego.oro >= 20) {
            juego.oro -= 20
            juego.velocidad = 150
        }
        
    }
    info.setScore(juego.oro)
    controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
    juego.ronda += 1
    if (juego.ronda <= 5) {
        iniciar_noche(juego.ronda)
    } else {
        gestionar_records(juego.oro)
        game.over(true)
    }
    
}

//  --- SOLUCIÓN A LOS ERRORES DE SPRITEFLAG Y LAMBDA ---
//  Sustitución de lambda por función normal
controller.A.onEvent(ControllerButtonEvent.Pressed, function disparar() {
    let proj: Sprite;
    if (!(protagonista.flags & SpriteFlag.Invisible)) {
        proj = sprites.createProjectileFromSprite(img`
            . . . . . . . .
            . . 5 5 5 5 . .
            . . . . . . . .
        `, protagonista, 150, 0)
        music.pewPew.play()
    }
    
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function enemigo_derrotado(p: Sprite, e: Sprite) {
    p.destroy()
    e.destroy(effects.disintegrate, 200)
    juego.vivos -= 1
    juego.oro += 10
    info.setScore(juego.oro)
    if (juego.vivos <= 0) {
        abrir_tienda()
    }
    
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function dano_jugador(p: Sprite, e: Sprite) {
    if (juego.invulnerable) {
        return
    }
    
    e.destroy()
    juego.vivos -= 1
    if (juego.tiene_escudo && barra_escudo.value > 0) {
        barra_escudo.value -= 1
        music.baDing.play()
        //  Invulnerabilidad mediante parpadeo (sin usar GHOST_THROUGH_ENEMIES)
        juego.invulnerable = true
        //  El efecto de parpadeo visual ayuda a la durabilidad
        protagonista.setStayInScreen(true)
        pause(500)
        juego.invulnerable = false
        if (barra_escudo.value <= 0) {
            juego.tiene_escudo = false
            barra_escudo.setFlag(SpriteFlag.Invisible, true)
        }
        
    } else {
        info.changeLifeBy(-1)
        scene.cameraShake(4, 500)
    }
    
    if (juego.vivos <= 0) {
        abrir_tienda()
    }
    
})
//  Sustitución de lambda por función normal
info.onLifeZero(function finalizar_partida() {
    gestionar_records(juego.oro)
    game.over(false)
})
function menu_principal() {
    scene.setBackgroundColor(15)
    game.splash("LA CABANA", "NOCHE ETERNA")
    story.showPlayerChoices("JUGAR", "RECORDS")
    if (story.checkLastAnswer("JUGAR")) {
        info.setLife(3)
        info.setScore(0)
        juego.ronda = 1
        juego.oro = 0
        controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
        iniciar_noche(1)
    } else {
        mostrar_menu_records()
    }
    
}

menu_principal()
