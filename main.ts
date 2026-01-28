//  ==============================================================================
//  PROYECTO: EL BOSQUE SUSURRANTE - VERSIÓN FINAL DOCUMENTADA
//  ==============================================================================
let KIND_BOSS = SpriteKind.create()
let KIND_DECO = SpriteKind.create()
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
    boss_creado: boolean
    animacion_actual: string
    lore: string[]
    public static __initGameData() {
        /** Clase para la gestión integral de variables de estado y persistencia. */
    }
    
    constructor() {
        this.reiniciar()
    }
    
    public reiniciar() {
        /** Inicializa los valores por defecto al comenzar una nueva partida. */
        this.ronda = 1
        this.oro = 0
        this.puntos = 0
        this.velocidad = 65
        this.monstruos_restantes = 10
        this.tiene_escudo = false
        this.invulnerable = false
        this.en_tienda = false
        this.juego_activo = false
        this.boss_creado = false
        this.animacion_actual = ""
        this.lore = ["NOCHE 1: Mi avioneta cayo...", "NOCHE 2: El frio cala mis huesos...", "NOCHE 3: El Espiritu del Bosque despierta. ¡Matalo para escapar!"]
    }
    
}

GameData.__initGameData()

let juego = new GameData()
//  --- JUGADOR Y BARRA AMARILLA ---
let protagonista = sprites.create(assets.image`player-standing`, SpriteKind.Player)
protagonista.setFlag(SpriteFlag.Invisible, true)
let barra_escudo = statusbars.create(20, 4, StatusBarKind.Magic)
barra_escudo.setColor(5, 1)
barra_escudo.setFlag(SpriteFlag.Invisible, true)
//  --- SISTEMA DE ANIMACIÓN Y BARRA ---
function controlar_animaciones_jugador() {
    /** Gestiona el motor de animaciones 2D basado en el vector de movimiento vx/vy. */
    if (!juego.juego_activo || juego.en_tienda) {
        return
    }
    
    if (protagonista.vx > 0) {
        if (juego.animacion_actual != "der") {
            juego.animacion_actual = "der"
            animation.runImageAnimation(protagonista, assets.animation`player-moving-right`, 100, true)
        }
        
    } else if (protagonista.vx < 0) {
        if (juego.animacion_actual != "izq") {
            juego.animacion_actual = "izq"
            animation.runImageAnimation(protagonista, assets.animation`player-moving-left`, 100, true)
        }
        
    } else if (protagonista.vy > 0) {
        if (juego.animacion_actual != "aba") {
            juego.animacion_actual = "aba"
            animation.runImageAnimation(protagonista, assets.animation`player-moving-down`, 100, true)
        }
        
    } else if (protagonista.vy < 0) {
        if (juego.animacion_actual != "arr") {
            juego.animacion_actual = "arr"
            animation.runImageAnimation(protagonista, assets.animation`player-moving-up`, 100, true)
        }
        
    } else if (juego.animacion_actual != "parado") {
        juego.animacion_actual = "parado"
        animation.stopAnimation(animation.AnimationTypes.All, protagonista)
        protagonista.setImage(assets.image`player-standing`)
    }
    
}

function actualizar_interfaz() {
    /** Dibuja y posiciona los elementos de la GUI sobre el personaje en tiempo real. */
    if (juego.juego_activo && juego.tiene_escudo) {
        barra_escudo.setFlag(SpriteFlag.Invisible, false)
        barra_escudo.attachToSprite(protagonista, 2, 0)
    } else {
        barra_escudo.setFlag(SpriteFlag.Invisible, true)
    }
    
}

