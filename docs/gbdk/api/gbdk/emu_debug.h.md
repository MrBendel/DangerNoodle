# gbdk/emu_debug.h

> Source header: `gbdk-lib/include/gbdk/emu_debug.h` (GBDK-2020 v4.5.0)

`#include <types.h>`

## Macro Definition

### EMU_MESSAGE

```c
#define EMU_MESSAGE ( message_text) EMU_MESSAGE1(EMU_MACRONAME(__LINE__), message_text)
```

Macro to display a message in the emulator debug message window

**Parameters**

- `message_text`: Quoted text string to display in the debug message window

The following special parameters can be used when bracketed with "%" characters.

-   CPU registers: AF, BC, DE, HL, SP, PC, B, C, D, E, H, L, A, ZERO, ZF, Z, CARRY, CY, IME, ALLREGS
-   Other state values: ROMBANK, XRAMBANK, SRAMBANK, WRAMBANK, VRAMBANK, TOTALCLKS, LASTCLKS, CLKS2VBLANK

Example: print a message along with the currently active ROM bank.

```c
EMU_MESSAGE("Current ROM Bank is: %ROMBANK%");
```

See the BGB Manual for more information ("expressions, breakpoint conditions, and debug messages") http://bgb.bircd.org/manual.html#expressions

**See also**

EMU\_PROFILE\_BEGIN(), EMU\_PROFILE\_END()

### BGB_MESSAGE

```c
#define BGB_MESSAGE ( message_text) EMU_MESSAGE(message_text)
```

### EMU_PROFILE_BEGIN

```c
#define EMU_PROFILE_BEGIN ( MSG) EMU_MESSAGE_SUFFIX(MSG, "%ZEROCLKS%");
```

Macro to **Start** a profiling block for the emulator (BGB, Emulicious, etc)

**Parameters**

- `MSG`: Quoted text string to display in the debug message window along with the result

To complete the profiling block and print the result call EMU\_PROFILE\_END.

**See also**

EMU\_PROFILE\_END(), EMU\_MESSAGE()

### BGB_PROFILE_BEGIN

```c
#define BGB_PROFILE_BEGIN ( MSG) EMU_PROFILE_BEGIN(MSG)
```

### EMU_PROFILE_END

```c
#define EMU_PROFILE_END ( MSG) EMU_MESSAGE_SUFFIX(MSG,"%-8+LASTCLKS%");
```

Macro to **End** a profiling block and print the results in the emulator debug message window

**Parameters**

- `MSG`: Quoted text string to display in the debug message window along with the result

This should only be called after a previous call to EMU\_PROFILE\_BEGIN()

The results are in Emulator clock units, which are "1 nop in \[CGB\] doublespeed mode".

So when running in Normal Speed mode (i.e. non-CGB doublespeed) the printed result should be **divided by 2** to get the actual ellapsed cycle count.

If running in CB Double Speed mode use the below call instead, it correctly compensates for the speed difference. In this scenario, the result does **not need to be divided by 2** to get the ellapsed cycle count.

```c
EMU_MESSAGE("NOP TIME: %-4+LASTCLKS%");
```

**See also**

EMU\_PROFILE\_BEGIN(), EMU\_MESSAGE()

### BGB_PROFILE_END

```c
#define BGB_PROFILE_END ( MSG) EMU_PROFILE_END(MSG)
```

### EMU_TEXT

```c
#define EMU_TEXT ( MSG) EMU_MESSAGE(MSG)
```

### BGB_TEXT

```c
#define BGB_TEXT ( MSG) EMU_TEXT(MSG)
```

### BGB_profiler_message

```c
#define BGB_profiler_message EMU_profiler_message()
```

### BGB_printf

```c
#define BGB_printf ( ...) EMU_printf(__VA_ARGS__)
```

### EMU_BREAKPOINT

```c
#define EMU_BREAKPOINT __asm__("ld b, b");
```

The Emulator will break into debugger when encounters this line

### BGB_BREAKPOINT

```c
#define BGB_BREAKPOINT EMU_BREAKPOINT
```

## Function

### EMU_profiler_message()

```c
void EMU_profiler_message ( void )
```

Display preset debug information in the Emulator debug messages window.

This function is equivalent to:

```c
EMU_MESSAGE("PROFILE,%(SP+$0)%,%(SP+$1)%,%A%,%TOTALCLKS%,%ROMBANK%,%WRAMBANK%");
```

### EMU_printf()

```c
void EMU_printf ( const char * format, ... )
```

Print the string and arguments given by format to the emulator debug message window

**Parameters**

- `format`: The format string as per printf

Does not return the number of characters printed. Currently supported:

-   %hx (char as hex)
-   %hu (unsigned char)
-   %hd (signed char)
-   %c (character)  
    
-   %u (unsigned int)
-   %d (signed int)
-   %x (unsigned int as hex)
-   %s (string)

**Note**

Variables for the following 8-bit formats **MUST** be cast to their type when passed to EMU\_printf()

-   %hx (char)
-   %hu (unsigned char)
-   %hd (signed char)

However variables for the following 8-bit format **MUST NOT** be cast to their type when passed to EMU\_printf()

-   %c (char)

This behavior is **different** than for sprintf(), which does require %c format char variables to be explicitly cast.

Currently supported in the Emulicious emulator, may be supported by bgb

### EMU_fmtbuf()

```c
void EMU_fmtbuf ( const unsigned char * format, void * data )
```

Print the string and arguments in the buffer buffer by the pointer given by format to the emulator debug message window

**Parameters**

- `format`: The format string as per printf
- `data`: Buffer containing arguments, for example some struct

**See also**

EMU\_printf for the format string description

Currently supported in the Emulicious emulator

## Variable

### b

```c
void b
```

### c

```c
void c
```
