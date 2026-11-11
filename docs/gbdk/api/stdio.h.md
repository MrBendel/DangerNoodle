# stdio.h

> Source header: `gbdk-lib/include/stdio.h` (GBDK-2020 v4.5.0)

`#include <types.h>`

## Function

### putchar()

```c
void putchar ( char c)
```

Print char to stdout.

**Parameters**

- `c`: Character to print

### printf()

```c
void printf ( const char * format, ... )
```

Print the string and arguments given by format to stdout.

**Parameters**

- `format`: The format string as per printf

Does not return the number of characters printed.

Currently supported:

-   %hx (char as hex)
-   %hu (unsigned char)
-   %hd (signed char)
-   %c (character)
-   %u (unsigned int)
-   %d (signed int)
-   %x (unsigned int as hex)
-   %s (string)

Warning: to correctly pass parameters (such as chars, ints, etc) **all of them should always be explicitly cast** as when calling the function. See docs\_chars\_varargs for more details.

### sprintf()

```c
void sprintf ( char * str, const char * format, ... )
```

Print the string and arguments given by format to a buffer.

**Parameters**

- `str`: The buffer to print into
- `format`: The format string as per printf

Does not return the number of characters printed.

Warning: to correctly pass parameters (such as chars, ints, etc) **all of them should always be explicitly cast** as when calling the function. See docs\_chars\_varargs for more details.

### puts()

```c
void puts ( const char * s)
```

puts() writes the string **s** and a trailing newline to stdout.

### gets()

```c
char * gets ( char * s)
```

gets() Reads a line from stdin into a buffer pointed to by **s**.

**Parameters**

- `s`: Buffer to store string in

Reads until either a terminating newline or an EOF, which it replaces with '\\0'. No check for buffer overrun is performed.

Returns: Buffer pointed to by **s**

### getchar()

```c
char getchar ( void )
```

getchar() Reads and returns a single character from stdin.