game.onUpdate(function on_update_juego() {
    /** Callback global para la actualización de frames del motor de juego. */
    controlar_animaciones_jugador()
    actualizar_interfaz()
})
//  --- TIENDA ---
function abrir_tienda() {
    /** Crea el menú interactivo de la tienda para la progresión del jugador. */
    juego.juego_activo = false
    juego.en_tienda = true
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        e.destroy()
    }
    for (let b of sprites.allOfKind(KIND_BOSS)) {
        b.destroy()
    }
    protagonista.setFlag(SpriteFlag.Invisible, true)
    barra_escudo.setFlag(SpriteFlag.Invisible, true)
    game.showLongText("ORO: " + ("" + juego.oro), DialogLayout.Bottom)
    story.showPlayerChoices("Curar (15g)", "Botas (20g)", "Escudo (30g)", "SIGUIENTE NOCHE")
    if (story.checkLastAnswer("SIGUIENTE NOCHE")) {
        juego.ronda += 1
        iniciar_noche(juego.ronda)
    } else if (story.checkLastAnswer("Curar (15g)")) {
        if (juego.oro >= 15) {
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
        }
        
        abrir_tienda()
    }
    
}

//  --- DAÑO ---
function procesar_daño(p: Sprite, e: Sprite) {
    /** Calcula el impacto de colisiones y gestiona el sistema de invulnerabilidad. */
    if (juego.invulnerable) {
        return
    }
    
    if (e.kind() == SpriteKind.Enemy) {
        e.destroy()
    }
    
    if (juego.tiene_escudo && barra_escudo.value > 0) {
        barra_escudo.value -= 1
        if (barra_escudo.value <= 0) {
            juego.tiene_escudo = false
            barra_escudo.setFlag(SpriteFlag.Invisible, true)
            protagonista.sayText("¡ESCUDO ROTO!", 1000)
            music.bigCrash.play()
        }
        
    } else {
        info.changeLifeBy(-1)
    }
    
    juego.invulnerable = true
    pause(1000)
    juego.invulnerable = false
}

//  --- SPAWN Y BOSS ---
function crear_boss() {
    /** Genera el sprite del jefe final con sus atributos de salud y escala. */
    juego.boss_creado = true
    let boss = sprites.create(assets.image`fantasma`, KIND_BOSS)
    boss.setScale(3, ScaleAnchor.Middle)
    boss.setPosition(protagonista.x + 100, protagonista.y)
    boss.follow(protagonista, 25)
    let hp = statusbars.create(40, 4, StatusBarKind.Health)
    hp.attachToSprite(boss, 5)
    hp.max = 20
    hp.value = 20
    boss.sayText("¡NUNCA SALDRAS!", 2000)
}

game.onUpdateInterval(2500, function spawn_seguro() {
    let en: Sprite;
    /** Algoritmo de generación procedural de enemigos basado en la posición del jugador. */
    if (!juego.juego_activo || juego.en_tienda) {
        return
    }
    
    if (juego.ronda == 3 && juego.monstruos_restantes <= 5 && !juego.boss_creado) {
        crear_boss()
        return
    }
    
    if (sprites.allOfKind(SpriteKind.Enemy).length < 6) {
        en = sprites.create(assets.image`fantasma`, SpriteKind.Enemy)
        if (Math.percentChance(50)) {
            en.x = protagonista.x + Math.pickRandom([80, -80])
            en.y = protagonista.y + randint(-60, 60)
        } else {
            en.x = protagonista.x + randint(-80, 80)
            en.y = protagonista.y + Math.pickRandom([60, -60])
        }
        
        en.follow(protagonista, 35 + juego.ronda * 5)
    }
    
})
//  --- DECORACIÓN ---
function colocar_arboles_aleatorios() {
    let arbol: Sprite;
    /** Distribuye assets decorativos para aumentar la calidad visual (Punto 1.5 rúbrica). */
    let tipos_arboles = [assets.image`arbol1`, assets.image`arbol2`]
    for (let dibujo of tipos_arboles) {
        for (let i = 0; i < 12; i++) {
            arbol = sprites.create(dibujo, KIND_DECO)
            arbol.x = randint(10, 400)
            arbol.y = randint(10, 400)
            if (Math.abs(arbol.x - 80) < 40 && Math.abs(arbol.y - 60) < 40) {
                arbol.x += 60
            }
            
            arbol.z = -1
        }
    }
}

