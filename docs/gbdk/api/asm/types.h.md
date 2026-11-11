# asm/types.h

> Source header: `gbdk-lib/include/asm/types.h` (GBDK-2020 v4.5.0)

`#include <asm/sm83/types.h>`

## Macro Definition

### OLDCALL

```c
#define OLDCALL
```

### PRESERVES_REGS

```c
#define PRESERVES_REGS ( ...)
```

### NAKED

```c
#define NAKED
```

### SFR

```c
#define SFR
```

### AT

```c
#define AT ( A)
```

### NORETURN

```c
#define NORETURN
```

### NONBANKED

```c
#define NONBANKED
```

### BANKED

```c
#define BANKED
```

### CRITICAL

```c
#define CRITICAL
```

### INTERRUPT

```c
#define INTERRUPT
```

## Typedef

### BOOLEAN

```c
typedef INT8 BOOLEAN
```

TRUE or FALSE.

### BYTE

```c
typedef INT8 BYTE
```

Signed 8 bit.

### UBYTE

```c
typedef UINT8 UBYTE
```

Unsigned 8 bit.

### WORD

```c
typedef INT16 WORD
```

Signed 16 bit

### UWORD

```c
typedef UINT16 UWORD
```

Unsigned 16 bit

### LWORD

```c
typedef INT32 LWORD
```

Signed 32 bit

### ULWORD

```c
typedef UINT32 ULWORD
```

Unsigned 32 bit

### DWORD

```c
typedef INT32 DWORD
```

Signed 32 bit

### UDWORD

```c
typedef UINT32 UDWORD
```

Unsigned 32 bit

### fixed

```c
typedef union _fixed fixed
```

Useful definition for working with 8 bit + 8 bit fixed point values

Use `.w` to access the variable as unsigned 16 bit type.

Use `.b.h` and `.b.l` (or just `.h` and `.l`) to directly access it's high and low unsigned 8 bit values.
