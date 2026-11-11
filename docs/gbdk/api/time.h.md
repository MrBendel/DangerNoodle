# time.h

> Source header: `gbdk-lib/include/time.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### CLOCKS_PER_SEC

```c
#define CLOCKS_PER_SEC 60
```

## Typedef

### time_t

```c
typedef uint16_t time_t
```

## Function

### clock()

```c
clock_t clock ( void )
```

Returns an approximation of processor time used by the program in Clocks

The value returned is the CPU time (ticks) used so far as a clock\_t.

To get the number of seconds used, divide by CLOCKS\_PER\_SEC.

This is based on sys\_time, which will wrap around every ~18 minutes. (unsigned 16 bits = 65535 / 60 / 60 = 18.2)

**See also**

sys\_time, time()

### time()

```c
time_t time ( time_t * t)
```

Converts clock() time to Seconds

**Parameters**

- `t`: If pointer t is not NULL, it's value will be set to the same seconds calculation as returned by the function.

The calculation is clock() / CLOCKS\_PER\_SEC

Returns: time in seconds

**See also**

sys\_time, clock()
