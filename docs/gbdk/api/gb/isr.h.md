# gb/isr.h

> Source header: `gbdk-lib/include/gb/isr.h` (GBDK-2020 v4.5.0)

`#include <stdint.h>`  
`#include <types.h>`

## Macro Definition

### VECTOR_STAT

```c
#define VECTOR_STAT 0x48
```

Address for the STAT interrupt vector

### VECTOR_TIMER

```c
#define VECTOR_TIMER 0x50
```

Address for the TIMER interrupt vector

### VECTOR_SERIAL

```c
#define VECTOR_SERIAL 0x58
```

Address for the SERIAL interrupt vector

### VECTOR_JOYPAD

```c
#define VECTOR_JOYPAD 0x60
```

Address for the JOYPAD interrupt vector

### ISR_VECTOR

```c
#define ISR_VECTOR ( ADDR, FUNC ) static const isr_vector_t AT((ADDR)) __ISR_ ## ADDR = {0xc3, (void *)&(FUNC)};
```

Creates an interrupt vector at the given address for a raw interrupt service routine (which does not use the GBDK ISR dispatcher)

**Parameters**

- `ADDR`: Address of the interrupt vector, any of: VECTOR_STAT, VECTOR_TIMER, VECTOR_SERIAL, VECTOR_JOYPAD
- `FUNC`: ISR function supplied by the user

This cannot be used with the VBLANK interrupt.

Do not use this in combination with interrupt installers that rely on the default GBDK ISR dispatcher such as add\_TIM(), remove\_TIM() (and the same for all other interrupts).

Example:

```c
#include <gb/isr.h>

void TimerISR() __critical __interrupt {
// some ISR code here
}

ISR_VECTOR(VECTOR_TIMER, TimerISR)
```

**See also**

ISR\_NESTED\_VECTOR, set\_interrupts

### ISR_NESTED_VECTOR

```c
#define ISR_NESTED_VECTOR ( ADDR, FUNC ) static const isr_nested_vector_t AT((ADDR)) __ISR_ ## ADDR = {{0xfb, 0xc3}, (void *)&(FUNC)};
```

Creates an interrupt vector at the given address for a raw interrupt service routine allowing nested interrupts

**Parameters**

- `ADDR`: Address of the interrupt vector, any of: VECTOR_STAT, VECTOR_TIMER, VECTOR_SERIAL, VECTOR_JOYPAD
- `FUNC`: ISR function

This cannot be used with the VBLANK interrupt

The LCD STAT vector (VECTOR\_STAT) cannot be used in the same program as `stdio.h` since they install an ISR vector to the same location.

**See also**

ISR\_VECTOR

## Typedef

### isr_vector_t

```c
typedef struct isr_vector_t isr_vector_t
```

### isr_nested_vector_t

```c
typedef struct isr_nested_vector_t isr_nested_vector_t
```