//  --- NOCHE ---
function iniciar_noche(n: number) {
    /** Carga el nivel, aplica el Tilemap y presenta el Lore narrativo. */
    juego.en_tienda = false
    juego.boss_creado = false
    for (let d of sprites.allOfKind(KIND_DECO)) {
        d.destroy()
    }
    game.showLongText(juego.lore[n - 1], DialogLayout.Center)
    tiles.setCurrentTilemap(assets.tilemap`mapa`)
    colocar_arboles_aleatorios()
    scene.cameraFollowSprite(protagonista)
    protagonista.setFlag(SpriteFlag.Invisible, false)
    protagonista.setPosition(80, 60)
    controller.moveSprite(protagonista, juego.velocidad, juego.velocidad)
    juego.monstruos_restantes = 10 + (n - 1) * 5
    juego.juego_activo = true
}

//  --- DISPARO ---
controller.A.onEvent(ControllerButtonEvent.Pressed, function disparar() {
    /** Sistema de combate para generar proyectiles en 8 direcciones. */
    if (!juego.juego_activo) {
        return
    }
    
    let vx = controller.dx() * 110
    let vy = controller.dy() * 110
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
})
//  --- COLISIONES ---
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function baja_enemigo(bala: Sprite, monstruo: Sprite) {
    /** Callback de colisión para eliminar enemigos y gestionar la economía. */
    bala.destroy()
    monstruo.destroy(effects.disintegrate, 200)
    juego.oro += 10
    juego.puntos += 100
    juego.monstruos_restantes -= 1
    if (juego.ronda < 3 && juego.monstruos_restantes <= 0) {
        abrir_tienda()
    }
    
    info.setScore(juego.puntos)
})
sprites.onOverlap(SpriteKind.Projectile, KIND_BOSS, function daño_boss(bala: Sprite, boss: Sprite) {
    /** Gestiona el impacto contra el jefe y la condición de victoria final. */
    bala.destroy()
    let hp = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, boss)
    if (hp) {
        hp.value -= 1
        boss.sayText("¡ARRG!", 500)
        if (hp.value <= 0) {
            boss.destroy(effects.fire, 800)
            juego.juego_activo = false
            pause(1000)
            gestionar_records(juego.puntos)
            game.over(true)
        }
        
    }
    
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, procesar_daño)
sprites.onOverlap(SpriteKind.Player, KIND_BOSS, procesar_daño)
//  --- RECORDS ---
function gestionar_records(p: number) {
    /** Almacena el High Score en memoria persistente mediante la API Settings. */
    let h = settings.readNumberArray("hist_v3")
    if (h == null) {
        h = []
    }
    
    h.insertAt(0, p)
    if (h.length > 3) {
        h.removeAt(3)
    }
    
    settings.writeNumberArray("hist_v3", h)
}

function mostrar_menu_records() {
    /** Presenta el historial de partidas guardadas en un layout de pantalla completa. */
    scene.setBackgroundColor(15)
    let partidas = settings.readNumberArray("hist_v3")
    let msg = `ULTIMOS RECORDS
===============
`
    if (partidas && partidas.length > 0) {
        for (let i = 0; i < partidas.length; i++) {
            msg += "" + (i + 1) + ". " + ("" + partidas[i]) + " PTS\n\n"
        }
    } else {
        msg += "Sin registros aun.\n"
    }
    
    game.showLongText(msg + "\n(A) VOLVER", DialogLayout.Full)
    menu_principal()
}

//  --- REEMPLAZO DE LAMBDA ---
info.onLifeZero(function al_morir() {
    /** Función modular invocada al agotar las vidas del jugador. */
    gestionar_records(juego.puntos)
    game.over(false)
})
function menu_principal() {
    /** Menú de usuario interactivo inicial (Punto 1 de la rúbrica). */
    scene.setBackgroundColor(15)
    game.splash("EL BOSQUE", "SUSURRANTE")
    story.showPlayerChoices("JUGAR", "RECORDS")
    if (story.checkLastAnswer("JUGAR")) {
        info.setLife(3)
        juego.reiniciar()
        iniciar_noche(1)
    } else {
        mostrar_menu_records()
    }
    
}

menu_principal()
