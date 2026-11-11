# gbdk/font.h

> Source header: `gbdk-lib/include/gbdk/font.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### FONT_256ENCODING

```c
#define FONT_256ENCODING 0
```

Various flags in the font header.

### FONT_128ENCODING

```c
#define FONT_128ENCODING 1
```

### FONT_NOENCODING

```c
#define FONT_NOENCODING 2
```

### FONT_COMPRESSED

```c
#define FONT_COMPRESSED 4
```

## Typedef

### font_t

```c
typedef uint16_t font_t
```

font\_t is a handle to a font loaded by font\_load(). It can be used with font\_set()

### mfont_handle

```c
typedef struct sfont_handle mfont_handle
```

Internal representation of a font. What a font\_t really is

### pmfont_handle

```c
typedef struct sfont_handle* pmfont_handle
```

## Function

### font_init()

```c
void font_init ( void )
```

Initializes the font system. Should be called before other font functions.

### font_load()

```c
font_t font_load ( void * font)
```

Load a font and set it as the current font.

**Parameters**

- `font`: Pointer to a font to load (usually a gbdk font)

**Returns**

Handle to the loaded font, which can be used with font\_set()

**See also**

font\_init(), font\_set(), List of gbdk fonts

### font_set()

```c
font_t font_set ( font_t font_handle)
```

Set the current font.

**Parameters**

- `font_handle`: handle of a font returned by font_load()

**Returns**

The previously used font handle.

**See also**

font\_init(), font\_load()

### font_color()

```c
void font_color ( uint8_t forecolor, uint8_t backcolor )
```

Set the current **foreground** colour (for pixels), **background** colour
