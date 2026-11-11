# asm/sm83/string.h

> Source header: `gbdk-lib/include/asm/sm83/string.h` (GBDK-2020 v4.5.0)

`#include <types.h>`

## Function

### strcpy()

```c
char * strcpy ( char * dest, const char * src )
```

Copies the string pointed to by **src** (including the terminating ‘\\0’ character) to the array pointed to by **dest**.

The strings may not overlap, and the destination string dest must be large enough to receive the copy.

**Parameters**

- `dest`: Array to copy into
- `src`: Array to copy from

**Returns**

A pointer to dest

### strcmp()

```c
int strcmp ( const char * s1, const char * s2 )
```

Compares strings

**Parameters**

- `s1`: First string to compare
- `s2`: Second string to compare

Returns:

-   \> 0 if **s1** > **s2**
-   0 if **s1** == **s2**
-   < 0 if **s1** < **s2**

### memcpy()

```c
void * memcpy ( void * dest, const void * src, size_t len )
```

Copies n bytes from memory area src to memory area dest.

The memory areas may not overlap.

**Parameters**

- `dest`: Buffer to copy into
- `src`: Buffer to copy from
- `len`: Number of Bytes to copy

### memmove()

```c
void * memmove ( void * dest, const void * src, size_t n )
```

Copies n bytes from memory area src to memory area dest, areas may overlap

### memset()

```c
void * memset ( void * s, int c, size_t n )
```

Fills the memory region **s** with **n** bytes using value **c**

**Parameters**

- `s`: Buffer to fill
- `c`: char value to fill with (truncated from int)
- `n`: Number of bytes to fill

### reverse()

```c
char * reverse ( char * s)
```

Reverses the characters in a string

**Parameters**

- `s`: Pointer to string to reverse.

For example 'abcdefg' will become 'gfedcba'.

Banked as the string must be modifiable.

Returns: Pointer to **s**

### strcat()

```c
char * strcat ( char * s1, const char * s2 )
```

Concatenate Strings. Appends string **s2** to the end of string **s1**

**Parameters**

- `s1`: String to append onto
- `s2`: String to copy from

For example 'abc' and 'def' will become 'abcdef'.

String **s1** must be large enough to store both **s1** and **s2**.

Returns: Pointer to **s1**

### strlen()

```c
int strlen ( const char * s)
```

Calculates the length of a string

**Parameters**

- `s`: String to calculate length of

Returns: Length of string not including the terminating ‘\\0’ character.

### strncat()

```c
char * strncat ( char * s1, const char * s2, int n )
```

Concatenate at most **n** characters from string **s2** onto the end of **s1**.

**Parameters**

- `s1`: String to append onto
- `s2`: String to copy from
- `n`: Max number of characters to copy from s2

String **s1** must be large enough to store both **s1** and **n** characters of **s2**

Returns: Pointer to **s1**

### strncmp()

```c
int strncmp ( const char * s1, const char * s2, int n )
```

Compare strings (at most **n** characters):

**Parameters**

- `s1`: First string to compare
- `s2`: Second string to compare
- `n`: Max number of characters to compare

Returns zero if the strings are identical, or non-zero if they are not (see below).

Returns:

-   \> 0 if **s1** > **s2** (at first non-matching byte)
-   0 if **s1** == **s2**
-   < 0 if **s1** < **s2** (at first non-matching byte)

### strncpy()

```c
char * strncpy ( char * s1, const char * s2, int n )
```

Copy **n** characters from string **s2** to **s1**

**Parameters**

- `s1`: String to copy into
- `s2`: String to copy from
- `n`: Max number of characters to copy from s2

If **s2** is shorter than **n**, the remaining bytes in **s1** are filled with \\0.

Warning: If there is no \\0 in the first **n** bytes of **s2** then **s1** will not be null terminated.

Returns: Pointer to **s1**

### memcmp()

```c
int memcmp ( const void * buf1, const void * buf2, size_t count )
```

Compare up to **count** bytes in buffers **buf1** and **buf2**

**Parameters**

- `buf1`: Pointer to First buffer to compare
- `buf2`: Pointer to Second buffer to compare
- `count`: Max number of bytes to compare

Returns zero if the buffers are identical, or non-zero if they are not (see below).

Returns:

-   \> 0 if **buf1** > **buf2** (at first non-matching byte)
-   0 if **buf1** == **buf2**
-   < 0 if **buf1** < **buf2** (at first non-matching byte)

## Variable

### c

```c
void c
```
