# asm/sm83/stdarg.h

> Source header: `gbdk-lib/include/asm/sm83/stdarg.h` (GBDK-2020 v4.5.0)

## Macro Definition

### va_start

```c
#define va_start ( list, last ) list = (unsigned char *)&last + sizeof(last)
```

### va_arg

```c
#define va_arg ( list, type ) *((type *)((list += sizeof(type)) - sizeof(type)))
```

### va_end

```c
#define va_end ( list)
```

## Typedef

### va_list

```c
typedef unsigned char* va_list
```
