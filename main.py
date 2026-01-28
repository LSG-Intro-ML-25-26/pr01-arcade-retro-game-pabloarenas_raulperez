# ==============================================================================
# PROYECTO: EL BOSQUE SUSURRANTE - VERSIÓN FINAL (MÁXIMA COMPATIBILIDAD)
# ==============================================================================

KIND_BOSS = SpriteKind.create()
KIND_DECO = SpriteKind.create()

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
        self.boss_creado = False
        self.animacion_actual = ""
        self.lore = [
            "NOCHE 1: Mi avioneta cayo...",
            "NOCHE 2: El frio cala mis huesos...",
            "NOCHE 3: El helicoptero llegara al amanecer. ¡Resiste!"
        ]

juego = GameData()

# --- JUGADOR Y BARRA AMARILLA ---
protagonista = sprites.create(assets.image("""player-standing"""), SpriteKind.player)
protagonista.set_flag(SpriteFlag.INVISIBLE, True)

barra_escudo = statusbars.create(20, 4, StatusBarKind.magic)
barra_escudo.set_color(5, 1)
barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)

# --- SISTEMA DE ANIMACIÓN Y BARRA ---
def controlar_animaciones_jugador():
    if not juego.juego_activo or juego.en_tienda: return
    if protagonista.vx > 0:
        if juego.animacion_actual != "der":
            juego.animacion_actual = "der"
            animation.run_image_animation(protagonista, assets.animation("""player-moving-right"""), 100, True)
    elif protagonista.vx < 0:
        if juego.animacion_actual != "izq":
            juego.animacion_actual = "izq"
            animation.run_image_animation(protagonista, assets.animation("""player-moving-left"""), 100, True)
    elif protagonista.vy > 0:
        if juego.animacion_actual != "aba":
            juego.animacion_actual = "aba"
            animation.run_image_animation(protagonista, assets.animation("""player-moving-down"""), 100, True)
    elif protagonista.vy < 0:
        if juego.animacion_actual != "arr":
            juego.animacion_actual = "arr"
            animation.run_image_animation(protagonista, assets.animation("""player-moving-up"""), 100, True)
    else:
        if juego.animacion_actual != "parado":
            juego.animacion_actual = "parado"
            animation.stop_animation(animation.AnimationTypes.ALL, protagonista)
            protagonista.set_image(assets.image("""player-standing"""))

def actualizar_interfaz():
    if juego.juego_activo and juego.tiene_escudo:
        barra_escudo.set_flag(SpriteFlag.INVISIBLE, False)
        barra_escudo.attach_to_sprite(protagonista, 2, 0)
    else:
        barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)

def on_update_juego():
    controlar_animaciones_jugador()
    actualizar_interfaz()

game.on_update(on_update_juego)

# --- TIENDA ---
def abrir_tienda():
    juego.juego_activo = False
    juego.en_tienda = True
    for e in sprites.all_of_kind(SpriteKind.enemy): e.destroy()
    for b in sprites.all_of_kind(KIND_BOSS): b.destroy()
    protagonista.set_flag(SpriteFlag.INVISIBLE, True)
    barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
    
    game.show_long_text("ORO: " + str(juego.oro), DialogLayout.BOTTOM)
    story.show_player_choices("Curar (15g)", "Botas (20g)", "Escudo (30g)", "SIGUIENTE NOCHE")
    
    if story.check_last_answer("SIGUIENTE NOCHE"):
        juego.ronda += 1
        iniciar_noche(juego.ronda)
    elif story.check_last_answer("Curar (15g)"):
        if juego.oro >= 15:
            juego.oro -= 15
            info.change_life_by(1)
        abrir_tienda()
    elif story.check_last_answer("Botas (20g)"):
        if juego.oro >= 20:
            juego.oro -= 20
            juego.velocidad = 100
        abrir_tienda()
    elif story.check_last_answer("Escudo (30g)"):
        if juego.oro >= 30:
            juego.oro -= 30
            juego.tiene_escudo = True
            barra_escudo.max = 3
            barra_escudo.value = 3
        abrir_tienda()

# --- DAÑO ---
def procesar_daño(p, e):
    if juego.invulnerable: return
    if e.kind() == SpriteKind.enemy: e.destroy()
    
    if juego.tiene_escudo and barra_escudo.value > 0:
        barra_escudo.value -= 1
        if barra_escudo.value <= 0:
            juego.tiene_escudo = False
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
            protagonista.say_text("¡ESCUDO ROTO!", 1000)
            music.big_crash.play()
    else:
        info.change_life_by(-1)
    
    juego.invulnerable = True
    pause(1000)
    juego.invulnerable = False

# --- SPAWN Y BOSS ---
def crear_boss():
    juego.boss_creado = True
    boss = sprites.create(assets.image("""fantasma"""), KIND_BOSS)
    boss.set_scale(3, ScaleAnchor.MIDDLE)
    boss.set_position(protagonista.x + 100, protagonista.y)
    boss.follow(protagonista, 25)
    hp = statusbars.create(40, 4, StatusBarKind.health)
    hp.attach_to_sprite(boss, 5)
    hp.max = 20
    hp.value = 20

