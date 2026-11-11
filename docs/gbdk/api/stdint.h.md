# stdint.h

> Source header: `gbdk-lib/include/stdint.h` (GBDK-2020 v4.5.0)

## Macro Definition

### INT8_MIN

```c
#define INT8_MIN (-128)
```

### INT16_MIN

```c
#define INT16_MIN (-32767-1)
```

### INT32_MIN

```c
#define INT32_MIN (-2147483647L-1)
```

### INT8_MAX

```c
#define INT8_MAX (127)
```

### INT16_MAX

```c
#define INT16_MAX (32767)
```

### INT32_MAX

```c
#define INT32_MAX (2147483647L)
```

### UINT8_MAX

```c
#define UINT8_MAX (255)
```

### UINT16_MAX

```c
#define UINT16_MAX (65535)
```

### UINT32_MAX

```c
#define UINT32_MAX (4294967295UL)
```

### INT_LEAST8_MIN

```c
#define INT_LEAST8_MIN INT8_MIN
```

### INT_LEAST16_MIN

```c
#define INT_LEAST16_MIN INT16_MIN
```

### INT_LEAST32_MIN

```c
#define INT_LEAST32_MIN INT32_MIN
```

### INT_LEAST8_MAX

```c
#define INT_LEAST8_MAX INT8_MAX
```

### INT_LEAST16_MAX

```c
#define INT_LEAST16_MAX INT16_MAX
```

### INT_LEAST32_MAX

```c
#define INT_LEAST32_MAX INT32_MAX
```

### UINT_LEAST8_MAX

```c
#define UINT_LEAST8_MAX UINT8_MAX
```

### UINT_LEAST16_MAX

```c
#define UINT_LEAST16_MAX UINT16_MAX
```

### UINT_LEAST32_MAX

```c
#define UINT_LEAST32_MAX UINT32_MAX
```

### INT_FAST8_MIN

```c
#define INT_FAST8_MIN INT8_MIN
```

### INT_FAST16_MIN

```c
#define INT_FAST16_MIN INT16_MIN
```

### INT_FAST32_MIN

```c
#define INT_FAST32_MIN INT32_MIN
```

### INT_FAST8_MAX

```c
#define INT_FAST8_MAX INT8_MAX
```

### INT_FAST16_MAX

```c
#define INT_FAST16_MAX INT16_MAX
```

### INT_FAST32_MAX

```c
#define INT_FAST32_MAX INT32_MAX
```

### UINT_FAST8_MAX

```c
#define UINT_FAST8_MAX UINT8_MAX
```

### UINT_FAST16_MAX

```c
#define UINT_FAST16_MAX UINT16_MAX
```

### UINT_FAST32_MAX

```c
#define UINT_FAST32_MAX UINT32_MAX
```

### INTPTR_MIN

```c
#define INTPTR_MIN (-32767-1)
```

### INTPTR_MAX

```c
#define INTPTR_MAX (32767)
```

### UINTPTR_MAX

```c
#define UINTPTR_MAX (65535)
```

### INTMAX_MIN

```c
#define INTMAX_MIN (-2147483647L-1)
```

### INTMAX_MAX

```c
#define INTMAX_MAX (2147483647L)
```

### UINTMAX_MAX

```c
#define UINTMAX_MAX (4294967295UL)
```

### PTRDIFF_MIN

```c
#define PTRDIFF_MIN (-32767-1)
```

### PTRDIFF_MAX

```c
#define PTRDIFF_MAX (32767)
```

### SIG_ATOMIC_MIN

```c
#define SIG_ATOMIC_MIN (0)
```

### SIG_ATOMIC_MAX

```c
#define SIG_ATOMIC_MAX (255)
```

### SIZE_MAX

```c
#define SIZE_MAX (65535u)
```

### INT8_C

```c
#define INT8_C ( c) c
```

### INT16_C

```c
#define INT16_C ( c) c
```

### INT32_C

```c
#define INT32_C ( c) c ## L
```

### UINT8_C

```c
#define UINT8_C ( c) c ## U
```

### UINT16_C

```c
#define UINT16_C ( c) c ## U
```

### UINT32_C

```c
#define UINT32_C ( c) c ## UL
```

### WCHAR_MIN

```c
#define WCHAR_MIN 0
```

### WCHAR_MAX

```c
#define WCHAR_MAX 0xffffffff
```

### WINT_MIN

```c
#define WINT_MIN 0
```

### WINT_MAX

```c
#define WINT_MAX 0xffffffff
```

### INTMAX_C

```c
#define INTMAX_C ( c) c ## L
```

### UINTMAX_C

```c
#define UINTMAX_C ( c) c ## UL
```

## Typedef

### int8_t

```c
typedef signed char int8_t
```

### int16_t

```c
typedef short int int16_t
```

### int32_t

```c
typedef long int int32_t
```

### uint8_t

```c
typedef unsigned char uint8_t
```

### uint16_t

```c
typedef unsigned short int uint16_t
```

### uint32_t

```c
typedef unsigned long int uint32_t
```

### int_least8_t

```c
typedef signed char int_least8_t
```

### int_least16_t

```c
typedef short int int_least16_t
```

### int_least32_t

```c
typedef long int int_least32_t
```

### uint_least8_t

```c
typedef unsigned char uint_least8_t
```

### uint_least16_t

```c
typedef unsigned short int uint_least16_t
```

### uint_least32_t

```c
typedef unsigned long int uint_least32_t
```

### int_fast8_t

```c
typedef signed char int_fast8_t
```

### int_fast16_t

```c
typedef int int_fast16_t
```

### int_fast32_t

```c
typedef long int int_fast32_t
```

### uint_fast8_t

```c
typedef unsigned char uint_fast8_t
```

### uint_fast16_t

```c
typedef unsigned int uint_fast16_t
```

### uint_fast32_t

```c
typedef unsigned long int uint_fast32_t
```

### intptr_t

```c
typedef int intptr_t
```

### uintptr_t

```c
typedef unsigned int uintptr_t
```

### intmax_t

```c
typedef long int intmax_t
```

### uintmax_t

```c
typedef unsigned long int uintmax_t
```
