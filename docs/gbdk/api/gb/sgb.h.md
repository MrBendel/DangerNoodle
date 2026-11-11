# gb/sgb.h

> Source header: `gbdk-lib/include/gb/sgb.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### SGB_PAL_01

```c
#define SGB_PAL_01 0x00U
```

SGB Command: Set SGB Palettes 0 & 1

### SGB_PAL_23

```c
#define SGB_PAL_23 0x01U
```

SGB Command: Set SGB Palettes 2 & 3

### SGB_PAL_03

```c
#define SGB_PAL_03 0x02U
```

SGB Command: Set SGB Palettes 0 & 3

### SGB_PAL_12

```c
#define SGB_PAL_12 0x03U
```

SGB Command: Set SGB Palettes 1 & 2

### SGB_ATTR_BLK

```c
#define SGB_ATTR_BLK 0x04U
```

SGB Command: Set color attributes for rectangular regions

### SGB_ATTR_LIN

```c
#define SGB_ATTR_LIN 0x05U
```

SGB Command: Set color attributes for horizontal or vertical character lines

### SGB_ATTR_DIV

```c
#define SGB_ATTR_DIV 0x06U
```

SGB Command: Split screen in half and assign separate color attribes to each side and the divider

### SGB_ATTR_CHR

```c
#define SGB_ATTR_CHR 0x07U
```

SGB Command: Set color attributes for separate charactersSet SGB Palette 0,1 Data

### SGB_SOUND

```c
#define SGB_SOUND 0x08U
```

SGB Command: Start and stop a internal sound effect, and sounds using internal tone data

### SGB_SOU_TRN

```c
#define SGB_SOU_TRN 0x09U
```

SGB Command: Transfer sound code or data to the SNES APU RAM

### SGB_PAL_SET

```c
#define SGB_PAL_SET 0x0AU
```

SGB Command: Apply (previously transferred) SGB system color palettes to actual SNES palettes

### SGB_PAL_TRN

```c
#define SGB_PAL_TRN 0x0BU
```

SGB Command: Transfer palette data into SGB system color palettes

### SGB_ATRC_EN

```c
#define SGB_ATRC_EN 0x0CU
```

SGB Command: Enable/disable Attraction mode. It is enabled by default

### SGB_TEST_EN

```c
#define SGB_TEST_EN 0x0DU
```

SGB Command: Enable/disable test mode for "SGB-CPU variable clock speed function"

### SGB_ICON_EN

```c
#define SGB_ICON_EN 0x0EU
```

SGB Command: Enable/disable ICON functionality

### SGB_DATA_SND

```c
#define SGB_DATA_SND 0x0FU
```

SGB Command: Write one or more bytes into SNES Work RAM

### SGB_DATA_TRN

```c
#define SGB_DATA_TRN 0x10U
```

SGB Command: Transfer code or data into SNES RAM

### SGB_MLT_REQ

```c
#define SGB_MLT_REQ 0x11U
```

SGB Command: Request multiplayer mode (input from more than one joypad)

### SGB_JUMP

```c
#define SGB_JUMP 0x12U
```

SGB Command: Set the SNES program counter and NMI (vblank interrupt) handler to specific addresses

### SGB_CHR_TRN

```c
#define SGB_CHR_TRN 0x13U
```

SGB Command: Transfer tile data (characters) to SNES Tile memory

### SGB_PCT_TRN

```c
#define SGB_PCT_TRN 0x14U
```

SGB Command: Transfer tile map and palette data to SNES BG Map memory

### SGB_ATTR_TRN

```c
#define SGB_ATTR_TRN 0x15U
```

SGB Command: Transfer data to (color) Attribute Files (ATFs) in SNES RAM

### SGB_ATTR_SET

```c
#define SGB_ATTR_SET 0x16U
```

SGB Command: Transfer attributes from (color) Attribute Files (ATF) to the Game Boy window

### SGB_MASK_EN

```c
#define SGB_MASK_EN 0x17U
```

SGB Command: Modify Game Boy window mask settings

### SGB_OBJ_TRN

```c
#define SGB_OBJ_TRN 0x18U
```

SGB Command: Transfer OBJ attributes to SNES OAM memory

## Function

### sgb_check()

```c
uint8_t sgb_check ( void )
```

Returns a non-zero value if running on a Super GameBoy

Since sgb\_check() uses sgb\_transfer(), the same delay at startup requirement applies to ensure correct operation on PAL SNES. See sgb\_transfer() for details.

### sgb_transfer()

```c
void sgb_transfer ( uint8_t * packet)
```

Transfer a SGB packet

**Parameters**

- `packet`: Pointer to buffer with SGB packet data.

The first byte of **packet** should be a SGB command, then up to 15 bytes of command parameter data.

See the `sgb_border` GBDK example project for a demo of how to use these the sgb functions.

When using the SGB with a PAL SNES, a delay should be added just after program startup such as:

```c
// Wait 4 frames
// For PAL SNES this delay is required on startup
for (uint8_t i = 4; i != 0; i--) wait_vbl_done();
```

**See also**

sgb\_check()

## Variable

### c

```c
void c
```
