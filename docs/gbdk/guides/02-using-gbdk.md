# Using GBDK

> Source: https://gbdk.org/docs/api/docs_using_gbdk.html (GBDK-2020 v4.5.0)

## Interrupts

Interrupts allow execution to jump to a different part of your code as soon as an external event occurs - for example the LCD entering the vertical blank period, serial data arriving or the timer reaching its end count. For an example see the irq.c sample project.

Interrupts in GBDK are handled using the functions disable\_interrupts(), enable\_interrupts(), set\_interrupts(uint8\_t ier) and the interrupt service routine (ISR) linkers add\_VBL(), add\_TIM, add\_low\_priority\_TIM, add\_LCD, add\_SIO and add\_JOY which add interrupt handlers for the vertical blank, timer, LCD, serial link and joypad interrupts respectively.

Since an interrupt can occur at any time an Interrupt Service Request (ISR) cannot take any arguments or return anything. Its only way of communicating with the greater program is through the global variables. When interacting with those shared ISR global variables from main code outside the interrupt, it is a good idea to wrap them in a `critical {}` section in case the interrupt occurs and modifies the variable while it is being used.

Interrupts should be disabled before adding ISRs. To use multiple interrupts, _logical OR_ the relevant IFLAGs together.

ISRs should be kept as small and short as possible, do not write an ISR so long that the Game Boy hardware spends all of its time servicing interrupts and has no time spare for the main code.

For more detail on the Game Boy interrupts consider reading about them in the Pandocs.

### Available Interrupts

The GameBoy hardware can generate 5 types of interrupts. Custom Interrupt Service Routines (ISRs) can be added in addition to the built-in ones available in GBDK.

-   VBL : LCD Vertical Blanking period start
    -   The default VBL ISR is installed automatically.
        -   See add\_VBL() and remove\_VBL()
-   LCD : LCDC status (such as the start of a horizontal line)
    -   See add\_LCD() and remove\_LCD()
    -   Example project: `lcd_isr_wobble`
-   TIM : Timer overflow
    -   See add\_TIM() (or add\_low\_priority\_TIM() ) and remove\_TIM()
    -   Example project: `tim`
-   SIO : Serial Link I/O transfer end
    -   The default SIO ISR gets installed automatically if any of the standard SIO calls are used (send\_byte(), receive\_byte()).
    -   Once installed the default SIO ISR cannot be removed. Only secondary chained SIO ISRs (added with add\_SIO() ) can be removed.
    -   See add\_SIO() and remove\_SIO()
    -   Example project: `comm`
-   JOY : Transition from high to low of a joypad button
    -   See add\_JOY() and remove\_JOY()

### Adding your own interrupt handler

It is possible to install your own interrupt handlers (in C or in assembly) for any of these interrupts. Up to 4 chained handlers may be added, with the last added being called last. If the remove\_VBL() function is to be called, only three may be added for VBL.

Interrupt handlers are called in sequence. To install a new interrupt handler, do the following:

1.  Write a function (say foo()) that takes no parameters, and that returns nothing. Remember that the code executed in an interrupt handler must be short.
2.  Inside a `__critical { ... }` section, install your interrupt handling routines using the add\_XXX() function, where XXX is the interrupt that you want to handle.
3.  Enable interrupts for the IRQ you want to handle, using the set\_interrupts() function. Note that the VBL interrupt is already enabled before the main() function is called. If you want to set the interrupts before main() is called, you must install an initialization routine.

See the `irq` example project for additional details for a complete example.

### Using your own Interrupt Dispatcher

If you want to use your own Interrupt Dispatcher instead of the GBDK chained dispatcher (for improved performance), then don't call the `add_...()` function for the respective interrupt and its dispatcher won't be installed.

-   Exception: the VBL dispatcher will always be linked in at compile time.
-   For the SIO interrupt, also do not make any standard SIO calls to avoid having its dispatcher installed.

