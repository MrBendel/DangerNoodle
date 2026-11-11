# setjmp.h

> Source header: `gbdk-lib/include/setjmp.h` (GBDK-2020 v4.5.0)

## Macro Definition

### SP_SIZE

```c
#define SP_SIZE 1
```

### BP_SIZE

```c
#define BP_SIZE 0
```

### SPX_SIZE

```c
#define SPX_SIZE 0
```

### BPX_SIZE

```c
#define BPX_SIZE SPX_SIZE
```

### RET_SIZE

```c
#define RET_SIZE 2
```

### setjmp

```c
#define setjmp ( jump_buf) __setjmp(jump_buf)
```

## Typedef

### jmp_buf

```c
typedef unsigned char jmp_buf[RET_SIZE+SP_SIZE+BP_SIZE+SPX_SIZE+BPX_SIZE]
```

## Function

### __setjmp()

```c
int __setjmp ( jmp_buf )
```

### longjmp()

```c
_Noreturn void longjmp ( jmp_buf , int )
```
