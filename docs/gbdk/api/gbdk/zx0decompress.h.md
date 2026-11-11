# gbdk/zx0decompress.h

> Source header: `gbdk-lib/include/gbdk/zx0decompress.h` (GBDK-2020 v4.5.0)

## Function

### zx0_decompress()

```c
void zx0_decompress ( void * sour, void * dest )
```

Decompress zx0 compressed data from sour into dest

**Parameters**

- `sour`: Pointer to source zx0 compressed data
- `dest`: Pointer to destination buffer/address

Will decompress **all** of it's data to destination without stopping until the end of compressed data is reached. It is not possible to set a limit, so ensure the destination buffer has sufficient space to avoid an overflow.

Decompresses data which has been compressed with gbcompress using the `--alg=zx0` argument.
