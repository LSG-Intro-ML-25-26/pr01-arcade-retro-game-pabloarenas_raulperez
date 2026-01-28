//  ==============================================================================
//  PROYECTO: EL BOSQUE SUSURRANTE - FANTASMAS ANIMADOS
//  ==============================================================================
class GameData {
    ronda: number
    oro: number
    puntos: number
    velocidad: number
    monstruos_restantes: number
    tiene_escudo: boolean
    invulnerable: boolean
    en_tienda: boolean
    juego_activo: boolean
    lore: string[]
    constructor() {
        this.reiniciar()
    }
    
    public reiniciar() {
        this.ronda = 1
        this.oro = 0
        this.puntos = 0
        this.velocidad = 65
        this.monstruos_restantes = 10
        this.tiene_escudo = false
        this.invulnerable = false
        this.en_tienda = false
        this.juego_activo = false
        this.lore = ["NOCHE 1: Mi avioneta cayo en este infierno verde. Solo tengo mi revolver y la esperanza de que vean la señal de humo. Algo se mueve...", "NOCHE 2: El rescate no llega. El frio cala mis huesos y los aullidos son cada vez mas humanos. Si muero aqui, nadie me encontrara.", "NOCHE 3: Es la ultima radiofrecuencia. El helicoptero llegara al amanecer, pero el bosque entero ha despertado. ¡Resiste!"]
    }
    
}

let juego = new GameData()
//  --- HISTORIAL DE PARTIDAS ---
function gestionar_records(puntos_finales: number) {
    let historial = settings.readNumberArray("hist_v3")
    if (!historial) {
        historial = []
    }
    
    historial.insertAt(0, puntos_finales)
    if (historial.length > 3) {
        historial.removeAt(3)
    }
    
    settings.writeNumberArray("hist_v3", historial)
}

function mostrar_menu_records() {
    let label: any;
    scene.setBackgroundColor(15)
    let partidas = settings.readNumberArray("hist_v3")
    let msg = `ULTIMAS PARTIDAS
==============
`
    if (partidas && partidas.length > 0) {
        for (let i = 0; i < partidas.length; i++) {
            label = i == 0 ? " (NUEVA)" : ""
            msg += "" + (i + 1) + ". " + ("" + partidas[i]) + " PTS" + label + "\n\n"
        }
    } else {
        msg += `
No hay partidas registradas.`
    }
    
    game.showLongText(msg, DialogLayout.Center)
    menu_principal()
}

//  --- JUGADOR ---
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
barra_escudo.setColor(9, 1)
barra_escudo.setFlag(SpriteFlag.Invisible, true)
//  --- TIENDA ---
function abrir_tienda() {
    juego.juego_activo = false
    juego.en_tienda = true
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        e.destroy()
    }
    protagonista.setFlag(SpriteFlag.Invisible, true)
    scene.setBackgroundColor(15)
    game.showLongText(`EL AMANECER TE DA UN RESPIRO
ORO: ` + ("" + juego.oro), DialogLayout.Bottom)
    story.showPlayerChoices("Curar (15g)", "Botas (20g)", "Escudo (30g)", "SIGUIENTE NOCHE")
    if (story.checkLastAnswer("SIGUIENTE NOCHE")) {
        juego.ronda += 1
        iniciar_noche(juego.ronda)
    } else if (story.checkLastAnswer("Curar (15g)")) {
        if (juego.oro >= 15 && info.life() < 3) {
            juego.oro -= 15
            info.changeLifeBy(1)
        }
        
        abrir_tienda()
    } else if (story.checkLastAnswer("Botas (20g)")) {
        if (juego.oro >= 20) {
            juego.oro -= 20
            juego.velocidad = 100
        }
        
        abrir_tienda()
    } else if (story.checkLastAnswer("Escudo (30g)")) {
        if (juego.oro >= 30) {
            juego.oro -= 30
            juego.tiene_escudo = true
            barra_escudo.max = 3
            barra_escudo.value = 3
            barra_escudo.attachToSprite(protagonista, -4, 0)
            barra_escudo.setFlag(SpriteFlag.Invisible, false)
        }
        
        abrir_tienda()
    }
    
}

