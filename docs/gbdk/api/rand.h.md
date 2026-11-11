# rand.h

> Source header: `gbdk-lib/include/rand.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### RAND_MAX

```c
#define RAND_MAX 255
```

### RANDW_MAX

```c
#define RANDW_MAX 65535
```

## Function

### initrand()

```c
void initrand ( uint16_t seed)
```

Initalise the pseudo-random number generator.

**Parameters**

- `seed`: The value for initializing the random number generator.

The seed should be different each time, otherwise the same pseudo-random sequence will be generated.

One way to do this is sampling (DIV\_REG) up to 2 times (high byte of seed value then the low byte) at variable, non-deterministic points in time (such as when the player presses buttons on the title screen or in a menu).

It only needs to be called once to be initialized.

**See also**

rand(), randw()

### rand()

```c
uint8_t rand ( void )
```

Returns a random byte (8 bit) value.

initrand() should be used to initialize the random number generator before using rand()

### randw()

```c
uint16_t randw ( void )
```

Returns a random word (16 bit) value.

initrand() should be used to initialize the random number generator before using rand()

### initarand()

```c
void initarand ( uint16_t seed)
```

Random generator using the linear lagged additive method

**Parameters**

- `seed`: The value for initializing the random number generator.

Note: initarand() calls initrand() with the same seed value, and uses rand() to initialize the random generator.

**See also**

initrand() for suggestions about seed values, arand()

### arand()

```c
uint8_t arand ( void )
```

Returns a random number generated with the linear lagged additive method.

initarand() should be used to initialize the random number generator before using arand()

## Variable

### __rand_seed

```c
uint16_t __rand_seed extern
```

The random number seed is stored in \_\_rand\_seed and can be saved and restored if needed.

```c
// Save
some_uint16 = __rand_seed;
...
// Restore
__rand_seed = some_uint16;
```

### c

```c
uint8_t c
```
