# stddef.h

> Source header: `gbdk-lib/include/stddef.h` (GBDK-2020 v4.5.0)

## Macro Definition

### NULL

```c
#define NULL (void *)0
```

### __PTRDIFF_T_DEFINED

```c
#define __PTRDIFF_T_DEFINED
```

### __SIZE_T_DEFINED

```c
#define __SIZE_T_DEFINED
```

### __WCHAR_T_DEFINED

```c
#define __WCHAR_T_DEFINED
```

### offsetof

```c
#define offsetof ( s, m ) __builtin_offsetof (s, m)
```

## Typedef

### ptrdiff_t

```c
typedef int ptrdiff_t
```

### size_t

```c
typedef unsigned int size_t
```

### wchar_t

```c
typedef unsigned long int wchar_t
```
