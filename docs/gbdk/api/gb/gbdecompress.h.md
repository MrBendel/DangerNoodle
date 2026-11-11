# gb/gbdecompress.h

> Source header: `gbdk-lib/include/gb/gbdecompress.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Function

### gb_decompress()

```c
uint16_t gb_decompress ( const uint8_t * sour, uint8_t * dest )
```

gb-decompress data from sour into dest

**Parameters**

- `sour`: Pointer to source gb-compressed data
- `dest`: Pointer to destination buffer/address

Will decompress **all** of it's data to destination without stopping until the end of compressed data is reached. It is not possible to set a limit, so ensure the destination buffer has sufficient space to avoid an overflow.

**See also**

gb\_decompress\_bkg\_data, gb\_decompress\_win\_data, gb\_decompress\_sprite\_data, rle\_decompress

gb-decompress data from sour into dest

**Parameters**

- `sour`: Pointer to source gb-compressed data
- `dest`: Pointer to destination buffer/address

**Returns**

Return value is number of bytes decompressed

**See also**

gb\_decompress\_bkg\_data, gb\_decompress\_win\_data, gb\_decompress\_sprite\_data

### gb_decompress_bkg_data()

```c
void gb_decompress_bkg_data ( uint8_t first_tile, const uint8_t * sour )
```

gb-decompress background tiles into VRAM

**Parameters**

- `first_tile`: Index of the first tile to write
- `sour`: Pointer to (gb-compressed 2 bpp) source Tile Pattern data.

Note: This function avoids writes during modes 2 & 3

Will decompress **all** of it's data to destination without stopping until the end of compressed data is reached. It is not possible to set a limit, so ensure the destination buffer has sufficient space to avoid an overflow.

**See also**

gb\_decompress\_bkg\_data, gb\_decompress\_win\_data, gb\_decompress\_sprite\_data

### gb_decompress_win_data()

```c
void gb_decompress_win_data ( uint8_t first_tile, const uint8_t * sour )
```

gb-decompress window tiles into VRAM

**Parameters**

- `first_tile`: Index of the first tile to write
- `sour`: Pointer to (gb-compressed 2 bpp) source Tile Pattern data.

This is the same as gb\_decompress\_bkg\_data, since the Window Layer and Background Layer share the same Tile pattern data.

Note: This function avoids writes during modes 2 & 3

Will decompress **all** of it's data to destination without stopping until the end of compressed data is reached. It is not possible to set a limit, so ensure the destination buffer has sufficient space to avoid an overflow.

**See also**

gb\_decompress, gb\_decompress\_bkg\_data, gb\_decompress\_sprite\_data

### gb_decompress_sprite_data()

```c
void gb_decompress_sprite_data ( uint8_t first_tile, const uint8_t * sour )
```

gb-decompress sprite tiles into VRAM

**Parameters**

- `first_tile`: Index of the first tile to write
- `sour`: Pointer to source compressed data

Note: This function avoids writes during modes 2 & 3

Will decompress **all** of it's data to destination without stopping until the end of compressed data is reached. It is not possible to set a limit, so ensure the destination buffer has sufficient space to avoid an overflow.

**See also**

gb\_decompress, gb\_decompress\_bkg\_data, gb\_decompress\_win\_data
