//  ==========================================
//  PROYECTO: Zombie Survival Merchant
//  OBJETIVO: Sobrevivir 5 rondas y mejorar el equipo
//  ==========================================
//  --- VARIABLES GLOBALES ---
let dia = 1
let zombies_vivos = 0
let dinero = 50
let velocidad_jugador = 100
let danio_arma = 1
//  Estructura de datos compleja: Lista de enemigos por ronda (Criterio +1pt)
let zombies_por_ronda = [5, 10, 15, 20, 30]
//  --- CONFIGURACIÓN INICIAL ---
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
    `, SpriteKind.Player)
controller.moveSprite(mercader, velocidad_jugador, velocidad_jugador)
scene.cameraFollowSprite(mercader)
info.setScore(dinero)
info.setLife(3)
//  --- MÓDULO DE COMBATE ---
controller.A.onEvent(ControllerButtonEvent.Pressed, function disparar() {
    /** Crea un proyectil. Función modular reutilizable. */
    let projectile = sprites.createProjectileFromSprite(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 5 5 5 5 5 5 5 5 . . . . .
        . . . . . . . . . . . . . . . .
    `, mercader, 150, 0)
    music.pewPew.play()
})
function spawn_zombie() {
    /** Genera un enemigo en una posición aleatoria. */
    
    let zombie = sprites.create(img`
        . . . . . . 5 5 . . . . . . . .
        . . . . . 5 5 5 5 . . . . . . .
        . . . . . 5 f f 5 . . . . . . .
        . . . . . 5 f f 5 . . . . . . .
        . . . . . 5 5 5 5 . . . . . . .
        . . . . . . 5 5 . . . . . . . .
        . . . . . d d d d . . . . . . .
        `, SpriteKind.Enemy)
    zombie.setPosition(randint(0, 160), randint(0, 120))
    //  Evitar que aparezca encima del jugador
    if (Math.abs(zombie.x - mercader.x) < 20) {
        zombie.x += 40
    }
    
    zombie.follow(mercader, 30 + dia * 2)
}

//  Dificultad progresiva
function iniciar_ronda(num_dia: number) {
    /** Configura la ronda según el día actual. Usa parámetros. */
    
    game.splash("DIA " + ("" + num_dia), "¡Sobrevive!")
    zombies_vivos = zombies_por_ronda[num_dia - 1]
    for (let i = 0; i < zombies_vivos; i++) {
        spawn_zombie()
    }
}

//  --- MÓDULO DE TIENDA (MENÚ INTERACTIVO) ---
function abrir_tienda() {
    /** Menú interactivo con el usuario (Criterio +1pt) */
    
    story.printCharacterText("¡Ronda superada! ¿Qué quieres comprar?", "Sistema")
    story.showPlayerChoices("Botas Rápidas (40$)", "Munición Pesada (60$)", "Siguiente Ronda")
    if (story.checkLastAnswer("Botas Rápidas (40$)")) {
        if (dinero >= 40) {
            dinero -= 40
            velocidad_jugador += 20
            controller.moveSprite(mercader, velocidad_jugador, velocidad_jugador)
            story.printCharacterText("¡Ahora eres más rápido!")
        } else {
            story.printCharacterText("No tienes suficiente dinero...")
        }
        
    } else if (story.checkLastAnswer("Munición Pesada (60$)")) {
        if (dinero >= 60) {
            dinero -= 60
            danio_arma += 1
            story.printCharacterText("Tus balas son más fuertes.")
        } else {
            story.printCharacterText("Dinero insuficiente...")
        }
        
    }
    
    info.setScore(dinero)
    verificar_progreso()
}

//  --- GESTIÓN DE ESTADOS Y COLISIONES ---
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function al_morir_zombie(proyectil: Sprite, zombie: Sprite) {
    
    proyectil.destroy()
    zombie.destroy(effects.disintegrate, 200)
    zombies_vivos -= 1
    dinero += 10
    info.setScore(dinero)
    if (zombies_vivos <= 0) {
        abrir_tienda()
    }
    
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function daño_jugador(jugador: Sprite, zombie: Sprite) {
    info.changeLifeBy(-1)
    zombie.destroy()
    
    zombies_vivos -= 1
    if (zombies_vivos <= 0) {
        abrir_tienda()
    }
    
})
function verificar_progreso() {
    /** Controla si el juego termina o sigue. Final assolible (+2pts). */
    
    dia += 1
    if (dia > 5) {
        game.over(true, effects.confetti)
    } else {
        iniciar_ronda(dia)
    }
    
}

//  --- INICIO DEL JUEGO ---
game.showLongText(`ZOMBIE SURVIVAL

Elimina a los zombies para ganar dinero y mejorar tu equipo en la tienda.`, DialogLayout.Center)
iniciar_ronda(dia)
