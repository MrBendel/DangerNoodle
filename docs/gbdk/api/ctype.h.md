# ctype.h

> Source header: `gbdk-lib/include/ctype.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdbool.h>`

## Function

### isalpha()

```c
bool isalpha ( char c)
```

Returns TRUE if the character **c** is a letter (a-z, A-Z), otherwise FALSE

**Parameters**

- `c`: Character to test

### isupper()

```c
bool isupper ( char c)
```

Returns TRUE if the character **c** is an uppercase letter (A-Z), otherwise FALSE

**Parameters**

- `c`: Character to test

### islower()

```c
bool islower ( char c)
```

Returns TRUE if the character **c** is a lowercase letter (a-z), otherwise FALSE

**Parameters**

- `c`: Character to test

### isdigit()

```c
bool isdigit ( char c)
```

Returns TRUE if the character **c** is a digit (0-9), otherwise FALSE

**Parameters**

- `c`: Character to test

### isspace()

```c
bool isspace ( char c)
```

Returns TRUE if the character **c** is a space (' '), tab (\\t), or newline (\\n) character, otherwise FALSE

**Parameters**

- `c`: Character to test

### toupper()

```c
char toupper ( char c)
```

Returns uppercase version of character **c** if it is a letter (a-z), otherwise it returns the input value unchanged.

**Parameters**

- `c`: Character to test

### tolower()

```c
char tolower ( char c)
```

Returns lowercase version of character **c** if it is a letter (A-Z), otherwise it returns the input value unchanged.

**Parameters**

- `c`: Character to test
