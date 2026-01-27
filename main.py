# ==========================================
# PROYECTO: Zombie Survival Merchant
# ==========================================

# --- VARIABLES ---
ronda = 1
vivos = 0
oro = 50
velocidad = 100
dificultad = [5, 10, 15, 20, 30]

# --- SPRITE DEL JUGADOR ---
protagonista = sprites.create(img("""
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
"""), SpriteKind.player)
protagonista.set_flag(SpriteFlag.INVISIBLE, True)

# --- MAPA (Usando tu asset 'mapa') ---

def cargar_mapa():
    # Carga tu tilemap llamado "mapa"
    tiles.set_current_tilemap(assets.tilemap("""mapa"""))
    
    # Hacemos que la cámara siga al jugador
    scene.camera_follow_sprite(protagonista)

# --- SISTEMA DE TEXTO ---

def iniciar_historia():
    game.set_dialog_frame(None)
    scene.set_background_color(15)
    pause(200)

    game.splash("ZOMBIE SURVIVAL", "MERCHANT")
    game.splash("HISTORIA:", "Eres el ultimo mercader.\nProtege tu stock.")
    game.splash("MISION: Mata zombies,", "gana oro y mejora.")
    game.splash("OBJETIVO FINAL:", "SOBREVIVE 5 DIAS")
    
    # Cargamos el mapa y mostramos al jugador
    cargar_mapa()
    protagonista.set_flag(SpriteFlag.INVISIBLE, False)

# --- ACCIÓN ---

def disparar():
    if not (protagonista.flags & SpriteFlag.INVISIBLE):
        p = sprites.create_projectile_from_sprite(img("""
            . . . . . . . .
            . . 5 5 5 5 . .
            . . . . . . . .
        """), protagonista, 150, 0)
        music.pew_pew.play()

controller.A.on_event(ControllerButtonEvent.PRESSED, disparar)

def spawn():
    global vivos
    z = sprites.create(img("""
        . . . . 5 5 . .
        . . . 5 f f 5 .
        . . . d d d d .
    """), SpriteKind.enemy)
    
    # --- AJUSTE DE TAMAÑO ---
    # Como las funciones automáticas fallaban, definimos el área manualmente.
    # Si tu mapa es muy grande, aumenta estos números (ej. 500, 1000).
    ancho_zona = 250
    alto_zona = 250
    
    z.set_position(randint(10, ancho_zona), randint(10, alto_zona))
    
    # Si aparecen muy cerca del jugador, los movemos para evitar daño injusto
    if abs(z.x - protagonista.x) < 40:
        z.x += 60
        
    z.follow(protagonista, 30 + (ronda * 3))

def nueva_ronda(n: number):
    global vivos
    game.splash("DIA " + str(n))
    vivos = dificultad[n - 1]
    for i in range(vivos):
        spawn()

# --- TIENDA Y AVANCE ---

def tienda():
    global oro, velocidad
    # Pausamos el seguimiento de cámara momentáneamente
    scene.camera_follow_sprite(None)
    scene.set_background_color(15)
    
    story.show_player_choices("Botas (+Vel)", "Continuar")
    if story.check_last_answer("Botas (+Vel)") and oro >= 40:
        oro -= 40
        velocidad += 20
        controller.move_sprite(protagonista, velocidad, velocidad)
    
    info.set_score(oro)
    # Al salir, recargamos mapa y cámara
    cargar_mapa()
    proximo_paso()

def muerte_enemigo(b, e):
    global vivos, oro
    b.destroy()
    e.destroy(effects.disintegrate, 200)
    vivos -= 1
    oro += 10
    info.set_score(oro)
    if vivos <= 0: tienda()

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, muerte_enemigo)

def choque(p, e):
    info.change_life_by(-1)
    e.destroy()
    global vivos
    vivos -= 1
    if vivos <= 0: tienda()

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, choque)

def proximo_paso():
    global ronda
    ronda += 1
    if ronda > 5: game.over(True)
    else: nueva_ronda(ronda)

# --- INICIO ---
controller.move_sprite(protagonista, velocidad, velocidad)
info.set_score(oro)
info.set_life(3)

iniciar_historia()
nueva_ronda(ronda)