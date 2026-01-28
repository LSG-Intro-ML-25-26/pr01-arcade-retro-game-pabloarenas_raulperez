//  ==============================================================================
//  PROYECTO: LA CABAÑA - NOCHE ETERNA (VERSIÓN FINAL CORREGIDA)
//  ==============================================================================
class GameData {
    ronda: number
    oro: number
    puntos: number
    vivos: number
    velocidad: number
    tiene_escudo: boolean
    invulnerable: boolean
    lore: string[]
    dificultad: number[]
    constructor() {
        this.reiniciar()
    }
    
    public reiniciar() {
        this.ronda = 1
        this.oro = 0
        this.puntos = 0
        this.vivos = 0
        this.velocidad = 70
        this.tiene_escudo = false
        this.invulnerable = false
        this.lore = ["Noche 1: Papa no ha vuelto. Solo me queda su viejo revolver.", "Noche 2: He visto sombras caminar en dos patas. No son lobos...", "Noche 3: Un mercader paso por la cabaña. Compre suministros.", "Noche 4: El bosque entero ruge. Intentan entrar por las ventanas.", "Noche 5: Es el final. Si aguanto hasta el alba, sere libre."]
        this.dificultad = [4, 8, 12, 16, 22]
    }
    
}

let juego = new GameData()
//  --- PERSISTENCIA (RECORDS) ---
function gestionar_records(puntos_finales: number) {
    let temp: number;
    let tops = settings.readNumberArray("records_vfinal")
    if (!tops) {
        tops = []
    }
    
    tops.push(puntos_finales)
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
    
    settings.writeNumberArray("records_vfinal", tops)
}

function mostrar_menu_records() {
    scene.setBackgroundColor(15)
    let tops = settings.readNumberArray("records_vfinal")
    let msg = `TOP CAZADORES
==============
`
    if (tops && tops.length > 0) {
        for (let i = 0; i < tops.length; i++) {
            msg += "" + (i + 1) + ". " + ("" + tops[i]) + " PTS\n\n"
        }
    } else {
        msg += `
Sin registros todavia.`
    }
    
    game.showLongText(msg, DialogLayout.Center)
    menu_principal()
}

//  --- SPRITES ---
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
//  --- DISPARO ---
controller.A.onEvent(ControllerButtonEvent.Pressed, function disparar() {
    let vx: number;
    let vy: number;
    let bala: Sprite;
    if (!(protagonista.flags & SpriteFlag.Invisible)) {
        vx = controller.dx() * 80
        vy = controller.dy() * 80
        if (vx == 0 && vy == 0) {
            vx = 80
            vy = 0
        }
        
        bala = sprites.createProjectileFromSprite(img`
            . . 5 . .
            . 5 4 5 .
            5 4 4 4 5
            . 5 4 5 .
            . . 5 . .
        `, protagonista, vx, vy)
        music.pewPew.play()
    }
    
})
//  --- TIENDA ---
function abrir_tienda() {
    if (info.life() <= 0) {
        return
    }
    
    //  Limpiamos proyectiles sueltos para evitar ruidos
    for (let b of sprites.allOfKind(SpriteKind.Projectile)) {
        b.destroy()
    }
    scene.setBackgroundColor(15)
    while (true) {
        game.showLongText("ORO: " + ("" + juego.oro), DialogLayout.Bottom)
        story.showPlayerChoices("Medikit (15g)", "Escudo (30g)", "Botas (20g)", "Siguiente Noche")
        if (story.checkLastAnswer("Siguiente Noche")) {
            break
        } else if (story.checkLastAnswer("Medikit (15g)")) {
            if (juego.oro >= 15) {
                if (info.life() < 3) {
                    juego.oro -= 15
                    info.changeLifeBy(1)
                    music.powerUp.play()
                } else {
                    game.showLongText("Vida al maximo", DialogLayout.Bottom)
                }
                
            } else {
                game.showLongText("Oro insuficiente", DialogLayout.Bottom)
            }
            
        } else if (story.checkLastAnswer("Escudo (30g)")) {
            if (juego.oro >= 30) {
                juego.oro -= 30
                juego.tiene_escudo = true
                barra_escudo.value = 3
                barra_escudo.max = 3
                barra_escudo.attachToSprite(protagonista, -4, 0)
                barra_escudo.setFlag(SpriteFlag.Invisible, false)
            } else {
                game.showLongText("Oro insuficiente", DialogLayout.Bottom)
            }
            
        } else if (story.checkLastAnswer("Botas (20g)")) {
            if (juego.oro >= 20) {
                juego.oro -= 20
                juego.velocidad = 150
            } else {
                game.showLongText("Oro insuficiente", DialogLayout.Bottom)
            }
            
        }
        
    }
    info.setScore(juego.puntos)
    controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
    juego.ronda += 1
    if (juego.ronda <= 5) {
        iniciar_noche(juego.ronda)
    } else {
        gestionar_records(juego.puntos)
        game.over(true)
    }
    
}

//  --- LÓGICA DE COMBATE ---
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function dano_jugador(p: Sprite, e: Sprite) {
    if (juego.invulnerable) {
        return
    }
    
    e.destroy()
    juego.vivos -= 1
    if (juego.tiene_escudo && barra_escudo.value > 0) {
        barra_escudo.value -= 1
        music.baDing.play()
        juego.invulnerable = true
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
    
    //  Comprobación de fin de noche tras daño
    if (info.life() > 0 && juego.vivos <= 0) {
        pause(500)
        //  Pausa para que el jugador respire
        abrir_tienda()
    }
    
})
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

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function enemigo_derrotado(p: Sprite, e: Sprite) {
    //  Destruimos la bala y el enemigo inmediatamente
    p.destroy()
    e.destroy(effects.disintegrate, 200)
    //  Solo restamos de vivos si el enemigo aún no había sido contado
    juego.vivos -= 1
    juego.oro += 10
    juego.puntos += 100
    info.setScore(juego.puntos)
    //  Verificación estricta: si ya no quedan vivos, saltar a tienda
    if (juego.vivos <= 0 && info.life() > 0) {
        pause(500)
        //  Pequeño delay para que se vea la muerte del último
        abrir_tienda()
    }
    
})
info.onLifeZero(function al_morir() {
    gestionar_records(juego.puntos)
    game.over(false)
})
function menu_principal() {
    scene.setBackgroundColor(15)
    game.splash("LA CABANA", "NOCHE ETERNA")
    story.showPlayerChoices("JUGAR", "RECORDS")
    if (story.checkLastAnswer("JUGAR")) {
        info.setLife(3)
        info.setScore(0)
        juego.reiniciar()
        controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
        iniciar_noche(1)
    } else {
        mostrar_menu_records()
    }
    
}

menu_principal()