Then, ISR\_VECTOR() or ISR\_NESTED\_VECTOR() can be used to install a custom ISR handler.

### Returning from Interrupts and STAT mode

By default when an Interrupt handler completes and is ready to exit it will check STAT\_REG and only return at the BEGINNING of either LCD Mode 0 or Mode 1. This helps prevent graphical glitches caused when an ISR interrupts a graphics operation in one mode but returns in a different mode for which that graphics operation is not allowed.

You can change this behavior using nowait\_int\_handler() which does not check STAT\_REG before returning. Also see wait\_int\_handler().

## What GBDK does automatically and behind the scenes

### NES console

For implementation details on the NES console in GBDK, see the NES entry in Supported Consoles & Cross Compiling

### OAM (VRAM Sprite Attribute Table)

GBDK sets up a Shadow OAM which gets copied automatically to the hardware OAM by the default V-Blank ISR. The Shadow OAM allows updating sprites without worrying about whether it is safe to write to them or not based on the hardware LCD mode.

### Graphics Tile Maps and Data on Startup

By default for the Game Boy GBDK assigns:

-   Background and Window Tile data starting at `0x8800`
-   Background Tile Map starting at `0x9800`
-   Window Tile Map starting at `0x9C00`
-   Sprites to `8x8` mode

### Font tiles when using stdio.h

Including stdio.h and using functions such as printf() will use a large number of the background tiles for font characters. If stdio.h is not included then that space will be available for use with other tiles instead.

### Default Interrupt Service Handlers (ISRs)

-   V-Blank: A default V-Blank ISR is installed on startup which copies the Shadow OAM to the hardware OAM and increments the global sys\_time variable once per frame.
-   Serial Link I/O: If any of the GBDK serial link functions are used such as send\_byte() and receive\_byte(), the default SIO serial link handler will be installed automatically at compile-time.
-   APA Graphics Mode: When this mode is used (via drawing.h) a custom LCD ISR handler will be installed (`drawing_lcd`). Changing the mode to (`mode(M_TEXT_OUT);`) will cause them to be de-installed. These handlers are used to change the tile data source at start-of-frame and mid-frame so that 384 background tiles can be used instead of the typical 256.

### Ensuring Safe Access to Graphics Memory

There are certain times during each video frame when memory and registers relating to graphics are "busy" and should not be read or written to (otherwise there may be corrupt or dropped data). GBDK handles this automatically for most graphics related API calls. It also ensures that ISR handlers return in such a way that if they interrupted a graphics access then it will only resume when access is allowed.

The ISR return behavior can be turned off using the nowait\_int\_handler.

For more details see the related Pandocs section: https://gbdev.io/pandocs/Accessing\_VRAM\_and\_OAM.html

## Compression

For programs that would benefit from compression GBDK includes the gbcompress utility and companion API functions.

In addition to the built-in compression unapack is another option:

-   UnaPACK aPack decompression by Toxa: https://github.com/untoxa
-   apultra aPack compression: https://github.com/emmanuel-marty/apultra

Another way to save space is using 1 bit-per-pixel (bpp) tile pattern data instead of 2-bpp or 4-bpp data. This can reduce the ROM size for groups of tiles which only require two shades of color.

-   See: set\_1bpp\_colors(), set\_bkg\_1bpp\_data(), set\_win\_1bpp\_data(), set\_sprite\_1bpp\_data()

Use of 1-bpp tile pattern data may be combined with the compression described above to save even more space, however that approach requires using an intermediary RAM buffer before the tile pattern data can be written to VRAM with the set\_\*\_1bpp\_data() functions.

## Copying Functions to RAM and HIRAM

See the `ram_function` example project included with GBDK which demonstrates copying functions to RAM and HIRAM.

`Warning!` Copying of functions is generally not safe since they may contain jumps to absolute addresses that will not be converted to match the new location.

It is possible to copy functions to RAM and HIRAM (using the memcpy() and hiramcpy() functions), and execute them from C. Ensure you have enough free space in RAM or HIRAM for copying a function.

