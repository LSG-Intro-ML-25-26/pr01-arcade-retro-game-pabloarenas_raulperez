# ==============================================================================
# PROYECTO: LA CABAÑA - NOCHE ETERNA (VERSIÓN 100% COMPATIBLE)
# ==============================================================================

class GameData:
    def __init__(self):
        self.ronda = 1
        self.oro = 0
        self.vivos = 0
        self.velocidad = 100
        self.tiene_escudo = False
        self.invulnerable = False
        self.lore = [
            "Noche 1: Papa no ha vuelto. Solo me queda su viejo revolver.",
            "Noche 2: He visto sombras caminar en dos patas. No son lobos...",
            "Noche 3: Un mercader paso por la cabaña. Compre suministros.",
            "Noche 4: El bosque entero ruge. Intentan entrar por las ventanas.",
            "Noche 5: Es el final. Si aguanto hasta el alba, sere libre."
        ]
        self.dificultad = [4, 8, 12, 16, 22]

juego = GameData()

# --- FUNCIONES DE PERSISTENCIA ---
def gestionar_records(puntuacion_final: number):
    tops = settings.read_number_array("tops_v4")
    if not tops:
        tops = []
    
    tops.push(puntuacion_final)
    
    for i in range(len(tops)):
        for j in range(len(tops) - 1):
            if tops[j] < tops[j+1]:
                temp = tops[j]
                tops[j] = tops[j+1]
                tops[j+1] = temp
    
    if len(tops) > 3:
        tops.remove_at(3)
    
    settings.write_number_array("tops_v4", tops)

def mostrar_menu_records():
    scene.set_background_color(15)
    tops = settings.read_number_array("tops_v4")
    
    msg = "--- MEJORES PARTIDAS ---\n"
    if tops and len(tops) > 0:
        for i in range(len(tops)):
            msg += str(i+1) + ". " + str(tops[i]) + " Oro\n"
    else:
        msg += "Sin registros todavia."
    
    game.show_long_text(msg, DialogLayout.CENTER)
    menu_principal()

# --- JUGABILIDAD ---
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

barra_escudo = statusbars.create(20, 4, StatusBarKind.energy)
barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
barra_escudo.set_color(9, 2)

def iniciar_noche(n: number):
    scene.set_background_color(15)
    protagonista.set_flag(SpriteFlag.INVISIBLE, True)
    
    indice = n - 1
    if indice < len(juego.lore):
        game.show_long_text(juego.lore[indice], DialogLayout.CENTER)
    
    tiles.set_current_tilemap(assets.tilemap("""mapa"""))
    scene.camera_follow_sprite(protagonista)
    protagonista.set_flag(SpriteFlag.INVISIBLE, False)
    
    juego.vivos = juego.dificultad[n-1]
    for i in range(juego.vivos):
        crear_enemigo()

def crear_enemigo():
    enemigo = sprites.create(img("""
        . . . . 5 5 . .
        . . . 5 f f 5 .
        . . . d d d d .
    """), SpriteKind.enemy)
    tiles.place_on_tile(enemigo, tiles.get_tile_location(randint(1, 20), randint(1, 20)))
    enemigo.follow(protagonista, 30 + (juego.ronda * 5))

def abrir_tienda():
    scene.set_background_color(15)
    while True:
        game.show_long_text("MERCADER - ORO: " + str(juego.oro), DialogLayout.BOTTOM)
        story.show_player_choices("Escudo (30g)", "Botas (20g)", "Continuar")
        
        if story.check_last_answer("Continuar"):
            break
        elif story.check_last_answer("Escudo (30g)") and juego.oro >= 30:
            juego.oro -= 30
            juego.tiene_escudo = True
            barra_escudo.value = 3
            barra_escudo.max = 3
            barra_escudo.attach_to_sprite(protagonista, -4, 0)
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, False)
        elif story.check_last_answer("Botas (20g)") and juego.oro >= 20:
            juego.oro -= 20
            juego.velocidad = 150
            
    info.set_score(juego.oro)
    controller.move_sprite(protagonista, juego.velocidad, juego.velocidad)
    juego.ronda += 1
    if juego.ronda <= 5:
        iniciar_noche(juego.ronda)
    else:
        gestionar_records(juego.oro)
        game.over(True)

# --- SOLUCIÓN A LOS ERRORES DE SPRITEFLAG Y LAMBDA ---
def disparar():
    if not (protagonista.flags & SpriteFlag.INVISIBLE):
        proj = sprites.create_projectile_from_sprite(img("""
            . . . . . . . .
            . . 5 5 5 5 . .
            . . . . . . . .
        """), protagonista, 150, 0)
        music.pew_pew.play()

# Sustitución de lambda por función normal
controller.A.on_event(ControllerButtonEvent.PRESSED, disparar)

def enemigo_derrotado(p, e):
    p.destroy()
    e.destroy(effects.disintegrate, 200)
    juego.vivos -= 1
    juego.oro += 10
    info.set_score(juego.oro)
    if juego.vivos <= 0:
        abrir_tienda()

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, enemigo_derrotado)

def dano_jugador(p, e):
    if juego.invulnerable:
        return

    e.destroy()
    juego.vivos -= 1
    
    if juego.tiene_escudo and barra_escudo.value > 0:
        barra_escudo.value -= 1
        music.ba_ding.play()
        # Invulnerabilidad mediante parpadeo (sin usar GHOST_THROUGH_ENEMIES)
        juego.invulnerable = True
        # El efecto de parpadeo visual ayuda a la durabilidad
        protagonista.set_stay_in_screen(True)
        pause(500)
        juego.invulnerable = False
        
        if barra_escudo.value <= 0:
            juego.tiene_escudo = False
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
    else:
        info.change_life_by(-1)
        scene.camera_shake(4, 500)
    
    if juego.vivos <= 0:
        abrir_tienda()

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, dano_jugador)

def finalizar_partida():
    gestionar_records(juego.oro)
    game.over(False)

# Sustitución de lambda por función normal
info.on_life_zero(finalizar_partida)

def menu_principal():
    scene.set_background_color(15)
    game.splash("LA CABANA", "NOCHE ETERNA")
    story.show_player_choices("JUGAR", "RECORDS")
    
    if story.check_last_answer("JUGAR"):
        info.set_life(3)
        info.set_score(0)
        juego.ronda = 1
        juego.oro = 0
        controller.move_sprite(protagonista, juego.velocidad, juego.velocidad)
        iniciar_noche(1)
    else:
        mostrar_menu_records()

menu_principal()