# --- VARIABLES GLOBALES ---
dinero = 50
caos = 0
dia = 1
# Estados: 0=Tienda, 1=Sotano, 2=Plaza
ubicacion_actual = 0

# Crear al Mercader
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
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
"""), SpriteKind.player)
controller.move_sprite(mercader)
scene.camera_follow_sprite(mercader)

# Mostrar Dinero
info.set_score(dinero)

# --- CONFIGURACIÓN DE MAPAS ---
def cargar_tienda():
    global ubicacion_actual
    ubicacion_actual = 0
    # IMPORTANTE: Aquí la Persona 1 (Arte) debe dibujar la tienda en el editor visual
    # Pon baldosas de suelo y PAREDES rojas alrededor
    tiles.set_current_tilemap(tilemap("""level1"""))
    scene.set_background_color(6) # Color suelo
    mercader.set_position(80, 60)

def cargar_sotano():
    global ubicacion_actual
    ubicacion_actual = 1
    # La Persona 1 debe dibujar un mapa oscuro aquí
    tiles.set_current_tilemap(tilemap("""level2"""))
    scene.set_background_color(15) # Negro
    mercader.set_position(20, 20)

# Cargar primer mapa
cargar_tienda()

# --- SISTEMA DE CLIENTES (LORE) ---
def generar_cliente():
    # Solo aparecen clientes si estamos en la tienda
    if ubicacion_actual == 0:
        cliente = sprites.create(img("""
            . . . . . . . . . . . . . . . .
            . . . . . . 5 5 . . . . . . . .
            . . . . . 5 5 5 5 . . . . . . .
            . . . . . 5 f f 5 . . . . . . .
            . . . . . 5 f f 5 . . . . . . .
            . . . . . 5 5 5 5 . . . . . . .
            . . . . . . 5 5 . . . . . . . .
            . . . . . d d d d . . . . . . .
            . . . . . d d d d . . . . . . .
            . . . . . d . . d . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        """), SpriteKind.enemy)
        # Aparece en la puerta (ajustar coordenadas según tu dibujo)
        cliente.set_position(80, 10)
        cliente.follow(mercader, 30)

# Generar un cliente cada 7 segundos
game.on_update_interval(7000, generar_cliente)

# --- INTERACCIÓN Y VENTAS ---
def on_overlap_cliente(sprite, otherSprite):
    global dinero, caos
    
    # Detener movimiento para hablar
    otherSprite.follow(None)
    
    # Diálogo de Lore usando la extensión Story
    story.print_character_text("Necesito armas...", "Cliente")
    
    # Opciones
    story.show_player_choices("Espada (10$)", "Daga Maldita (50$)", "Echarlo")
    
    if story.check_last_answer("Espada (10$)"):
        dinero += 10
        caos -= 1
        story.print_character_text("Gracias, servirá.", "Cliente")
    elif story.check_last_answer("Daga Maldita (50$)"):
        dinero += 50
        caos += 5 # SUBE EL CAOS
        story.print_character_text("Jejeje... poder ilimitado.", "Cliente")
        scene.camera_shake(4, 500)
    else:
        story.print_character_text("¡Bah! Me voy.", "Cliente")
        
    # Actualizar marcador y borrar cliente
    info.set_score(dinero)
    otherSprite.destroy(effects.disintegrate, 500)

sprites.on_overlap(SpriteKind.player, SpriteKind.enemy, on_overlap_cliente)

# --- NOTICIAS AL FINAL DEL DÍA ---
def ciclo_dia():
    global dia, caos
    dia += 1
    
    # Texto de noticias
    game.show_long_text("DÍA " + str(dia) + " COMPLETADO.", DialogLayout.CENTER)
    
    if caos > 20:
        game.show_long_text("NOTICIA URGENTE: ¡Ataques en el reino! Se dice que el mercader vende armas malditas...", DialogLayout.FULL)
    elif caos < 0:
        game.show_long_text("NOTICIA: Tiempos de paz. La cosecha es buena.", DialogLayout.FULL)
    else:
        game.show_long_text("NOTICIA: Todo tranquilo por ahora.", DialogLayout.FULL)

# El día dura 30 segundos
game.on_update_interval(30000, ciclo_dia)

# --- CAMBIO DE MAPAS (Simulado con botones A y B por ahora) ---
# Programador: Cambia esto por colisión con escaleras más tarde
def cambiar_zona_a():
    cargar_tienda()
    story.print_character_text("Has entrado en la TIENDA")
controller.A.on_event(ControllerButtonEvent.PRESSED, cambiar_zona_a)

def cambiar_zona_b():
    cargar_sotano()
    story.print_character_text("Has bajado al SÓTANO")
controller.B.on_event(ControllerButtonEvent.PRESSED, cambiar_zona_b)