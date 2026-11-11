# gbdk/far_ptr.h

> Source header: `gbdk-lib/include/gbdk/far_ptr.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`

## Macro Definition

### TO_FAR_PTR

```c
#define TO_FAR_PTR ( ofs, seg ) (((FAR_PTR)seg << 16) | (FAR_PTR)ofs)
```

Macro to obtain a far pointer at compile-time

**Parameters**

- `ofs`: Memory address within the given Segment (Bank)
- `seg`: Segment (Bank) number

**Returns**

A far pointer (type FAR\_PTR)

### FAR_SEG

```c
#define FAR_SEG ( ptr) (((union __far_ptr *)&ptr)->segofs.seg)
```

Macro to get the Segment (Bank) number of a far pointer

**Parameters**

- `ptr`: A far pointer (type FAR_PTR)

**Returns**

Segment (Bank) of the far pointer (type uint16\_t)

### FAR_OFS

```c
#define FAR_OFS ( ptr) (((union __far_ptr *)&ptr)->segofs.ofs)
```

Macro to get the Offset (address) of a far pointer

**Parameters**

- `ptr`: A far pointer (type FAR_PTR)

**Returns**

Offset (address) of the far pointer (type void \*)

### FAR_FUNC

```c
#define FAR_FUNC ( ptr, typ ) ((typ)(((union __far_ptr *)&ptr)->segfn.fn))
```

### FAR_CALL

```c
#define FAR_CALL ( ptr, typ, ... ) (__call_banked_ptr=ptr,((typ)(&__call__banked))(__VA_ARGS__))
```

Macro to call a function at far pointer **ptr** of type **typ**

**Parameters**

- `ptr`: Far pointer of a function to call (type FAR_PTR)
- `typ`: Type to cast the function far pointer to.
- `...`: VA Args list of parameters for the function

**type** should match the definition of the function being called. For example:

```c
// A function in bank 2
#pragma bank 2
uint16_t some_function(uint16_t param1, uint16_t param2) __banked { return 1; };

...
// Code elsewhere, such as unbanked main()
// This type declaration should match the above function
typedef uint16_t (*some_function_t)(uint16_t, uint16_t) __banked;

// Using FAR_CALL() with the above as *ptr*, *typ*, and two parameters.
result = FAR_CALL(some_function, some_function_t, 100, 50);
```

**Returns**

Value returned by the function (if present)

## Typedef

### FAR_PTR

```c
typedef uint32_t FAR_PTR
```

Type for storing a FAR\_PTR

## Function

### __call__banked()

```c
void __call__banked ( void )
```

### to_far_ptr()

```c
uint32_t to_far_ptr ( void * ofs, uint16_t seg )
```

Obtain a far pointer at runtime

**Parameters**

- `ofs`: Memory address within the given Segment (Bank)
- `seg`: Segment (Bank) number

**Returns**

A far pointer (type FAR\_PTR)

## Variable

### __call_banked_ptr

```c
volatile FAR_PTR __call_banked_ptr extern
```

### __call_banked_addr

```c
volatile void* __call_banked_addr extern
```

### __call_banked_bank

```c
volatile uint8_t __call_banked_bank extern
```