//  --- LÓGICA DE NOCHE ---
function iniciar_noche(n: number) {
    juego.en_tienda = false
    scene.setBackgroundColor(15)
    game.showLongText(juego.lore[n - 1], DialogLayout.Center)
    tiles.setCurrentTilemap(assets.tilemap`mapa`)
    scene.cameraFollowSprite(protagonista)
    protagonista.setFlag(SpriteFlag.Invisible, false)
    controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
    if (n == 1) {
        juego.monstruos_restantes = 10
    } else if (n == 2) {
        juego.monstruos_restantes = 15
    } else {
        juego.monstruos_restantes = 20
    }
    
    juego.juego_activo = true
}

game.onUpdateInterval(2500, function crear_enemigo() {
    let enemigo: Sprite;
    if (juego.juego_activo && !juego.en_tienda) {
        if (sprites.allOfKind(SpriteKind.Enemy).length < 6) {
            enemigo = sprites.create(assets.image`fantasma`, SpriteKind.Enemy)
            enemigo.x = 250 + randint(-60, 60)
            enemigo.y = 250 + randint(-60, 60)
            enemigo.follow(protagonista, 35 + juego.ronda * 5)
        }
        
    }
    
})
//  --- ACTUALIZAR DISEÑO DE FANTASMAS (NUEVO) ---
game.onUpdate(function actualizar_fantasmas() {
    for (let f of sprites.allOfKind(SpriteKind.Enemy)) {
        if (f.vx > 0) {
            f.setImage(assets.image`fantasma_derecha`)
        } else if (f.vx < 0) {
            f.setImage(assets.image`fantasma_izquierda`)
        } else {
            f.setImage(assets.image`fantasma`)
        }
        
    }
})
//  --- COMBATE ---
controller.A.onEvent(ControllerButtonEvent.Pressed, function disparar() {
    let vx: number;
    let vy: number;
    if (juego.juego_activo) {
        vx = controller.dx() * 110
        vy = controller.dy() * 110
        if (vx == 0 && vy == 0) {
            vx = 110
        }
        
        sprites.createProjectileFromSprite(img`
            . . 5 . .
            . 5 4 5 .
            5 4 4 4 5
            . 5 4 5 .
            . . 5 . .
        `, protagonista, vx, vy)
        music.pewPew.play()
    }
    
})
//  --- FINAL ---
function victoria_final() {
    juego.juego_activo = false
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        e.destroy()
    }
    scene.setBackgroundColor(15)
    pause(500)
    game.showLongText("El rescate ha llegado.", DialogLayout.Center)
    gestionar_records(juego.puntos)
    game.over(true)
}

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function baja_enemigo(bala: Sprite, monstruo: Sprite) {
    bala.destroy()
    monstruo.destroy(effects.disintegrate, 200)
    juego.oro += 10
    juego.puntos += 100
    juego.monstruos_restantes -= 1
    info.setScore(juego.puntos)
    if (juego.monstruos_restantes <= 0) {
        if (juego.ronda < 3) {
            abrir_tienda()
        } else {
            victoria_final()
        }
        
    }
    
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function daño_jugador(p: Sprite, e: Sprite) {
    if (juego.invulnerable) {
        return
    }
    
    e.destroy()
    if (juego.tiene_escudo && barra_escudo.value > 0) {
        barra_escudo.value -= 1
        if (barra_escudo.value <= 0) {
            juego.tiene_escudo = false
            barra_escudo.setFlag(SpriteFlag.Invisible, true)
            protagonista.say("¡Escudo roto!", 1000)
        }
        
    } else {
        info.changeLifeBy(-1)
    }
    
    juego.invulnerable = true
    pause(1000)
    juego.invulnerable = false
})
info.onLifeZero(function finalizar_por_muerte() {
    gestionar_records(juego.puntos)
    game.over(false)
})
function menu_principal() {
    scene.setBackgroundColor(15)
    game.splash("EL BOSQUE", "SUSURRANTE")
    story.showPlayerChoices("JUGAR", "RECORDS")
    if (story.checkLastAnswer("JUGAR")) {
        info.setLife(3)
        info.setScore(0)
        juego.reiniciar()
        iniciar_noche(1)
    } else {
        mostrar_menu_records()
    }
    
}

menu_principal()
