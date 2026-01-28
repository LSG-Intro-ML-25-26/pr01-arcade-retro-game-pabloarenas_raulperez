# ==============================================================================
# PROYECTO: LA CABAÑA - NOCHE ETERNA (VERSIÓN FINAL CORREGIDA)
# ==============================================================================

class GameData:
    def __init__(self):
        self.reiniciar()

    def reiniciar(self):
        self.ronda = 1
        self.oro = 0
        self.puntos = 0
        self.vivos = 0
        self.velocidad = 70
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

# --- PERSISTENCIA (RECORDS) ---
def gestionar_records(puntos_finales: number):
    tops = settings.read_number_array("records_vfinal")
    if not tops:
        tops = []
    tops.push(puntos_finales)
    for i in range(len(tops)):
        for j in range(len(tops) - 1):
            if tops[j] < tops[j+1]:
                temp = tops[j]
                tops[j] = tops[j+1]
                tops[j+1] = temp
    if len(tops) > 3:
        tops.remove_at(3)
    settings.write_number_array("records_vfinal", tops)

def mostrar_menu_records():
    scene.set_background_color(15)
    tops = settings.read_number_array("records_vfinal")
    msg = "TOP CAZADORES\n==============\n"
    if tops and len(tops) > 0:
        for i in range(len(tops)):
            msg += str(i+1) + ". " + str(tops[i]) + " PTS\n\n"
    else:
        msg += "\nSin registros todavia."
    game.show_long_text(msg, DialogLayout.CENTER)
    menu_principal()

# --- SPRITES ---
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

# --- DISPARO ---
def disparar():
    if not (protagonista.flags & SpriteFlag.INVISIBLE):
        vx = controller.dx() * 80
        vy = controller.dy() * 80
        if vx == 0 and vy == 0:
            vx = 80
            vy = 0
        bala = sprites.create_projectile_from_sprite(img("""
            . . 5 . .
            . 5 4 5 .
            5 4 4 4 5
            . 5 4 5 .
            . . 5 . .
        """), protagonista, vx, vy)
        music.pew_pew.play()

controller.A.on_event(ControllerButtonEvent.PRESSED, disparar)

# --- TIENDA ---
def abrir_tienda():
    if info.life() <= 0:
        return
    
    # Limpiamos proyectiles sueltos para evitar ruidos
    for b in sprites.all_of_kind(SpriteKind.projectile):
        b.destroy()

    scene.set_background_color(15)
    while True:
        game.show_long_text("ORO: " + str(juego.oro), DialogLayout.BOTTOM)
        story.show_player_choices("Medikit (15g)", "Escudo (30g)", "Botas (20g)", "Siguiente Noche")
        if story.check_last_answer("Siguiente Noche"):
            break
        elif story.check_last_answer("Medikit (15g)"):
            if juego.oro >= 15:
                if info.life() < 3:
                    juego.oro -= 15
                    info.change_life_by(1)
                    music.power_up.play()
                else:
                    game.show_long_text("Vida al maximo", DialogLayout.BOTTOM)
            else:
                game.show_long_text("Oro insuficiente", DialogLayout.BOTTOM)
        elif story.check_last_answer("Escudo (30g)"):
            if juego.oro >= 30:
                juego.oro -= 30
                juego.tiene_escudo = True
                barra_escudo.value = 3
                barra_escudo.max = 3
                barra_escudo.attach_to_sprite(protagonista, -4, 0)
                barra_escudo.set_flag(SpriteFlag.INVISIBLE, False)
            else:
                game.show_long_text("Oro insuficiente", DialogLayout.BOTTOM)
        elif story.check_last_answer("Botas (20g)"):
            if juego.oro >= 20:
                juego.oro -= 20
                juego.velocidad = 150
            else:
                game.show_long_text("Oro insuficiente", DialogLayout.BOTTOM)
            
    info.set_score(juego.puntos)
    controller.move_sprite(protagonista, juego.velocidad, juego.velocidad)
    juego.ronda += 1
    if juego.ronda <= 5:
        iniciar_noche(juego.ronda)
    else:
        gestionar_records(juego.puntos)
        game.over(True)

# --- LÓGICA DE COMBATE ---
def dano_jugador(p, e):
    if juego.invulnerable:
        return
    e.destroy()
    juego.vivos -= 1
    if juego.tiene_escudo and barra_escudo.value > 0:
        barra_escudo.value -= 1
        music.ba_ding.play()
        juego.invulnerable = True
        pause(500)
        juego.invulnerable = False
        if barra_escudo.value <= 0:
            juego.tiene_escudo = False
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
    else:
        info.change_life_by(-1)
        scene.camera_shake(4, 500)
    
    # Comprobación de fin de noche tras daño
    if info.life() > 0 and juego.vivos <= 0:
        pause(500) # Pausa para que el jugador respire
        abrir_tienda()

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, dano_jugador)

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

def enemigo_derrotado(p, e):
    # Destruimos la bala y el enemigo inmediatamente
    p.destroy()
    e.destroy(effects.disintegrate, 200)
    # Solo restamos de vivos si el enemigo aún no había sido contado
    juego.vivos -= 1
    juego.oro += 10
    juego.puntos += 100
    info.set_score(juego.puntos)
    
    # Verificación estricta: si ya no quedan vivos, saltar a tienda
    if juego.vivos <= 0 and info.life() > 0:
        pause(500) # Pequeño delay para que se vea la muerte del último
        abrir_tienda()

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, enemigo_derrotado)

def al_morir():
    gestionar_records(juego.puntos)
    game.over(False)

info.on_life_zero(al_morir)

def menu_principal():
    scene.set_background_color(15)
    game.splash("LA CABANA", "NOCHE ETERNA")
    story.show_player_choices("JUGAR", "RECORDS")
    if story.check_last_answer("JUGAR"):
        info.set_life(3)
        info.set_score(0)
        juego.reiniciar()
        controller.move_sprite(protagonista, juego.velocidad, juego.velocidad)
        iniciar_noche(1)
    else:
        mostrar_menu_records()

menu_principal()