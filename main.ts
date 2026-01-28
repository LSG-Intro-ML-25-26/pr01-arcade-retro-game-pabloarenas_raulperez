// ==============================================================================
// PROYECTO: EL BOSQUE SUSURRANTE - VERSIÓN JAVASCRIPT (RESTAURADA)
// ==============================================================================

// Definimos el tipo del Boss
const KIND_BOSS = SpriteKind.create()

class GameData {
    ronda: number
    oro: number
    puntos: number
    velocidad: number
    monstruos_restantes: number
    tiene_escudo: boolean
    escudo_vida: number
    invulnerable: boolean
    en_tienda: boolean
    juego_activo: boolean
    boss_creado: boolean
    lore: string[]

    constructor() {
        this.reiniciar()
    }

    reiniciar() {
        this.ronda = 1
        this.oro = 0
        this.puntos = 0
        this.velocidad = 65
        this.monstruos_restantes = 10
        this.tiene_escudo = false
        this.escudo_vida = 0
        this.invulnerable = false
        this.en_tienda = false
        this.juego_activo = false
        this.boss_creado = false
        this.lore = [
            "NOCHE 1: Mi avioneta cayo...",
            "NOCHE 2: El rescate no llega...",
            "NOCHE 3: El Gran Espiritu despierta..."
        ]
    }
}

let juego = new GameData()
let animacion_actual = ""

// --- JUGADOR Y BARRAS ---
let protagonista = sprites.create(img` . `, SpriteKind.Player)
protagonista.setFlag(SpriteFlag.Invisible, true)

let barra_escudo = statusbars.create(20, 3, StatusBarKind.Magic)
barra_escudo.setColor(5, 1) // Amarillo
barra_escudo.attachToSprite(protagonista, 2)
barra_escudo.setFlag(SpriteFlag.Invisible, true)

// --- LÓGICA DE SPAWN SEGURO ---
game.onUpdateInterval(2500, function () {
    if (!juego.juego_activo || juego.en_tienda) return

    if (juego.ronda == 3 && juego.monstruos_restantes <= 5 && !juego.boss_creado) {
        crear_boss()
        return
    }

    if (sprites.allOfKind(SpriteKind.Enemy).length < 6) {
        let enemigo = sprites.create(assets.image`fantasma`, SpriteKind.Enemy)

        // Aparecen en los bordes de la pantalla (160x120)
        if (Math.percentChance(50)) {
            enemigo.x = protagonista.x + (Math.pickRandom([80, -80]))
            enemigo.y = protagonista.y + randint(-60, 60)
        } else {
            enemigo.x = protagonista.x + randint(-80, 80)
            enemigo.y = protagonista.y + (Math.pickRandom([60, -60]))
        }

        enemigo.follow(protagonista, 25 + (juego.ronda * 5))
    }
})

function crear_boss() {
    juego.boss_creado = true
    let boss = sprites.create(assets.image`fantasma`, KIND_BOSS)
    boss.setScale(3, ScaleAnchor.Middle)
    boss.setPosition(protagonista.x + 80, protagonista.y)
    boss.follow(protagonista, 20)

    let hp_boss = statusbars.create(40, 4, StatusBarKind.Health)
    hp_boss.attachToSprite(boss, 5)
    hp_boss.max = 20
    hp_boss.value = 20
}

// --- COMBATE ---
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (juego.juego_activo) {
        let vx = controller.dx() * 110
        let vy = controller.dy() * 110
        if (vx == 0 && vy == 0) vx = 110
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

// Colisión proyectil con enemigo normal
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprite.destroy()
    otherSprite.destroy(effects.disintegrate, 200)
    juego.oro += 10
    juego.puntos += 100
    info.setScore(juego.puntos)
    juego.monstruos_restantes -= 1
    revisar_victoria()
})

// Colisión proyectil con Boss
sprites.onOverlap(SpriteKind.Projectile, KIND_BOSS, function (sprite, otherSprite) {
    sprite.destroy()
    let hp = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, otherSprite)
    if (hp) {
        hp.value -= 1
        if (hp.value <= 0) {
            otherSprite.destroy(effects.fire, 500)
            juego.monstruos_restantes = 0
            revisar_victoria()
        }
    }
})

function revisar_victoria() {
    if (juego.monstruos_restantes <= 0) {
        if (juego.ronda < 3) {
            abrir_tienda()
        } else {
            gestionar_records(juego.puntos)
            game.over(true)
        }
    }
}

// --- SISTEMA DE DAÑO ---
function aplicar_daño(otherSprite: Sprite) {
    if (juego.invulnerable) return

    if (otherSprite.kind() == SpriteKind.Enemy) {
        otherSprite.destroy()
    }

    if (juego.tiene_escudo) {
        juego.escudo_vida -= 1
        if (juego.escudo_vida <= 0) {
            juego.tiene_escudo = false
            protagonista.sayText("¡ESCUDO ROTO!", 1000)
            music.bigCrash.play()
        }
    } else {
        info.changeLifeBy(-1)
    }

    juego.invulnerable = true
    pause(800)
    juego.invulnerable = false
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    aplicar_daño(otherSprite)
})

