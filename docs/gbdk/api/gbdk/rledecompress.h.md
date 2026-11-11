# gbdk/rledecompress.h

> Source header: `gbdk-lib/include/gbdk/rledecompress.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### RLE_STOP

```c
#define RLE_STOP 0
```

## Function

### rle_init()

```c
uint8_t rle_init ( void * data)
```

Initialize the RLE decompressor with RLE data at address **data**

**Parameters**

- `data`: Pointer to start of RLE compressed data

**See also**

rle\_decompress

### rle_decompress()

```c
uint8_t rle_decompress ( void * dest, uint8_t len )
```

Decompress RLE compressed data into **dest** for length **len** bytes

**Parameters**

- `dest`: Pointer to destination buffer/address
- `len`: Number of bytes to decompress

**Returns**

Returns `0` if compression is complete, `1` if there is more data to decompress

Before calling this function rle\_init must be called one time to initialize the RLE decompressor.

Decompresses data which has been compressed with gbcompress using the `--alg=rle` argument.

**See also**

rle\_init
