# gb/cgb.h

> Source header: `gbdk-lib/include/gb/cgb.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### RGB

```c
#define RGB ( r, g, b ) ((uint16_t)((((b) & 0x1f) << 10) | ((uint16_t)(((g) & 0x1f) << 5)) | ((r) & 0x1f)))
```

Macro to create a CGB palette color entry out of 5-bit color components.

**Parameters**

- `r`: 5-bit Red Component, range 0 - 31 (31 brightest)
- `g`: 5-bit Green Component, range 0 - 31 (31 brightest)
- `b`: 5-bit Blue Component, range 0 - 31 (31 brightest)

The resulting format is bitpacked BGR-555 in a uint16\_t.

**See also**

set\_bkg\_palette(), set\_sprite\_palette(), RGB8(), RGBHTML()

### RGB8

```c
#define RGB8 ( r, g, b ) (((uint16_t)((((b) >> 3) & 0x1f) << 10)) | ((uint16_t)((((g) >> 3) & 0x1f) << 5)) | (((r) >> 3) & 0x1f))
```

Macro to create a CGB palette color entry out of 8-bit color components.

**Parameters**

- `r`: 8-bit Red Component, range 0 - 255 (255 brightest)
- `g`: 8-bit Green Component, range 0 - 255 (255 brightest)
- `b`: 8-bit Blue Component, range 0 - 255 (255 brightest)

The resulting format is bitpacked BGR-555 in a uint16\_t.

The lowest 3 bits of each color component are dropped during conversion.

**See also**

set\_bkg\_palette(), set\_sprite\_palette(), RGB(), RGBHTML()

### RGBHTML

```c
#define RGBHTML ( RGB24bit) (RGB8((((RGB24bit) >> 16) & 0xff), (((RGB24bit) >> 8) & 0xff), ((RGB24bit) & 0xff)))
```

Macro to convert a 24 Bit RGB color to a CGB palette color entry.

**Parameters**

- `RGB24bit`: Bit packed RGB-888 color (0-255 for each color component).

The resulting format is bitpacked BGR-555 in a uint16\_t.

The lowest 3 bits of each color component are dropped during conversion.

**See also**

set\_bkg\_palette(), set\_sprite\_palette(), RGB(), RGB8()

### RGB_RED

```c
#define RGB_RED RGB(31, 0, 0)
```

Common colors based on the EGA default palette.

### RGB_DARKRED

```c
#define RGB_DARKRED RGB(15, 0, 0)
```

### RGB_GREEN

```c
#define RGB_GREEN RGB( 0, 31, 0)
```

### RGB_DARKGREEN

```c
#define RGB_DARKGREEN RGB( 0, 15, 0)
```

### RGB_BLUE

```c
#define RGB_BLUE RGB( 0, 0, 31)
```

### RGB_DARKBLUE

```c
#define RGB_DARKBLUE RGB( 0, 0, 15)
```

### RGB_YELLOW

```c
#define RGB_YELLOW RGB(31, 31, 0)
```

### RGB_DARKYELLOW

```c
#define RGB_DARKYELLOW RGB(21, 21, 0)
```

### RGB_CYAN

```c
#define RGB_CYAN RGB( 0, 31, 31)
```

### RGB_AQUA

```c
#define RGB_AQUA RGB(28, 5, 22)
```

### RGB_PINK

```c
#define RGB_PINK RGB(31, 0, 31)
```

### RGB_PURPLE

```c
#define RGB_PURPLE RGB(21, 0, 21)
```

### RGB_BLACK

```c
#define RGB_BLACK RGB( 0, 0, 0)
```

### RGB_DARKGRAY

```c
#define RGB_DARKGRAY RGB(10, 10, 10)
```

### RGB_LIGHTGRAY

```c
#define RGB_LIGHTGRAY RGB(21, 21, 21)
```

### RGB_WHITE

```c
#define RGB_WHITE RGB(31, 31, 31)
```

### RGB_LIGHTFLESH

```c
#define RGB_LIGHTFLESH RGB(30, 20, 15)
```

### RGB_BROWN

```c
#define RGB_BROWN RGB(10, 10, 0)
```

### RGB_ORANGE

```c
#define RGB_ORANGE RGB(30, 20, 0)
```

### RGB_TEAL

```c
#define RGB_TEAL RGB(15, 15, 0)
```

## Typedef

### palette_color_t

```c
typedef uint16_t palette_color_t
```

16 bit color entry

## Function

### set_bkg_palette()

```c
void set_bkg_palette ( uint8_t first_palette, uint8_t nb_palettes, const palette_color_t * rgb_data )
```

Set CGB background palette(s).

**Parameters**

- `first_palette`: Index of the first palette to write (0-7)
- `nb_palettes`: Number of palettes to write (1-8, max depends on first_palette)
- `rgb_data`: Pointer to source palette data

Writes **nb\_palettes** to background palette data starting at **first\_palette**, Palette data is sourced from **rgb\_data**.

-   Each Palette is 8 bytes in size: 4 colors x 2 bytes per palette color entry.
-   Each color (4 per palette) is packed as BGR-555 format (1:5:5:5, MSBit \[15\] is unused).
-   Each component (R, G, B) may have values from 0 - 31 (5 bits), 31 is brightest.

**See also**

RGB(), set\_bkg\_palette\_entry()

BKGF\_CGB\_PAL0, BKGF\_CGB\_PAL1, BKGF\_CGB\_PAL2, BKGF\_CGB\_PAL3

BKGF\_CGB\_PAL4, BKGF\_CGB\_PAL5, BKGF\_CGB\_PAL6, BKGF\_CGB\_PAL7

### set_sprite_palette()

```c
void set_sprite_palette ( uint8_t first_palette, uint8_t nb_palettes, const palette_color_t * rgb_data )
```

Set CGB sprite palette(s).

**Parameters**

- `first_palette`: Index of the first palette to write (0-7)
- `nb_palettes`: Number of palettes to write (1-8, max depends on first_palette)
- `rgb_data`: Pointer to source palette data

Writes **nb\_palettes** to sprite palette data starting at **first\_palette**, Palette data is sourced from **rgb\_data**.

-   Each Palette is 8 bytes in size: 4 colors x 2 bytes per palette color entry.
-   Each color (4 per palette) is packed as BGR-555 format (1:5:5:5, MSBit \[15\] is unused).
-   Each component (R, G, B) may have values from 0 - 31 (5 bits), 31 is brightest.

**See also**

RGB(), set\_sprite\_palette\_entry()

OAMF\_CGB\_PAL0, OAMF\_CGB\_PAL1, OAMF\_CGB\_PAL2, OAMF\_CGB\_PAL3

OAMF\_CGB\_PAL4, OAMF\_CGB\_PAL5, OAMF\_CGB\_PAL6, OAMF\_CGB\_PAL7

### set_bkg_palette_entry()

```c
void set_bkg_palette_entry ( uint8_t palette, uint8_t entry, uint16_t rgb_data )
```

Sets a single color in the specified CGB background palette.

**Parameters**

- `palette`: Index of the palette to modify (0-7)
- `entry`: Index of color in palette to modify (0-3)
- `rgb_data`: New color data in BGR 15bpp format.

**See also**

set\_bkg\_palette(), RGB()

BKGF\_CGB\_PAL0, BKGF\_CGB\_PAL1, BKGF\_CGB\_PAL2, BKGF\_CGB\_PAL3

BKGF\_CGB\_PAL4, BKGF\_CGB\_PAL5, BKGF\_CGB\_PAL6, BKGF\_CGB\_PAL7

### set_sprite_palette_entry()

```c
void set_sprite_palette_entry ( uint8_t palette, uint8_t entry, uint16_t rgb_data )
```

Sets a single color in the specified CGB sprite palette.

**Parameters**

- `palette`: Index of the palette to modify (0-7)
- `entry`: Index of color in palette to modify (0-3)
- `rgb_data`: New color data in BGR 15bpp format.

**See also**

set\_sprite\_palette(), RGB()

OAMF\_CGB\_PAL0, OAMF\_CGB\_PAL1, OAMF\_CGB\_PAL2, OAMF\_CGB\_PAL3

OAMF\_CGB\_PAL4, OAMF\_CGB\_PAL5, OAMF\_CGB\_PAL6, OAMF\_CGB\_PAL7

### cpu_slow()

```c
void cpu_slow ( void )
```

Set CPU speed to slow (Normal Speed) operation.

Interrupts are temporarily disabled and then re-enabled during this call.

In this mode the CGB operates at the same speed as the DMG/Pocket/SGB models.

-   You can check to see if \_cpu == CGB\_TYPE before using this function.

**See also**

cpu\_fast()

### cpu_fast()

```c
void cpu_fast ( void ) inline
```

Set CPU speed to fast (CGB Double Speed) operation.

On startup the CGB operates in Normal Speed Mode and can be switched into Double speed mode (faster processing but also higher power consumption). See the Pan Docs for more information about which hardware features operate faster and which remain at Normal Speed.

-   Interrupts are temporarily disabled and then re-enabled during this call.
-   You can check to see if \_cpu == CGB\_TYPE before using this function.

**See also**

cpu\_slow(), \_cpu

### set_default_palette()

```c
void set_default_palette ( void )
```

Sets CGB palette 0 to be compatible with the DMG/GBP.

The default/first CGB palettes for sprites and backgrounds are set to a similar default appearance as on the DMG/Pocket/SGB models. (White, Light Gray, Dark Gray, Black)

-   You can check to see if \_cpu == CGB\_TYPE before using this function.

### cgb_compatibility()

```c
void cgb_compatibility ( void ) inline
```

Obsolete. This function has been replaced by set\_default\_palette(), which has identical behavior.
