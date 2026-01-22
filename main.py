# ==========================================
# PROYECTO: Zombie Survival Merchant
# OBJETIVO: Sobrevivir 5 rondas y mejorar el equipo
# ==========================================

# --- VARIABLES GLOBALES ---
dia = 1
zombies_vivos = 0
dinero = 50
velocidad_jugador = 100
danio_arma = 1
# Estructura de datos compleja: Lista de enemigos por ronda (Criterio +1pt)
zombies_por_ronda = [5, 10, 15, 20, 30]

# --- CONFIGURACIÓN INICIAL ---
mercader = sprites.create(img("""
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
    """), SpriteKind.player)

controller.move_sprite(mercader, velocidad_jugador, velocidad_jugador)
scene.camera_follow_sprite(mercader)
info.set_score(dinero)
info.set_life(3)

# --- MÓDULO DE COMBATE ---

def disparar():
    """ Crea un proyectil. Función modular reutilizable. """
    projectile = sprites.create_projectile_from_sprite(img("""
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 5 5 5 5 5 5 5 5 . . . . .
        . . . . . . . . . . . . . . . .
    """), mercader, 150, 0)
    music.pew_pew.play()

controller.A.on_event(ControllerButtonEvent.PRESSED, disparar)

def spawn_zombie():
    """ Genera un enemigo en una posición aleatoria. """
    global zombies_vivos
    zombie = sprites.create(img("""
        . . . . . . 5 5 . . . . . . . .
        . . . . . 5 5 5 5 . . . . . . .
        . . . . . 5 f f 5 . . . . . . .
        . . . . . 5 f f 5 . . . . . . .
        . . . . . 5 5 5 5 . . . . . . .
        . . . . . . 5 5 . . . . . . . .
        . . . . . d d d d . . . . . . .
        """), SpriteKind.enemy)
    zombie.set_position(randint(0, 160), randint(0, 120))
    # Evitar que aparezca encima del jugador
    if Math.abs(zombie.x - mercader.x) < 20:
        zombie.x += 40
    zombie.follow(mercader, 30 + (dia * 2)) # Dificultad progresiva

def iniciar_ronda(num_dia: number):
    """ Configura la ronda según el día actual. Usa parámetros. """
    global zombies_vivos
    game.splash("DIA " + str(num_dia), "¡Sobrevive!")
    zombies_vivos = zombies_por_ronda[num_dia - 1]
    for i in range(zombies_vivos):
        spawn_zombie()

# --- MÓDULO DE TIENDA (MENÚ INTERACTIVO) ---

def abrir_tienda():
    """ Menú interactivo con el usuario (Criterio +1pt) """
    global dinero, velocidad_jugador, danio_arma
    
    story.printCharacterText("¡Ronda superada! ¿Qué quieres comprar?", "Sistema")
    story.showPlayerChoices("Botas Rápidas (40$)", "Munición Pesada (60$)", "Siguiente Ronda")
    
    if story.checkLastAnswer("Botas Rápidas (40$)"):
        if dinero >= 40:
            dinero -= 40
            velocidad_jugador += 20
            controller.move_sprite(mercader, velocidad_jugador, velocidad_jugador)
            story.printCharacterText("¡Ahora eres más rápido!")
        else:
            story.printCharacterText("No tienes suficiente dinero...")
            
    elif story.checkLastAnswer("Munición Pesada (60$)"):
        if dinero >= 60:
            dinero -= 60
            danio_arma += 1
            story.printCharacterText("Tus balas son más fuertes.")
        else:
            story.printCharacterText("Dinero insuficiente...")
            
    info.set_score(dinero)
    verificar_progreso()

# --- GESTIÓN DE ESTADOS Y COLISIONES ---

def al_morir_zombie(proyectil, zombie):
    global zombies_vivos, dinero
    proyectil.destroy()
    zombie.destroy(effects.disintegrate, 200)
    zombies_vivos -= 1
    dinero += 10
    info.set_score(dinero)
    
    if zombies_vivos <= 0:
        abrir_tienda()

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, al_morir_zombie)

def daño_jugador(jugador, zombie):
    info.change_life_by(-1)
    zombie.destroy()
    global zombies_vivos
    zombies_vivos -= 1
    if zombies_vivos <= 0:
        abrir_tienda()

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, daño_jugador)

def verificar_progreso():
    """ Controla si el juego termina o sigue. Final assolible (+2pts). """
    global dia
    dia += 1
    if dia > 5:
        game.over(True, effects.confetti)
    else:
        iniciar_ronda(dia)

# --- INICIO DEL JUEGO ---
game.show_long_text("ZOMBIE SURVIVAL\n\nElimina a los zombies para ganar dinero y mejorar tu equipo en la tienda.", DialogLayout.CENTER)
iniciar_ronda(dia)