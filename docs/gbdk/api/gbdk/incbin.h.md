# gbdk/incbin.h

> Source header: `gbdk-lib/include/gbdk/incbin.h` (GBDK-2020 v4.5.0)

`#include <stdint.h>`

## Macro Definition

### INCBIN_EXTERN

```c
#define INCBIN_EXTERN ( VARNAME)
```

**Value:**
```c
extern const uint8_t VARNAME[]; \
extern const void __size_ ## VARNAME; \
extern const void __bank_ ## VARNAME;
```

Creates extern entries for accessing a INCBIN() generated variable and it's size in another source file.

**Parameters**

- `VARNAME`: Name of the variable used with INCBIN

An entry is created for the variable and it's size variable.

INCBIN(), INCBIN\_SIZE()

### INCBIN_SIZE

```c
#define INCBIN_SIZE ( VARNAME) ( (uint16_t) & __size_ ## VARNAME )
```

Obtains the **size in bytes** of the INCBIN() generated data

**Parameters**

- `VARNAME`: Name of the variable used with INCBIN

Requires INCBIN\_EXTERN() to have been called earlier in the source file

INCBIN(), INCBIN\_EXTERN()

### BANK

```c
#define BANK ( VARNAME) ( (uint8_t) & __bank_ ## VARNAME )
```

Obtains the **bank number** of the INCBIN() generated data

**Parameters**

- `VARNAME`: Name of the variable used with INCBIN

Requires INCBIN\_EXTERN() to have been called earlier in the source file

INCBIN(), INCBIN\_EXTERN()

### INCBIN

```c
#define INCBIN ( VARNAME, FILEPATH )
```

**Value:**
```c
void __func_ ## VARNAME(void) __banked __naked { \
__asm \
_ ## VARNAME:: \
1$: \
.incbin FILEPATH \
2$: \
___size_ ## VARNAME = (2$-1$) \
.globl ___size_ ## VARNAME \
.local b___func_ ## VARNAME \
___bank_ ## VARNAME = b___func_ ## VARNAME \
.globl ___bank_ ## VARNAME \
__endasm; \
}
```

Includes binary data into a C source file

**Parameters**

- `VARNAME`: Variable name to use
- `FILEPATH`: Path to the file which will be binary included into the C source file

**filepath** is relative to the working directory of the tool that is calling it (often a makefile's working directory), **NOT** to the file it's being included into.

The variable name is not modified and can be used as-is.

The INCBIN() macro will declare the BANK() and INCBIN\_SIZE() helper symbols. Then if INCBIN\_EXTERN() is used in the header then those helper macros can be used in the application code.

-   INCBIN\_SIZE() for obtaining the size of the included data.
-   BANK() for obtaining the bank number of the included data.

Use INCBIN\_EXTERN() within another source file to make the variable and it's data accessible there.

* * *