sprites.onOverlap(SpriteKind.Player, KIND_BOSS, function (sprite, otherSprite) {
    aplicar_daño(otherSprite)
})

// --- SISTEMA DE RECORDS ---
function gestionar_records(puntos: number) {
    let historial = settings.readNumberArray("records_bosque")
    if (!historial) historial = []
    historial.insertAt(0, puntos)
    if (historial.length > 3) historial.removeAt(3)
    settings.writeNumberArray("records_bosque", historial)
}

function mostrar_records() {
    let partidas = settings.readNumberArray("records_bosque")
    let msg = "ULTIMAS PARTIDAS:\n"
    if (partidas) {
        for (let i = 0; i < partidas.length; i++) {
            msg += (i + 1) + ". " + partidas[i] + " PTS\n"
        }
    } else {
        msg = "No hay registros aun."
    }
    game.showLongText(msg, DialogLayout.Center)
    menu_principal()
}

// --- INICIO Y TIENDA ---
function iniciar_noche(n: number) {
    juego.en_tienda = false
    juego.boss_creado = false
    game.showLongText(juego.lore[n - 1], DialogLayout.Center)
    tiles.setCurrentTilemap(assets.tilemap`mapa`)
    protagonista.setImage(assets.image`nena-front`)
    protagonista.setFlag(SpriteFlag.Invisible, false)
    protagonista.setPosition(80, 60)
    scene.cameraFollowSprite(protagonista)
    controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
    juego.monstruos_restantes = 10 + (n - 1) * 5
    juego.juego_activo = true
}

game.onUpdate(function () {
    if (!juego.juego_activo || juego.en_tienda) return

    if (juego.tiene_escudo) {
        barra_escudo.setFlag(SpriteFlag.Invisible, false)
        barra_escudo.value = (juego.escudo_vida / 3) * 100
    } else {
        barra_escudo.setFlag(SpriteFlag.Invisible, true)
    }

    if (protagonista.vx > 0 && animacion_actual != "der") {
        animacion_actual = "der"; animation.runImageAnimation(protagonista, assets.animation`nena-animation-right`, 100, true)
    } else if (protagonista.vx < 0 && animacion_actual != "izq") {
        animacion_actual = "izq"; animation.runImageAnimation(protagonista, assets.animation`nena-animation-left`, 100, true)
    } else if (protagonista.vy > 0 && animacion_actual != "aba") {
        animacion_actual = "aba"; animation.runImageAnimation(protagonista, assets.animation`nena-animation-down`, 100, true)
    } else if (protagonista.vy < 0 && animacion_actual != "arr") {
        animacion_actual = "arr"; animation.runImageAnimation(protagonista, assets.animation`nena-animation-up`, 100, true)
    } else if (protagonista.vx == 0 && protagonista.vy == 0 && animacion_actual != "") {
        animacion_actual = ""; animation.stopAnimation(animation.AnimationTypes.All, protagonista); protagonista.setImage(assets.image`nena-front`)
    }
})

info.onLifeZero(function () {
    gestionar_records(juego.puntos)
    game.over(false)
})

function abrir_tienda() {
    juego.juego_activo = false
    juego.en_tienda = true
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) { e.destroy() }
    for (let b of sprites.allOfKind(KIND_BOSS)) { b.destroy() }

    protagonista.setFlag(SpriteFlag.Invisible, true)
    barra_escudo.setFlag(SpriteFlag.Invisible, true)

    game.showLongText("BIENVENIDO A LA TIENDA\nOro: " + juego.oro, DialogLayout.Bottom)
    story.showPlayerChoices("Curar (15g)", "Escudo (30g)", "SIGUIENTE NOCHE")

    if (story.checkLastAnswer("SIGUIENTE NOCHE")) {
        juego.ronda += 1
        iniciar_noche(juego.ronda)
    } else if (story.checkLastAnswer("Curar (15g)")) {
        if (juego.oro >= 15) {
            juego.oro -= 15
            info.changeLifeBy(1)
        }
        abrir_tienda()
    } else if (story.checkLastAnswer("Escudo (30g)")) {
        if (juego.oro >= 30) {
            juego.oro -= 30
            juego.tiene_escudo = true
            juego.escudo_vida = 3
        }
        abrir_tienda()
    }
}

function menu_principal() {
    scene.setBackgroundColor(15)
    game.splash("EL BOSQUE", "SUSURRANTE")
    story.showPlayerChoices("JUGAR", "RECORDS", "SALIR")
    if (story.checkLastAnswer("JUGAR")) {
        info.setLife(3)
        info.setScore(0)
        juego.reiniciar()
        iniciar_noche(1)
    } else if (story.checkLastAnswer("RECORDS")) {
        mostrar_records()
    } else {
        game.reset()
    }
}

menu_principal()