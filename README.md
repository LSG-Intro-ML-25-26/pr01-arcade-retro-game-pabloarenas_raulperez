[![Work in MakeCode](https://classroom.github.com/assets/work-in-make-code-8824cc13a1a3f34ffcd245c82f0ae96fdae6b7d554b6539aec3a03a70825519c.svg)](https://classroom.github.com/online_ide?assignment_repo_id=22160191&assignment_repo_type=AssignmentRepo)
 


> Open this page at [https://raimonizard.github.io/makecode-arcade-template-nena-mov/](https://raimonizard.github.io/makecode-arcade-template-nena-mov/)

# 🌲 EL BOSQUE SUSURRANTE - VERSIÓN FINAL

> *Survival Arcade desarrollado en Python con Arcade/MakeCode.*

---

## 👥 Integrantes del Proyecto

Este proyecto ha sido desarrollado por:

* **Pablo Arenas**
* **Raúl Pérez**

---

## 📜 Lore del Juego

**Día 1: El Impacto**
La historia te sitúa en la piel de un piloto superviviente tras un accidente aéreo en una zona desconocida. A través de un diario narrativo, vivirás el descenso a la locura:

> *"Mi avioneta cayó... El frío cala mis huesos... Algo me observa desde la oscuridad."*

El objetivo es sobrevivir **3 noches** (rondas) enfrentándote a los horrores del bosque hasta que despierta el **Espíritu del Bosque**.

---

## 👾 Personajes y Enemigos

A continuación se detallan los elementos principales que encontrarás en el juego:

### 🦸‍♂️ El Piloto (Protagonista)
Es el personaje controlado por el jugador. Cuenta con un sistema de **animaciones dinámicas** (caminar en 4 direcciones) y capacidad de disparo en 8 direcciones.
* **Asset principal:** `player-standing.png`
* **Habilidades:** Disparo, movimiento veloz y uso de escudos.

![Imagen del Piloto]<img width="751" height="751" alt="image" src="https://github.com/user-attachments/assets/05e0f5dd-3320-45dc-a66f-e6ada13bcb67" />


### 👻 Los Espectros (Enemigos)
Son las almas en pena que habitan el bosque. Tienen la capacidad de **atravesar los muros** y persiguen al jugador implacablemente.
* **Asset:** `fantasma.png`
* **Comportamiento:** IA de persecución directa (`follow`).

![Imagen del Enemigo](./assets/fantasma.png)

### 👹 El Espíritu (Jefe Final)
Una manifestación gigante del bosque que aparece en la **Noche 3**.
* **Asset:** `fantasma.png` (Escalado x3)
* **Mecánica:** Posee una barra de vida propia (20 HP) y es necesario derrotarlo para ver el final del juego y escapar.

![Imagen del Boss](./assets/boss_fantasma.png)

---

## 🎥 Demo Speed-run

Aquí puedes ver una demostración de una partida completa (Speed-run) donde se muestra la supervivencia a las 3 noches y la derrota del jefe final:

[🎬 **Ver Vídeo Demo del Gameplay**](AQUI_TU_ENLACE_AL_VIDEO)

---

## 🛠️ Detalles Técnicos (Extra)

* **Generación Procedural:** El bosque nunca es igual; los árboles (`arbol1`, `arbol2`) se colocan aleatoriamente en cada partida.
* **Tienda:** Entre noches, puedes gastar el oro obtenido en **Curación**, **Botas de velocidad** o un **Escudo**.
* **Persistencia:** El juego guarda tus 3 mejores puntuaciones automáticamente.
