# gbdk/console.h

> Source header: `gbdk-lib/include/gbdk/console.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Function

### gotoxy()

```c
void gotoxy ( uint8_t x, uint8_t y )
```

Move the cursor to an absolute position at **x, y**.

**x** and **y** have units of tiles (8 pixels per unit)

**See also**

setchar()

### posx()

```c
uint8_t posx ( void )
```

Returns the current X position of the cursor.

**See also**

gotoxy()

### posy()

```c
uint8_t posy ( void )
```

Returns the current Y position of the cursor.

**See also**

gotoxy()

### setchar()

```c
void setchar ( char c)
```

Writes out a single character at the current cursor position.

Does not update the cursor or interpret the character.

**See also**

gotoxy()

### cls()

```c
void cls ( void )
```

Clears the screen
