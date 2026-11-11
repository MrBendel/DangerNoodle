# gb/bcd.h

> Source header: `gbdk-lib/include/gb/bcd.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### BCD_HEX

```c
#define BCD_HEX ( v) ((BCD)(v))
```

### MAKE_BCD

```c
#define MAKE_BCD ( v) BCD_HEX(0x ## v)
```

Converts an integer value into BCD format

A maximum of 8 digits may be used

## Typedef

### BCD

```c
typedef uint32_t BCD
```

## Function

### uint2bcd()

```c
void uint2bcd ( uint16_t i, BCD * value )
```

Converts integer **i** into BCD format (Binary Coded Decimal)

**Parameters**

- `i`: Numeric value to convert
- `value`: Pointer to a BCD variable to store the converted result

### bcd_add()

```c
void bcd_add ( BCD * sour, const BCD * value )
```

Adds two numbers in BCD format: **sour** += **value**

**Parameters**

- `sour`: Pointer to a BCD value to add to (and where the result is stored)
- `value`: Pointer to the BCD value to add to sour

### bcd_sub()

```c
void bcd_sub ( BCD * sour, const BCD * value )
```

Subtracts two numbers in BCD format: **sour** -= **value**

**Parameters**

- `sour`: Pointer to a BCD value to subtract from (and where the result is stored)
- `value`: Pointer to the BCD value to subtract from sour

### bcd2text()

```c
uint8_t bcd2text ( const BCD * bcd, uint8_t tile_offset, uint8_t * buffer )
```

Convert a BCD number into an asciiz (null terminated) string and return the length

**Parameters**

- `bcd`: Pointer to BCD value to convert
- `tile_offset`: Optional per-character offset value to add (use 0 for none)
- `buffer`: Buffer to store the result in

Returns: Length in characters (always 8)

**buffer** should be large enough to store the converted string (9 bytes: 8 characters + 1 for terminator)

There are a couple different ways to use **tile\_offset**. For example:

-   It can be the Index of the Font Tile '0' in VRAM to allow the buffer to be used directly with set\_bkg\_tiles.
-   It can also be set to the ascii value for character '0' so that the buffer is a normal string that can be passed to printf.
