# assert.h

> Source header: `gbdk-lib/include/assert.h` (GBDK-2020 v4.5.0)

## Macro Definition

### assert

```c
#define assert ( x) ((x) ? (void)0 : __assert(#x, __func__, __FILE__, __LINE__))
```

## Function

### __assert()

```c
void __assert ( const char * expression, const char * functionname, const char * filename, unsigned int linenumber )
```