There are basically two ways for calling a function located in RAM, HIRAM, or ROM:

-   Declare a pointer-to-function variable, and set it to the address of the function to call.
-   Declare the function as extern, and set its address at link time using the -Wl-gXXX=# flag (where XXX is the name of the function, and # is its address).

The second approach is slightly more efficient. Both approaches are demonstrated in the `ram_function.c` example.

## Mixing C and Assembly

_The following is primarily oriented toward the Game Boy and related clones (sm83 devices), other targets such as sms/gg may vary._

You can mix C and assembly (ASM) in two ways as described below.

-   For additional detail see the links\_sdcc\_docs and SDCC Calling Conventions.

### Inline ASM within C source files

-   The optional `NAKED` keyword may be used to indicate that the funtion setup and return should have no handling done by the compiler, and will instead be handled entirely by user code.
-   If the entire function preserves some registers the optional `PRESERVES_REGS` keyword may be used as additional hinting for the compiler. For example `PRESERVES_REGS(b, c)`. By default it is assumed by the compiler that no registers are preserved.

Example:  

   \_\_asm\_\_("nop");

Another Example:  

  void some\_c\_function() 
  {
    // Optionally do something
    \_\_asm
        (ASM code goes here)
    \_\_endasm;
  }

### In Separate ASM files

It is possible to assemble and link files written in ASM alongside files written in C.

-   A C identifier `i` will be called `_i` in assembly.
-   Parameters will be passed, registers saved and results returned in a manner based on the SDCC Calling Convention used and how the function is declared.
-   Assembly identifiers are exported using the `.globl` directive.
-   See global.s for examples of hardware register deginitions.

Here is an example of how to mix assembly with C:

`main.c`

uint16\_t add(uint16\_t, uint16\_t);

main()
{
  uint16\_t i;

  i = add(1, 3);
}

`add.s`

.globl \_add

.area \_CODE    
\_add:         ; uint16\_t add(uint16\_t First, uint16\_t Second)
              ;
              ; In this particular example there is no use and modification of the stack
              ; No need to save and restore registers
              ;
              ; For calling convention \_\_sdcccall(1)
              ; - first 16 bit param is passed in DE
              ; - second 16 bit param is passed in BC

; Load Second Parameter ("Second") into HL
ld  l,  c
ld  h,  b

; Add Parameters "Second" + "First"
add hl, de

; Return result in BC
ld  c,  l
ld  b,  h
ret           ; 16 bit values are returned in BC

## Including binary files in C source with incbin

Data from binary files can be included in C source files as a const array using the INCBIN() macro.

See the `incbin` example project for a demo of how to use it.

## Known Issues and Limitations

### SDCC

-   Const arrays declared with `somevar[n] = {x}` will **NOT** get initialized with value `x`. This may change when the SDCC RLE initializer is fixed. Use memset for now if you need it.
-   SDCC banked calls and far\_pointers in GBDK only save one byte for the ROM bank, so for example they are limited to **bank 15** max for MBC1 and **bank 255** max for MBC5. See banked\_calls for more details.
-   In SDCC **pre-initializing a variable** assigned to SRAM with `-Wf-ba*` will force that variable to be in WRAM instead.
    -   The following is a workaround for initializing a variable in SRAM. It assignes value `0xA5` to a variable in `bank 0` and assigned to address `0xA000` using the AT() directive:

        // Workaround for initializing variable in SRAM
        // (MBC RAM and Bank needs to get enabled during GSINIT loading)
        static uint8\_t AT(0x0000) \_\_rRAMG = 0x0a; // Enable SRAM
        static uint8\_t AT(0x4000) \_\_rRAMB = 0x00; // Set SRAM bank 0
        // Now SRAM is enabled so the variable can get initialized
        uint8\_t AT(0xA000)      initialized\_sram\_var = 0xA5u;
