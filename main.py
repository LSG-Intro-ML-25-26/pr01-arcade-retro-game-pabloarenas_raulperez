# ==========================================
# PROYECTO: LA CABAÑA - NOCHE ETERNA
# ==========================================

# --- VARIABLES GLOBALES ---
ronda = 1
vivos = 0
oro = 50
dificultad = [5, 10, 15, 20, 30]

# Variables de objetos temporales
velocidad_base = 100
velocidad_actual = 100
tiene_escudo = False

# --- LORE (HISTORIA DIARIA) ---
diario_de_la_nina = [
    "Día 1: Papá se fue a buscar ayuda hace una semana... La cabaña cruje. He encontrado su viejo revólver.",
    "Día 2: No son animales. Anoche los vi caminar en dos patas. Rasguñan las paredes. Tengo que proteger mi hogar.",
    "Día 3: El miedo no me deja dormir. He encontrado provisiones viejas, pero necesito más. Un extraño mercader ha pasado por aquí...",
    "Día 4: ¡Están furiosos! Golpean las ventanas. Sus gritos suenan como niños llorando... Sé que vienen a por mí.",
    "Día 5: Es el final. El bosque entero ruge. Si sobrevivo a esta noche, saldré de aquí al amanecer. ¡Venid a por mí!"
]

# --- BARRA DE ESCUDO ---
barra_escudo = statusbars.create(20, 4, StatusBarKind.Energy)
barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
barra_escudo.set_bar_border(1, 15)
barra_escudo.set_color(8, 2)

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

# --- CONFIGURACIÓN VISUAL (ESTILO DE TEXTO) ---

def configurar_dialogo_blanco():
    # Caja blanca con borde negro
    caja_estilo = img("""
        f f f f f f f f f f f f f f f f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 f
        f f f f f f f f f f f f f f f f
    """)
    game.set_dialog_frame(caja_estilo)
    game.set_dialog_text_color(15) # Texto negro

# --- MAPA Y OBJETOS ---

def cargar_mapa():
    tiles.set_current_tilemap(assets.tilemap("""mapa"""))
    scene.camera_follow_sprite(protagonista)

def generar_items_random():
    mis_imagenes = [
        assets.image("""miImagen"""),
        assets.image("""miImagen1"""),
        assets.image("""miImagen2""")
    ]
    mis_cantidades = [1, 10, 10]
    
    for i in range(len(mis_imagenes)):
        img_actual = mis_imagenes[i]
        cantidad_actual = mis_cantidades[i]
        
        for j in range(cantidad_actual):
            item = sprites.create(img_actual, SpriteKind.Food)
            posicion_encontrada = False
            while not posicion_encontrada:
                col = randint(1, 20)
                fil = randint(1, 20)
                ubicacion = tiles.get_tile_location(col, fil)
                if not tiles.tile_at_location_is_wall(ubicacion):
                    tiles.place_on_tile(item, ubicacion)
                    posicion_encontrada = True

# --- SISTEMA DE GESTIÓN DE OBJETOS ---

def resetear_objetos_temporales():
    global velocidad_actual, tiene_escudo
    
    game.show_long_text("El sol sale...\nTus mejoras se han roto.", DialogLayout.CENTER)
    
    velocidad_actual = velocidad_base
    controller.move_sprite(protagonista, velocidad_actual, velocidad_actual)
    
    barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
    tiene_escudo = False

def activar_escudo():
    global tiene_escudo
    tiene_escudo = True
    barra_escudo.value = 3
    barra_escudo.max = 3
    barra_escudo.attach_to_sprite(protagonista, -4, 0)
    barra_escudo.set_flag(SpriteFlag.INVISIBLE, False)

# --- SISTEMA DE TEXTO Y LORE ---

def mostrar_historia_dia(n):
    # Fondo negro y ocultar personaje para modo cine
    scene.set_background_color(15)
    protagonista.set_flag(SpriteFlag.INVISIBLE, True)
    
    indice = n - 1
    if indice < len(diario_de_la_nina):
        game.show_long_text(diario_de_la_nina[indice], DialogLayout.CENTER)
    else:
        game.show_long_text("Día " + str(n) + ": Sobrevive...", DialogLayout.CENTER)
    
    # Volver al juego
    cargar_mapa()
    protagonista.set_flag(SpriteFlag.INVISIBLE, False)