def spawn_seguro():
    if not juego.juego_activo or juego.en_tienda: return
    if juego.ronda == 3 and juego.monstruos_restantes <= 5 and not juego.boss_creado:
        crear_boss()
        return
    if len(sprites.all_of_kind(SpriteKind.enemy)) < 6:
        en = sprites.create(assets.image("""fantasma"""), SpriteKind.enemy)
        if Math.percent_chance(50):
            en.x = protagonista.x + Math.pick_random([80, -80])
            en.y = protagonista.y + randint(-60, 60)
        else:
            en.x = protagonista.x + randint(-80, 80)
            en.y = protagonista.y + Math.pick_random([60, -60])
        en.follow(protagonista, 35 + (juego.ronda * 5))

game.on_update_interval(2500, spawn_seguro)

# --- DECORACIÓN: BOSQUE TOTAL ---
def colocar_arboles_aleatorios():
    tipos_arboles = [assets.image("""arbol1"""), assets.image("""arbol2""")]
    
    # Valores fijos que funcionan en mapas grandes
    ancho_total = 400
    alto_total = 400

    for dibujo_arbol in tipos_arboles:
        for i in range(12): # 24 árboles en total
            arbol = sprites.create(dibujo_arbol, KIND_DECO)
            arbol.x = randint(10, ancho_total)
            arbol.y = randint(10, alto_total)
            
            # Evitar zona de spawn inicial (80, 60)
            if abs(arbol.x - 80) < 40 and abs(arbol.y - 60) < 40:
                arbol.x += 60
                
            arbol.z = -1

# --- LÓGICA DE NOCHE ---
def iniciar_noche(n: number):
    juego.en_tienda = False
    juego.boss_creado = False
    for decoracion in sprites.all_of_kind(KIND_DECO):
        decoracion.destroy()
        
    game.show_long_text(juego.lore[n-1], DialogLayout.CENTER)
    tiles.set_current_tilemap(assets.tilemap("""mapa"""))
    
    colocar_arboles_aleatorios()
    
    scene.camera_follow_sprite(protagonista)
    protagonista.set_flag(SpriteFlag.INVISIBLE, False)
    protagonista.set_position(80, 60)
    
    controller.move_sprite(protagonista, juego.velocidad, juego.velocidad)
    juego.monstruos_restantes = 10 + (n-1) * 5
    juego.juego_activo = True

# --- DISPARO ---
def disparar():
    if not juego.juego_activo: return
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

# --- COLISIONES ---
def baja_enemigo(bala, monstruo):
    bala.destroy()
    monstruo.destroy(effects.disintegrate, 200)
    juego.oro += 10
    juego.puntos += 100
    juego.monstruos_restantes -= 1
    info.set_score(juego.puntos)
    if juego.monstruos_restantes <= 0:
        if juego.ronda < 3: abrir_tienda()
        else:
            gestionar_records(juego.puntos)
            game.over(True)

def daño_boss(bala, boss):
    bala.destroy()
    hp = statusbars.get_status_bar_attached_to(StatusBarKind.health, boss)
    if hp:
        hp.value -= 1
        if hp.value <= 0:
            boss.destroy(effects.fire, 500)
            juego.monstruos_restantes = 0
            gestionar_records(juego.puntos)
            game.over(True)

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, baja_enemigo)
sprites.on_overlap(SpriteKind.projectile, KIND_BOSS, daño_boss)
sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, procesar_daño)
sprites.on_overlap(SpriteKind.player, KIND_BOSS, procesar_daño)

# --- RECORDS ---
def gestionar_records(p: number):
    h = settings.read_number_array("hist_v3")
    if h == None:
        h = [0, 0, 0]
        h.remove_at(0)
        h.remove_at(0)
        h.remove_at(0)
    h.insert_at(0, p)
    if len(h) > 3:
        h.remove_at(3)
    settings.write_number_array("hist_v3", h)

def mostrar_menu_records():
    scene.set_background_color(15)
    partidas = settings.read_number_array("hist_v3")
    msg = "EL BOSQUE SUSURRANTE\n"
    msg += "====================\n"
    msg += "ULTIMAS PARTIDAS:\n\n"
    if partidas and len(partidas) > 0:
        for i in range(len(partidas)):
            puntos = partidas[i]
            linea = str(i + 1) + ". " + str(puntos) + " PTS"
            if i == 0: linea += "  <-- NUEVA"
            msg += linea + "\n\n"
    else:
        msg += "No hay registros aun.\n"
    msg += "\n(A) PARA VOLVER"
    game.show_long_text(msg, DialogLayout.FULL)
    menu_principal()

def al_morir():
    gestionar_records(juego.puntos)
    game.over(False)

info.on_life_zero(al_morir)

# --- MENÚ PRINCIPAL ---
def menu_principal():
    scene.set_background_color(15)
    game.splash("EL BOSQUE", "SUSURRANTE")
    story.show_player_choices("JUGAR", "RECORDS")
    if story.check_last_answer("JUGAR"):
        info.set_life(3)
        juego.reiniciar()
        iniciar_noche(1)
    else:
        mostrar_menu_records()

menu_principal()