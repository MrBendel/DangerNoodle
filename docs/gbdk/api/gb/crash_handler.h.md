# gb/crash_handler.h

> Source header: `gbdk-lib/include/gb/crash_handler.h` (GBDK-2020 v4.5.0)

When crash\_handler.h is included, a crash dump screen will be displayed if the CPU executes uninitalized memory (with a value of 0xFF, the opcode for RST 38). A handler is installed for RST 38 that calls \_\_HandleCrash().

```c
#include <gb/crash_handler.h>
```

Also see the `crash` example project included with gbdk.

## Function

### __HandleCrash()

```c
void __HandleCrash ( void )
```

Display the crash dump screen.

See the intro for this file for more details.
