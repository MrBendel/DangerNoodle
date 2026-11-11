# gb/metasprites.h

> Source header: `gbdk-lib/include/gb/metasprites.h` (GBDK-2020 v4.5.0)

`#include <gb/hardware.h>`  
`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### metasprite_end

```c
#define metasprite_end -128
```

### METASPR_ITEM

```c
#define METASPR_ITEM ( dy, dx, dt, a ) {(dy),(dx),(dt),(a)}
```

### METASPR_TERM

```c
#define METASPR_TERM {metasprite_end}
```

## Typedef

### metasprite_t

```c
typedef struct metasprite_t metasprite_t
```

Metasprite sub-item structure

**Parameters**

- `dy`: (int8_t) Y coordinate of the sprite relative to the metasprite origin (pivot)
- `dx`: (int8_t) X coordinate of the sprite relative to the metasprite origin (pivot)
- `dtile`: (uint8_t) Start tile relative to the metasprites own set of tiles
- `props`: (uint8_t) Property Flags

Metasprites are built from multiple metasprite\_t items (one for each sub-sprite) and a pool of tiles they reference. If a metasprite has multiple frames then each frame will be built from some number of metasprite\_t items (which may vary based on how many sprites are required for that particular frame).

A metasprite frame is terminated with a {metasprite\_end} entry.

## Function

### hide_sprites_range()

```c
void hide_sprites_range ( uint8_t from, uint8_t to )
```

Hides all hardware sprites in range from <= X < to

**Parameters**

- `from`: start OAM index
- `to`: finish OAM index (must be <= MAX_HARDWARE_SPRITES)

**See also**

hide\_sprite, MAX\_HARDWARE\_SPRITES

Hides all hardware sprites in range from <= X < to

**Parameters**

- `from`: start OAM index
- `to`: finish OAM index

### move_metasprite_ex()

```c
uint8_t move_metasprite_ex ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_prop, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Moves metasprite to the absolute position x and y

**Parameters**

- `metasprite`: Pointer to the first struct of the metasprite (for the desired frame)
- `base_tile`: Number of the first tile where the metasprite's tiles start
- `base_prop`: Base sprite property flags (can be used to set palette, etc)
- `base_sprite`: Number of the first hardware sprite to be used by the metasprite
- `x`: Absolute x coordinate of the sprite
- `y`: Absolute y coordinate of the sprite

Moves **metasprite** to the absolute position **x** and **y** (with **no flip** on the X or Y axis). Hardware sprites are allocated starting from **base\_sprite**, using tiles starting from **base\_tile**.

Sets:

-   \_\_current\_metasprite = metasprite;
-   \_\_current\_base\_tile = base\_tile;

Note: Overwrites OAM sprite properties (such as CGB Palette), see Metasprites and sprite properties.

**Returns**

Number of hardware sprites used to draw this metasprite

### move_metasprite()

```c
uint8_t move_metasprite ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Obsolete. This function has been replaced by move\_metasprite\_ex()

### move_metasprite_flipx()

```c
uint8_t move_metasprite_flipx ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_prop, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Moves metasprite to the absolute position x and y, **flipped by X (horizontally)**

**Parameters**

- `metasprite`: Pointer to the first struct of the metasprite (for the desired frame)
- `base_tile`: Number of the first tile where the metasprite's tiles start
- `base_prop`: Base sprite property flags (can be used to set palette, etc)
- `base_sprite`: Number of the first hardware sprite to be used by the metasprite
- `x`: Absolute x coordinate of the sprite
- `y`: Absolute y coordinate of the sprite

Same as move\_metasprite(), but with the metasprite flipped by X (horizontally).

Sets:

-   \_\_current\_metasprite = metasprite;
-   \_\_current\_base\_tile = base\_tile;

Note: Overwrites OAM sprite properties (such as CGB palette), see Metasprites and sprite properties.

This function is only available on Game Boy and related clone consoles.

**Returns**

Number of hardware sprites used to draw this metasprite

**See also**

move\_metasprite()

### move_metasprite_vflip()

```c
uint8_t move_metasprite_vflip ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Obsolete. This function has been replaced by move\_metasprite\_flipx()

### move_metasprite_flipy()

```c
uint8_t move_metasprite_flipy ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_prop, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Moves metasprite to the absolute position x and y, **flipped by Y (vertically)**

**Parameters**

- `metasprite`: Pointer to the first struct of the metasprite (for the desired frame)
- `base_tile`: Number of the first tile where the metasprite's tiles start
- `base_prop`: Base sprite property flags (can be used to set palette, etc)
- `base_sprite`: Number of the first hardware sprite to be used by the metasprite
- `x`: Absolute x coordinate of the sprite
- `y`: Absolute y coordinate of the sprite

Same as move\_metasprite(), but with the metasprite flipped by Y (vertically).

Sets:

-   \_\_current\_metasprite = metasprite;
-   \_\_current\_base\_tile = base\_tile;

Note: Overwrites OAM sprite properties (such as CGB palette), see Metasprites and sprite properties.

This function is only available on Game Boy and related clone consoles.

**Returns**

Number of hardware sprites used to draw this metasprite

**See also**

move\_metasprite()

### move_metasprite_hflip()

```c
uint8_t move_metasprite_hflip ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Obsolete. This function has been replaced by move\_metasprite\_flipy()

### move_metasprite_flipxy()

```c
uint8_t move_metasprite_flipxy ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_prop, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Moves metasprite to the absolute position x and y, **flipped by X and Y (horizontally and vertically)**

**Parameters**

- `metasprite`: Pointer to the first struct of the metasprite (for the desired frame)
- `base_tile`: Number of the first tile where the metasprite's tiles start
- `base_prop`: Base sprite property flags (can be used to set palette, etc)
- `base_sprite`: Number of the first hardware sprite to be used by the metasprite
- `x`: Absolute x coordinate of the sprite
- `y`: Absolute y coordinate of the sprite

Same as move\_metasprite(), but with the metasprite flipped by X and Y (horizontally and vertically).

Sets:

-   \_\_current\_metasprite = metasprite;
-   \_\_current\_base\_tile = base\_tile;

Note: Overwrites OAM sprite properties (such as CGB palette), see Metasprites and sprite properties.

This function is only available on Game Boy and related clone consoles.

**Returns**

Number of hardware sprites used to draw this metasprite

**See also**

move\_metasprite()

### move_metasprite_hvflip()

```c
uint8_t move_metasprite_hvflip ( const metasprite_t * metasprite, uint8_t base_tile, uint8_t base_sprite, uint8_t x, uint8_t y ) inline
```

Obsolete. This function has been replaced by move\_metasprite\_flipxy()

### hide_metasprite()

```c
void hide_metasprite ( const metasprite_t * metasprite, uint8_t base_sprite ) inline
```

Hides a metasprite from the screen

**Parameters**

- `metasprite`: Pointer to first struct of the desired metasprite frame
- `base_sprite`: Number of hardware sprite to start with

Sets:

-   \_\_current\_metasprite = metasprite;

## Variable

### __current_metasprite

```c
const void* __current_metasprite extern
```

### __current_base_tile

```c
uint8_t __current_base_tile extern
```

### __current_base_prop

```c
uint8_t __current_base_prop extern
```

### __render_shadow_OAM

```c
uint8_t __render_shadow_OAM extern
```
