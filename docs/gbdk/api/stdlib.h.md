# stdlib.h

> Source header: `gbdk-lib/include/stdlib.h` (GBDK-2020 v4.5.0)

`#include <types.h>`

## Function

### exit()

```c
void exit ( int status)
```

file stdlib.h 'Standard library' functions, for whatever that means. Causes normal program termination and the value of status is returned to the parent. All open streams are flushed and closed.

### abs()

```c
int abs ( int i)
```

Returns the absolute value of int **i**

**Parameters**

- `i`: Int to obtain absolute value of

If i is negative, returns -i; else returns i.

### labs()

```c
long labs ( long num)
```

Returns the absolute value of long int **num**

**Parameters**

- `num`: Long integer to obtain absolute value of

### atoi()

```c
int atoi ( const char * s)
```

Converts an ASCII string to an int

**Parameters**

- `s`: String to convert to an int

The string may be of the format

```c
[\s]*[+-][\d]+[\D]*
```

i.e. any number of spaces, an optional + or -, then an arbitrary number of digits.

The result is undefined if the number doesnt fit in an int.

Returns: Int value of string

### atol()

```c
long atol ( const char * s)
```

Converts an ASCII string to a long.

**Parameters**

- `s`: String to convert to an long int

**See also**

atoi()

Returns: Long int value of string

### itoa()

```c
char * itoa ( int n, char * s, unsigned char radix )
```

Converts an int into a base 10 ASCII string.

**Parameters**

- `n`: Int to convert to a string
- `s`: String to store the converted number
- `radix`: Numerical base for converted number, ex: 10 is decimal base (parameter is required but not utilized on Game Boy and Analogue Pocket)

Can be used with set\_bkg\_based\_tiles() for printing if the digit character tiles are not ascii-mapped.

Returns: Pointer to converted string

### uitoa()

```c
char * uitoa ( unsigned int n, char * s, unsigned char radix )
```

Converts an unsigned int into a base 10 ASCII string.

**Parameters**

- `n`: Unsigned Int to convert to a string
- `s`: String to store the converted number
- `radix`: Numerical base for converted number, ex: 10 is decimal base (parameter is required but not utilized on Game Boy and Analogue Pocket)

Can be used with set\_bkg\_based\_tiles() for printing if the digit character tiles are not ascii-mapped.

Returns: Pointer to converted string

### ltoa()

```c
char * ltoa ( long n, char * s, unsigned char radix )
```

Converts a long into a base 10 ASCII string.

**Parameters**

- `n`: Long int to convert to a string
- `s`: String to store the converted number
- `radix`: Numerical base for converted number, ex: 10 is decimal base (parameter is required but not utilized on Game Boy and Analogue Pocket)

Can be used with set\_bkg\_based\_tiles() for printing if the digit character tiles are not ascii-mapped.

Returns: Pointer to converted string

### ultoa()

```c
char * ultoa ( unsigned long n, char * s, unsigned char radix )
```

Converts an unsigned long into a base 10 ASCII string.

**Parameters**

- `n`: Unsigned Long Int to convert to a string
- `s`: String to store the converted number
- `radix`: Numerical base for converted number, ex: 10 is decimal base (parameter is required but not utilized on Game Boy and Analogue Pocket)

Can be used with set\_bkg\_based\_tiles() for printing if the digit character tiles are not ascii-mapped.

Returns: Pointer to converted string

### calloc()

```c
void * calloc ( size_t nmemb, size_t size )
```

Memory allocation functions

### malloc()

```c
void * malloc ( size_t size)
```

### realloc()

```c
void * realloc ( void * ptr, size_t size )
```

### free()

```c
void free ( void * ptr)
```

### bsearch()

```c
void * bsearch ( const void * key, const void * base, size_t nmemb, size_t size, int(*)(const void *, const void *) REENTRANT compar )
```

search a sorted array of **nmemb** items

**Parameters**

- `key`: Pointer to object that is the key for the search
- `base`: Pointer to first object in the array to search
- `nmemb`: Number of elements in the array
- `size`: Size in bytes of each element in the array
- `compar`: Function used to compare two elements of the array

Returns: Pointer to array entry that matches the search key. If key is not found, NULL is returned.

### qsort()

```c
void qsort ( void * base, size_t nmemb, size_t size, int(*)(const void *, const void *) REENTRANT compar )
```

Sort an array of **nmemb** items

**Parameters**

- `base`: Pointer to first object in the array to sort
- `nmemb`: Number of elements in the array
- `size`: Size in bytes of each element in the array
- `compar`: Function used to compare and sort two elements of the array
