# gb/drawing.h

> Source header: `gbdk-lib/include/gb/drawing.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### GRAPHICS_WIDTH

```c
#define GRAPHICS_WIDTH 160
```

Size of the screen in pixels

### GRAPHICS_HEIGHT

```c
#define GRAPHICS_HEIGHT 144
```

### SOLID

```c
#define SOLID 0x00 /* Overwrites the existing pixels */
```

### OR

```c
#define OR 0x01 /* Performs a logical OR */
```

### XOR

```c
#define XOR 0x02 /* Performs a logical XOR */
```

### AND

```c
#define AND 0x03 /* Performs a logical AND */
```

### WHITE

```c
#define WHITE 0
```

Possible drawing colours

### LTGREY

```c
#define LTGREY 1
```

### DKGREY

```c
#define DKGREY 2
```

### BLACK

```c
#define BLACK 3
```

### M_NOFILL

```c
#define M_NOFILL 0
```

Possible fill styles for box() and circle()

### M_FILL

```c
#define M_FILL 1
```

### SIGNED

```c
#define SIGNED 1
```

Possible values for signed\_value in gprintln() and gprintn()

### UNSIGNED

```c
#define UNSIGNED 0
```

## Function

### gprint()

```c
void gprint ( char * str)
```

Print the string 'str' with no interpretation

**See also**

gotogxy()

### gprintln()

```c
void gprintln ( int16_t number, int8_t radix, int8_t signed_value )
```

Print 16 bit **number** in **radix** (base) in the default font at the current text position.

**Parameters**

- `number`: number to print
- `radix`: radix (base) to print with
- `signed_value`: should be set to SIGNED or UNSIGNED depending on whether the number is signed or not

The current position is advanced by the numer of characters printed.

**See also**

gotogxy()

### gprintn()

```c
void gprintn ( int8_t number, int8_t radix, int8_t signed_value )
```

Print 8 bit **number** in **radix** (base) in the default font at the current text position.

**See also**

gprintln(), gotogxy()

### gprintf()

```c
int8_t gprintf ( char * fmt, ... )
```

Print the string and arguments given by **fmt** with arguments \_\_...\_\_

**Parameters**

- `fmt`: The format string as per printf
- `...`: params

Currently supported:

-   %c (character)
-   %u (int)
-   %d (int8\_t)
-   %o (int8\_t as octal)
-   %x (int8\_t as hex)
-   %s (string)

**Returns**

Returns the number of items printed, or -1 if there was an error.

**See also**

gotogxy()

### plot()

```c
void plot ( uint8_t x, uint8_t y, uint8_t colour, uint8_t mode )
```

Old style plot - try plot\_point()

### plot_point()

```c
void plot_point ( uint8_t x, uint8_t y )
```

Plot a point in the current drawing mode and colour at **x,y**

### switch_data()

```c
void switch_data ( uint8_t x, uint8_t y, uint8_t * src, uint8_t * dst )
```

Exchanges the tile on screen at x,y with the tile pointed by src, original tile is saved in dst. Both src and dst may be NULL - saving or copying to screen is not performed in this case.

### draw_image()

```c
void draw_image ( uint8_t * data)
```

Draw a full screen image at **data**

### line()

```c
void line ( uint8_t x1, uint8_t y1, uint8_t x2, uint8_t y2 )
```

Draw a line in the current drawing mode and colour from **x1,y1** to **x2,y2**

### box()

```c
void box ( uint8_t x1, uint8_t y1, uint8_t x2, uint8_t y2, uint8_t style )
```

Draw a box (rectangle) with corners **x1,y1** and **x2,y2** using fill mode **style** (one of NOFILL or FILL)

### circle()

```c
void circle ( uint8_t x, uint8_t y, uint8_t radius, uint8_t style )
```

Draw a circle with centre at **x,y** and **radius** using fill mode **style** (one of NOFILL or FILL)

### getpix()

```c
uint8_t getpix ( uint8_t x, uint8_t y )
```

Returns the current colour of the pixel at **x,y**

### wrtchr()

```c
void wrtchr ( char chr)
```

Prints the character **chr** in the default font at the current text position.

The current position is advanced by 1 after the character is printed.

**See also**

gotogxy()

### gotogxy()

```c
void gotogxy ( uint8_t x, uint8_t y )
```

Sets the current text position to **x,y**.

Note: **x** and **y** have units of tiles (8 pixels per unit)

**See also**

wrtchr()

### color()

```c
void color ( uint8_t forecolor, uint8_t backcolor, uint8_t mode )
```

Set the current **forecolor** colour, **backcolor** colour, and draw **mode**

**Parameters**

- `forecolor`: The primary drawing color (outlines of rectangles with box(), letter color with gprintf(), etc).
- `backcolor`: Secondary or background color where applicable (fill color of rectangles with box() when M_FILL is specifed, background color of text with gprintf(), etc).
- `mode`: Drawing style to use. Several settings are available SOLID, OR, XOR, AND.

In order to completely overwrite existing pixels use `SOLID` for **mode**