def iniciar_juego():
    configurar_dialogo_blanco()
    scene.set_background_color(15)
    pause(500)
    
    game.splash("LA CABAÑA", "NOCHE ETERNA")
    game.show_long_text("Estás sola en el bosque.\nTu cabaña es tu refugio.\nSobrevive 5 noches.", DialogLayout.CENTER)
    
    cargar_mapa()
    generar_items_random()

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
    
    spawn_valido = False
    while not spawn_valido:
        col = randint(1, 20)
        fil = randint(1, 20)
        loc = tiles.get_tile_location(col, fil)
        if not tiles.tile_at_location_is_wall(loc):
            tiles.place_on_tile(z, loc)
            if abs(z.x - protagonista.x) > 40:
                spawn_valido = True
    z.follow(protagonista, 30 + (ronda * 3))

def nueva_ronda(n: number):
    global vivos
    mostrar_historia_dia(n)
    vivos = dificultad[n - 1]
    for i in range(vivos):
        spawn()

# --- TIENDA AVANZADA ---

def tienda():
    global oro, velocidad_actual
    scene.camera_follow_sprite(None)
    scene.set_background_color(15)
    
    resetear_objetos_temporales()
    
    compra_terminada = False
    
    while not compra_terminada:
        game.show_long_text("MERCADER:\n'¿Que necesitas?'\n\nORO: " + str(oro), DialogLayout.CENTER)
        
        story.show_player_choices(
            "Escudo (30g)",
            "Botas Temp (20g)",
            "Vida +1 (50g)",
            "Siguiente Noche"
        )
        
        if story.check_last_answer("Siguiente Noche"):
            compra_terminada = True
            
        elif story.check_last_answer("Escudo (30g)"):
            if oro >= 30:
                if not tiene_escudo:
                    oro -= 30
                    activar_escudo()
                    game.show_long_text("Compraste un escudo.", DialogLayout.CENTER)
                else:
                    game.show_long_text("Ya tienes escudo.", DialogLayout.CENTER)
            else:
                game.show_long_text("No tienes oro.", DialogLayout.CENTER)
                
        elif story.check_last_answer("Botas Temp (20g)"):
            if oro >= 20:
                if velocidad_actual == velocidad_base:
                    oro -= 20
                    velocidad_actual += 40
                    controller.move_sprite(protagonista, velocidad_actual, velocidad_actual)
                    game.show_long_text("Corres más rápido.", DialogLayout.CENTER)
                else:
                    game.show_long_text("Ya llevas botas.", DialogLayout.CENTER)
            else:
                game.show_long_text("Necesitas más oro.", DialogLayout.CENTER)

        elif story.check_last_answer("Vida +1 (50g)"):
            if oro >= 50:
                oro -= 50
                info.change_life_by(1)
                music.power_up.play()
                game.show_long_text("Salud recuperada.", DialogLayout.CENTER)
            else:
                game.show_long_text("Demasiado caro.", DialogLayout.CENTER)
                
        info.set_score(oro)

    cargar_mapa()
    proximo_paso()

# --- COLISIONES ---

# IMPORTANTE: Aquí he añadido ": Sprite" para arreglar el error.
def muerte_enemigo(b: Sprite, e: Sprite):
    global vivos, oro
    b.destroy()
    e.destroy(effects.disintegrate, 200)
    vivos -= 1
    oro += 10
    info.set_score(oro)
    if vivos <= 0: tienda()

sprites.on_overlap(SpriteKind.projectile, SpriteKind.enemy, muerte_enemigo)

# IMPORTANTE: Aquí he añadido ": Sprite" para arreglar el error.
def choque(p: Sprite, e: Sprite):
    global vivos, tiene_escudo
    e.destroy()
    vivos -= 1
    
    if tiene_escudo and barra_escudo.value > 0:
        barra_escudo.value -= 1
        music.big_crash.play()
        scene.camera_shake(2, 200)
        if barra_escudo.value <= 0:
            barra_escudo.set_flag(SpriteFlag.INVISIBLE, True)
            tiene_escudo = False
            music.wawawawaa.play()
    else:
        info.change_life_by(-1)
        scene.camera_shake(4, 500)

    if vivos <= 0: tienda()

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, choque)

def proximo_paso():
    global ronda
    ronda += 1
    if ronda > 5:
        scene.set_background_color(15)
        game.show_long_text("¡AMANECER!\nHas sobrevivido.\nFin del juego.", DialogLayout.CENTER)
        game.over(True)
    else:
        nueva_ronda(ronda)

# --- INICIO ---
controller.move_sprite(protagonista, velocidad_actual, velocidad_actual)
info.set_score(oro)
info.set_life(3)

iniciar_juego()
nueva_ronda(ronda)