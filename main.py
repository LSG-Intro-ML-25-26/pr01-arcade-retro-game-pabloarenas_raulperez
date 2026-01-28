# ==============================================================================
# PROYECTO: EL BOSQUE SUSURRANTE - HISTORIAL CORREGIDO (FIX LINEA 35)
# ==============================================================================

class GameData:
    def __init__(self):
        self.reiniciar()

    def reiniciar(self):
        self.ronda = 1
        self.oro = 0
        self.puntos = 0
        self.velocidad = 65
        self.monstruos_restantes = 10
        self.tiene_escudo = False
        self.invulnerable = False
        self.en_tienda = False
        self.juego_activo = False
        self.lore = [
            "NOCHE 1: Mi avioneta cayo en este infierno verde. Solo tengo mi revolver y la esperanza de que vean la señal de humo. Algo se mueve...",
            "NOCHE 2: El rescate no llega. El frio cala mis huesos y los aullidos son cada vez mas humanos. Si muero aqui, nadie me encontrara.",
            "NOCHE 3: Es la ultima radiofrecuencia. El helicoptero llegara al amanecer, pero el bosque entero ha despertado. ¡Resiste!"
        ]

juego = GameData()

# --- HISTORIAL DE PARTIDAS (CORREGIDO PARA MAKECODE) ---
def gestionar_records(puntos_finales: number):
    historial = settings.read_number_array("hist_v3")
    if not historial:
        historial = []
    
    # En MakeCode Arcade se usa insert_at(indice, valor)
    historial.insert_at(0, puntos_finales)
    
    # Y remove_at(indice) para mantener solo 3
    if len(historial) > 3:
        historial.remove_at(3)
    
    settings.write_number_array("hist_v3", historial)

def mostrar_menu_records():
    scene.set_background_color(15)
    partidas = settings.read_number_array("hist_v3")
    msg = "ULTIMAS PARTIDAS\n==============\n"
    
    if partidas and len(partidas) > 0:
        for i in range(len(partidas)):
            label = " (NUEVA)" if i == 0 else ""
            msg += str(i+1) + ". " + str(partidas[i]) + " PTS" + label + "\n\n"
    else:
        msg += "\nNo hay partidas registradas."
    
    game.show_long_text(msg, DialogLayout.CENTER)
    menu_principal()

# --- JUGADOR ---
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
barra_escudo.set_color(9, 1)
barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)

# --- TIENDA ---
def abrir_tienda():
    juego.juego_activo = False
    juego.en_tienda = True
    for e in sprites.all_of_kind(SpriteKind.enemy): e.destroy()
    protagonista.set_flag(SpriteFlag.INVISIBLE, True)
    scene.set_background_color(15)
    game.show_long_text("EL AMANECER TE DA UN RESPIRO\nORO: " + str(juego.oro), DialogLayout.BOTTOM)
    story.show_player_choices("Curar (15g)", "Escudo (30g)", "SIGUIENTE NOCHE")
    if story.check_last_answer("SIGUIENTE NOCHE"):
        juego.ronda += 1
        iniciar_noche(juego.ronda)
    elif story.check_last_answer("Curar (15g)"):
        if juego.oro >= 15 and info.life() < 3:
            juego.oro -= 15
            info.change_life_by(1)
        abrir_tienda()
    elif story.check_last_answer("Escudo (30g)"):
        if juego.oro >= 30:
            juego.oro -= 30
            juego.tiene_escudo = True
            barra_escudo.max = 3
            barra_escudo.value = 3
            barra_escudo.attach_to_sprite(protagonista, -4, 0)
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, False)
        abrir_tienda()

# --- LÓGICA DE NOCHE ---
def iniciar_noche(n: number):
    juego.en_tienda = False
    scene.set_background_color(15)
    game.show_long_text(juego.lore[n-1], DialogLayout.CENTER)
    tiles.set_current_tilemap(assets.tilemap("""mapa"""))
    scene.camera_follow_sprite(protagonista)
    protagonista.set_flag(SpriteFlag.INVISIBLE, False)
    controller.move_sprite(protagonista, juego.velocidad, juego.velocidad)
    if n == 1: juego.monstruos_restantes = 10
    elif n == 2: juego.monstruos_restantes = 15
    else: juego.monstruos_restantes = 20
    juego.juego_activo = True

def crear_enemigo():
    if juego.juego_activo and not juego.en_tienda:
        if len(sprites.all_of_kind(SpriteKind.enemy)) < 6:
            enemigo = sprites.create(img("""
                . . . . 5 5 . .
                . . . 5 f f 5 .
                . . d d d d d d
            """), SpriteKind.enemy)
            enemigo.x = 250 + randint(-60, 60)
            enemigo.y = 250 + randint(-60, 60)
            enemigo.follow(protagonista, 35 + (juego.ronda * 5))

game.on_update_interval(2500, crear_enemigo)

# --- COMBATE ---
def disparar():
    if juego.juego_activo:
        vx = controller.dx() * 110
        vy = controller.dy() * 110
        if vx == 0 and vy == 0: vx = 110
        sprites.create_projectile_from_sprite(img("""
            . . 5 . .
            . 5 4 5 .
            5 4 4 4 5
            . 5 4 5 .
            . . 5 . .
        """), protagonista, vx, vy)
        music.pew_pew.play()

controller.A.on_event(ControllerButtonEvent.PRESSED, disparar)

# --- FINAL ---
def victoria_final():
    juego.juego_activo = False
    for e in sprites.all_of_kind(SpriteKind.enemy): e.destroy()
    scene.set_background_color(15)
    pause(500)
    game.show_long_text("El rescate ha llegado.", DialogLayout.CENTER)
    gestionar_records(juego.puntos)
    game.over(True)

def baja_enemigo(bala, monstruo):
    bala.destroy()
    monstruo.destroy(effects.disintegrate, 200)
    juego.oro += 10
    juego.puntos += 100
    juego.monstruos_restantes -= 1
    info.set_score(juego.puntos)
    if juego.monstruos_restantes <= 0:
        if juego.ronda < 3: abrir_tienda()
        else: victoria_final()

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, baja_enemigo)

def daño_jugador(p, e):
    if juego.invulnerable: return
    e.destroy()
    if juego.tiene_escudo and barra_escudo.value > 0:
        barra_escudo.value -= 1
        if barra_escudo.value <= 0:
            juego.tiene_escudo = False
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
    else: info.change_life_by(-1)
    juego.invulnerable = True
    pause(1000)
    juego.invulnerable = False

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, daño_jugador)

def finalizar_por_muerte():
    gestionar_records(juego.puntos)
    game.over(False)

info.on_life_zero(finalizar_por_muerte)

def menu_principal():
    scene.set_background_color(15)
    game.splash("EL BOSQUE", "SUSURRANTE")
    story.show_player_choices("JUGAR", "RECORDS")
    if story.check_last_answer("JUGAR"):
        info.set_life(3)
        info.set_score(0)
        juego.reiniciar()
        iniciar_noche(1)
    else: mostrar_menu_records()

menu_principal()