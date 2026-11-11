# gb/hblankcpy.h

> Source header: `gbdk-lib/include/gb/hblankcpy.h` (GBDK-2020 v4.5.0)

`#include <stdint.h>`

## Function

### hblank_copy_vram()

```c
void hblank_copy_vram ( const uint8_t * sour, uint8_t count )
```

HBlank stack copy routine

**Parameters**

- `sour`: Source address to copy from
- `count`: Number of 16 byte chunks to copy

Performs the required STAT\_REG, IE\_REG, IF\_REG manipulation when called and restores STAT\_REG and IE\_REG on exit (unlike hblank\_cpy\_vram()).

Before calling:

-   Set the destination using hblank\_copy\_destination
-   Interrupts must be disabled

**See also**

hblank\_cpy\_vram, hblank\_copy\_destination, hblank\_copy

### hblank_cpy_vram()

```c
void hblank_cpy_vram ( const uint8_t * sour, uint8_t count )
```

HBlank stack copy routine

**Parameters**

- `sour`: Source address to copy from
- `count`: Number of 16 byte chunks to copy

Unlike hblank\_copy\_vram() does not perform the required STAT\_REG, IE\_REG, IF\_REG manipulation, nor does it restore STAT\_REG and IE\_REG on exit.

Before calling:

-   Set the destination using hblank\_copy\_destination
-   Interrupts must be properly configured
-   Interrupts must be disabled

**See also**

hblank\_copy\_vram, hblank\_copy\_destination, hblank\_copy

### hblank_copy()

```c
void hblank_copy ( uint8_t * dest, const uint8_t * sour, uint16_t size ) inline
```

HBlank stack copy routine (must be called with interrupts disabled!)

**Parameters**

- `dest`: destination pointer
- `sour`: source pointer
- `size`: number of bytes to copy (rounded to 16-byte chunks)

Performs a fast vram safe copy of data during HBlank.

## Variable

### hblank_copy_destination

```c
uint8_t* hblank_copy_destination extern
```

Destination address for hblank copy routine
