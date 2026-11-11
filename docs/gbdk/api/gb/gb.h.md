# gb/gb.h

> Source header: `gbdk-lib/include/gb/gb.h` (GBDK-2020 v4.5.0)

`#include <types.h>`  
`#include <stdint.h>`  
`#include <gbdk/version.h>`  
`#include <gb/hardware.h>`

## Macro Definition

### NINTENDO

```c
#define NINTENDO
```

### SYSTEM_60HZ

```c
#define SYSTEM_60HZ 0x00
```

### SYSTEM_50HZ

```c
#define SYSTEM_50HZ 0x01
```

### GAMEBOY

```c
#define GAMEBOY
```

### J_UP

```c
#define J_UP 0x04U
```

Joypad bits. A logical OR of these is used in the wait\_pad and joypad functions. For example, to see if the B button is pressed try

uint8\_t keys; keys = joypad(); if (keys & J\_B) { ... }

**See also**

joypad

### J_DOWN

```c
#define J_DOWN 0x08U
```

### J_LEFT

```c
#define J_LEFT 0x02U
```

### J_RIGHT

```c
#define J_RIGHT 0x01U
```

### J_A

```c
#define J_A 0x10U
```

### J_B

```c
#define J_B 0x20U
```

### J_SELECT

```c
#define J_SELECT 0x40U
```

### J_START

```c
#define J_START 0x80U
```

### M_DRAWING

```c
#define M_DRAWING 0x01U
```

Screen modes. Normally used by internal functions only.

**See also**

mode()

### M_TEXT_OUT

```c
#define M_TEXT_OUT 0x02U
```

### M_TEXT_INOUT

```c
#define M_TEXT_INOUT 0x03U
```

### M_NO_SCROLL

```c
#define M_NO_SCROLL 0x04U
```

Set this in addition to the others to disable scrolling

If scrolling is disabled, the cursor returns to (0,0)

**See also**

mode()

### M_NO_INTERP

```c
#define M_NO_INTERP 0x08U
```

Set this to disable interpretation

**See also**

mode()

### S_BANK

```c
#define S_BANK 0x08U
```

If this bit set clear, the tile from the second VRAM bank is used

**See also**

set\_sprite\_prop()

### S_PALETTE

```c
#define S_PALETTE 0x10U
```

If this is set, sprite colours come from OBJ1PAL. Else they come from OBJ0PAL

**See also**

set\_sprite\_prop().

### S_FLIPX

```c
#define S_FLIPX 0x20U
```

If set the sprite will be flipped horizontally.

**See also**

set\_sprite\_prop()

### S_FLIPY

```c
#define S_FLIPY 0x40U
```

If set the sprite will be flipped vertically.

**See also**

set\_sprite\_prop()

### S_PRIORITY

```c
#define S_PRIORITY 0x80U
```

If this bit is clear, then the sprite will be displayed on top of the background and window.

**See also**

set\_sprite\_prop()

### S_PAL

```c
#define S_PAL ( n) n
```

Defines how palette number is encoded in OAM. Required for the png2asset tool's metasprite output.

### EMPTY_IFLAG

```c
#define EMPTY_IFLAG 0x00U
```

Disable calling of interrupt service routines

### VBL_IFLAG

```c
#define VBL_IFLAG 0x01U
```

VBlank Interrupt occurs at the start of the vertical blank.

During this period the video ram may be freely accessed.

**See also**

set\_interrupts(),

add\_VBL

### LCD_IFLAG

```c
#define LCD_IFLAG 0x02U
```

LCD Interrupt when triggered by the STAT register.

**See also**

set\_interrupts(),

add\_LCD

### TIM_IFLAG

```c
#define TIM_IFLAG 0x04U
```

Timer Interrupt when the timer TIMA\_REG overflows.

**See also**

set\_interrupts(),

add\_TIM

### SIO_IFLAG

```c
#define SIO_IFLAG 0x08U
```

Serial Link Interrupt occurs when the serial transfer has completed.

**See also**

set\_interrupts(),

add\_SIO

### JOY_IFLAG

```c
#define JOY_IFLAG 0x10U
```

Joypad Interrupt occurs on a transition of the keypad.

**See also**

set\_interrupts(),

add\_JOY

### DMG_BLACK

```c
#define DMG_BLACK 0x03
```

### DMG_DARK_GRAY

```c
#define DMG_DARK_GRAY 0x02
```

### DMG_LITE_GRAY

```c
#define DMG_LITE_GRAY 0x01
```

### DMG_WHITE

```c
#define DMG_WHITE 0x00
```

### DMG_PALETTE

```c
#define DMG_PALETTE ( C0, C1, C2, C3 ) ((uint8_t)((((C3) & 0x03) << 6) | (((C2) & 0x03) << 4) | (((C1) & 0x03) << 2) | ((C0) & 0x03)))
```

Macro to create a DMG palette from 4 colors

**Parameters**

- `C0`: Color for Index 0
- `C1`: Color for Index 1
- `C2`: Color for Index 2
- `C3`: Color for Index 3

The resulting format is four greyscale colors packed into a single unsigned byte.

Example:

```c
BGP_REG = DMG_PALETTE(DMG_BLACK, DMG_DARK_GRAY, DMG_LITE_GRAY, DMG_WHITE);
```

**See also**

OBP0\_REG, OBP1\_REG, BGP\_REG

DMG\_BLACK, DMG\_DARK\_GRAY, DMG\_LITE\_GRAY, DMG\_WHITE

### SCREENWIDTH

```c
#define SCREENWIDTH DEVICE_SCREEN_PX_WIDTH
```

Width of the visible screen in pixels.

### SCREENHEIGHT

```c
#define SCREENHEIGHT DEVICE_SCREEN_PX_HEIGHT
```

Height of the visible screen in pixels.

### MINWNDPOSX

```c
#define MINWNDPOSX DEVICE_WINDOW_PX_OFFSET_X
```

The Minimum X position of the Window Layer (Left edge of screen)

**See also**

move\_win()

### MINWNDPOSY

```c
#define MINWNDPOSY DEVICE_WINDOW_PX_OFFSET_Y
```

The Minimum Y position of the Window Layer (Top edge of screen)

**See also**

move\_win()

### MAXWNDPOSX

```c
#define MAXWNDPOSX (DEVICE_WINDOW_PX_OFFSET_X + DEVICE_SCREEN_PX_WIDTH - 1)
```

The Maximum X position of the Window Layer (Right edge of screen)

**See also**

move\_win()

### MAXWNDPOSY

```c
#define MAXWNDPOSY (DEVICE_WINDOW_PX_OFFSET_Y + DEVICE_SCREEN_PX_HEIGHT - 1)
```

The Maximum Y position of the Window Layer (Bottom edge of screen)

**See also**

move\_win()

### DMG_TYPE

```c
#define DMG_TYPE 0x01
```

Hardware Model: Original GB or Super GB.

**See also**

\_cpu

### MGB_TYPE

```c
#define MGB_TYPE 0xFF
```

Hardware Model: Pocket GB or Super GB 2.

**See also**

\_cpu

### CGB_TYPE

```c
#define CGB_TYPE 0x11
```

Hardware Model: Color GB.

**See also**

\_cpu

### GBA_NOT_DETECTED

```c
#define GBA_NOT_DETECTED 0x00
```

Hardware Model: DMG, CGB or MGB.

**See also**

\_cpu, \_is\_GBA

### GBA_DETECTED

```c
#define GBA_DETECTED 0x01
```

Hardware Model: GBA.

**See also**

\_cpu, \_is\_GBA

### DEVICE_SUPPORTS_COLOR

```c
#define DEVICE_SUPPORTS_COLOR (_cpu == CGB_TYPE)
```

Macro returns TRUE if device supports color

### VBL_DONE

```c
#define VBL_DONE _vbl_done
```

### IO_IDLE

```c
#define IO_IDLE 0x00U
```

Serial Link IO is completed

### IO_SENDING

```c
#define IO_SENDING 0x01U
```

Serial Link Sending data

### IO_RECEIVING

```c
#define IO_RECEIVING 0x02U
```

Serial Link Receiving data

### IO_ERROR

```c
#define IO_ERROR 0x04U
```

Serial Link Error

### CURRENT_BANK

```c
#define CURRENT_BANK _current_bank
```

### BANK

```c
#define BANK ( VARNAME) ( (uint8_t) & __bank_ ## VARNAME )
```

Obtains the **bank number** of VARNAME

**Parameters**

- `VARNAME`: Name of the variable which has a __bank_VARNAME companion symbol which is adjusted by bankpack

Use this to obtain the bank number from a bank reference created with BANKREF().

**See also**

BANKREF\_EXTERN(), BANKREF()

### BANKREF

```c
#define BANKREF ( VARNAME)
```

**Value:**
```c
void __func_ ## VARNAME(void) __banked __naked { \
__asm \
.local b___func_ ## VARNAME \
___bank_ ## VARNAME = b___func_ ## VARNAME \
.globl ___bank_ ## VARNAME \
__endasm; \
}
```

Creates a reference for retrieving the bank number of a variable or function

**Parameters**

- `VARNAME`: Variable name to use, which may be an existing identifier

**See also**

BANK() for obtaining the bank number of the included data.

More than one `BANKREF()` may be created per file, but each call should always use a unique VARNAME.

Use BANKREF\_EXTERN() within another source file to make the variable and it's data accesible there.

### BANKREF_EXTERN

```c
#define BANKREF_EXTERN ( VARNAME) extern const void __bank_ ## VARNAME;
```

Creates extern references for accessing a BANKREF() generated variable.

**Parameters**

- `VARNAME`: Name of the variable used with BANKREF()

This makes a BANKREF() reference in another source file accessible in the current file for use with BANK().

**See also**

BANKREF(), BANK()

### SWITCH_ROM

```c
#define SWITCH_ROM ( b) (_current_bank = (b), rROMB0 = (b))
```

Makes default platform MBC switch the active ROM bank

**Parameters**

- `b`: ROM bank to switch to (max 255)

-   When used with MBC1 the max bank is Bank 31 (512K).
-   When used with MBC5 the max bank is Bank 255 (4MB).
-   To use the full 8MB size of MBC5 see SWITCH\_ROM\_MBC5\_8M().

-   For MBC1 some banks in it's range are unavailable (typically 0x20, 0x40, 0x60).

**Note**

Using SWITCH\_ROM\_MBC5\_8M() should not be mixed with using SWITCH\_ROM\_MBC5() and SWITCH\_ROM().

**See also**

SWITCH\_ROM\_MBC1, SWITCH\_ROM\_MBC5, SWITCH\_ROM\_MEGADUCK

### SWITCH_RAM

```c
#define SWITCH_RAM ( b) (rRAMB = (b))
```

Switches SRAM bank on MBC1 and other compatible MBCs

**Parameters**

- `b`: SRAM bank to switch to

Before switching SRAM banks enable it using ENABLE\_RAM

**See also**

SWITCH\_RAM\_MBC1, SWITCH\_RAM\_MBC5

### ENABLE_RAM

```c
#define ENABLE_RAM (rRAMG = 0x0A)
```

Enables SRAM on MBC1 and other compatible MBCs

### DISABLE_RAM

```c
#define DISABLE_RAM (rRAMG = 0x00)
```

Disables SRAM on MBC1 and other compatible MBCs

### SWITCH_ROM_MEGADUCK

```c
#define SWITCH_ROM_MEGADUCK ( b) SWITCH_ROM(b)
```

Makes MEGADUCK MBC switch the active ROM bank

**Parameters**

- `b`: ROM bank to switch to (max 3 for 64K, or 7 for 128K)

### SWITCH_ROM_MBC1

```c
#define SWITCH_ROM_MBC1 ( b) SWITCH_ROM(b)
```

Makes MBC1 and other compatible MBCs switch the active ROM bank

**Parameters**

- `b`: ROM bank to switch to

For MBC1 some banks in it's range are unavailable (typically 0x20, 0x40, 0x60).

See pandocs for more details https://gbdev.io/pandocs/MBC1

### SWITCH_RAM_MBC1

```c
#define SWITCH_RAM_MBC1 ( b) SWITCH_RAM(b)
```

Switches SRAM bank on MBC1 and other compatible MBCs

**Parameters**

- `b`: SRAM bank to switch to

Before switching SRAM banks enable it using ENABLE\_RAM

**See also**

SWITCH\_RAM, SWITCH\_RAM\_MBC5

### ENABLE_RAM_MBC1

```c
#define ENABLE_RAM_MBC1 ENABLE_RAM
```

Enables SRAM on MBC1

### DISABLE_RAM_MBC1

```c
#define DISABLE_RAM_MBC1 DISABLE_RAM
```

Disables SRAM on MBC1

### SWITCH_16_8_MODE_MBC1

```c
#define SWITCH_16_8_MODE_MBC1 (*(volatile uint8_t *)0x6000 = 0x00)
```

### SWITCH_4_32_MODE_MBC1

```c
#define SWITCH_4_32_MODE_MBC1 (*(volatile uint8_t *)0x6000 = 0x01)
```

### SWITCH_ROM_MBC5

```c
#define SWITCH_ROM_MBC5 ( b) (_current_bank = (b), rROMB1 = 0, rROMB0 = (b))
```

Makes MBC5 switch to the active ROM bank

**Parameters**

- `b`: ROM bank to switch to (max 255)

Supports up to ROM bank 255 (4 MB).

SWITCH\_ROM\_MBC5\_8M may be used if the full 8MB size is needed.

**Note**

Using SWITCH\_ROM\_MBC5\_8M() should not be mixed with using SWITCH\_ROM\_MBC5() and SWITCH\_ROM().

Note the order used here. Writing the other way around on a MBC1 always selects bank 1

### SWITCH_ROM_MBC5_8M

```c
#define SWITCH_ROM_MBC5_8M ( b) (rROMB1 = ((uint16_t)(b) >> 8), rROMB0 = (b))
```

Makes MBC5 to switch the active ROM bank using the full 8MB size.

**See also**

CURRENT\_BANK

**Parameters**

- `b`: ROM bank to switch to

This is an alternate to SWITCH\_ROM\_MBC5 which is limited to 4MB.

Note:

-   Banked SDCC calls are not supported if you use this macro.
-   The active bank number is not tracked by CURRENT\_BANK if you use this macro.
-   Using SWITCH\_ROM\_MBC5\_8M() should not be mixed with using SWITCH\_ROM\_MBC5() and SWITCH\_ROM().

Note the order used here. Writing the other way around on a MBC1 always selects bank 1

### SWITCH_RAM_MBC5

```c
#define SWITCH_RAM_MBC5 ( b) SWITCH_RAM(b)
```

Switches SRAM bank on MBC5

**Parameters**

- `b`: SRAM bank to switch to

Before switching SRAM banks enable it using ENABLE\_RAM

### ENABLE_RAM_MBC5

```c
#define ENABLE_RAM_MBC5 ENABLE_RAM
```

Enables SRAM on MBC5

### DISABLE_RAM_MBC5

```c
#define DISABLE_RAM_MBC5 DISABLE_RAM
```

Disables SRAM on MBC5

### DISPLAY_ON

```c
#define DISPLAY_ON LCDC_REG|=LCDCF_ON
```

Turns the display back on.

**See also**

display\_off, DISPLAY\_OFF

### DISPLAY_OFF

```c
#define DISPLAY_OFF display_off();
```

Turns the display off

Waits until the VBL before turning the display off.

**See also**

display\_off, DISPLAY\_ON

### HIDE_LEFT_COLUMN

```c
#define HIDE_LEFT_COLUMN
```

Does nothing for GB

### SHOW_LEFT_COLUMN

```c
#define SHOW_LEFT_COLUMN
```

Does nothing for GB

### SET_BORDER_COLOR

```c
#define SET_BORDER_COLOR ( C)
```

Does nothing for GB

### SHOW_BKG

```c
#define SHOW_BKG LCDC_REG|=LCDCF_BGON
```

Turns on the background layer. Sets bit 0 of the LCDC register to 1.

Doesn't work in CGB mode - the bit is reused to control sprite priority over background and window layers instead.

-   If 1 (SHOW\_BKG), everything works as usual.
-   If 0 (HIDE\_BKG), all sprites are always drawn over background and window, ignoring any other priority settings.

### HIDE_BKG

```c
#define HIDE_BKG LCDC_REG&=~LCDCF_BGON
```

Turns off the background layer. Sets bit 0 of the LCDC register to 0.

Doesn't work in CGB mode - the bit is reused to control sprite priority over background and window layers instead.

-   If 1 (SHOW\_BKG), everything works as usual.
-   If 0 (HIDE\_BKG), all sprites are always drawn over background and window, ignoring any other priority settings.

### SHOW_WIN

```c
#define SHOW_WIN LCDC_REG|=LCDCF_WINON
```

Turns on the Window layer Sets bit 5 of the LCDC register to 1.

This only controls Window visibility. If either the Background layer (which the window is part of) or the Display are not turned then the Window contents will not be visible. Those can be turned on using SHOW\_BKG and DISPLAY\_ON.

### HIDE_WIN

```c
#define HIDE_WIN LCDC_REG&=~LCDCF_WINON
```

Turns off the window layer. Clears bit 5 of the LCDC register to 0.

### SHOW_SPRITES

```c
#define SHOW_SPRITES LCDC_REG|=LCDCF_OBJON
```

Turns on the sprites layer. Sets bit 1 of the LCDC register to 1.

### HIDE_SPRITES

```c
#define HIDE_SPRITES LCDC_REG&=~LCDCF_OBJON
```

Turns off the sprites layer. Clears bit 1 of the LCDC register to 0.

**See also**

hide\_sprite, hide\_sprites\_range

### SPRITES_8x16

```c
#define SPRITES_8x16 LCDC_REG|=LCDCF_OBJ16
```

Sets sprite size to 8x16 pixels, two tiles one above the other. Sets bit 2 of the LCDC register to 1.

### SPRITES_8x8

```c
#define SPRITES_8x8 LCDC_REG&=~LCDCF_OBJ16
```

Sets sprite size to 8x8 pixels, one tile. Clears bit 2 of the LCDC register to 0.

### COMPAT_PALETTE

```c
#define COMPAT_PALETTE ( C0, C1, C2, C3 ) ((uint8_t)(((C3) << 6) | ((C2) << 4) | ((C1) << 2) | (C0)))
```

### set_bkg_2bpp_data

```c
#define set_bkg_2bpp_data set_bkg_data
```

### set_tile_map

```c
#define set_tile_map set_bkg_tiles
```

### set_tile_submap

```c
#define set_tile_submap set_bkg_submap
```

### set_tile_xy

```c
#define set_tile_xy set_bkg_tile_xy
```

### set_attribute_xy

```c
#define set_attribute_xy set_bkg_attribute_xy
```

### set_sprite_2bpp_data

```c
#define set_sprite_2bpp_data set_sprite_data
```

### DISABLE_OAM_DMA

```c
#define DISABLE_OAM_DMA _shadow_OAM_base = 0
```

### DISABLE_VBL_TRANSFER

```c
#define DISABLE_VBL_TRANSFER DISABLE_OAM_DMA
```

Disable OAM DMA copy each VBlank

### ENABLE_OAM_DMA

```c
#define ENABLE_OAM_DMA _shadow_OAM_base = (uint8_t)((uint16_t)&shadow_OAM >> 8)
```

### ENABLE_VBL_TRANSFER

```c
#define ENABLE_VBL_TRANSFER ENABLE_OAM_DMA
```

Enable OAM DMA copy each VBlank and set it to transfer default shadow\_OAM array

### MAX_HARDWARE_SPRITES

```c
#define MAX_HARDWARE_SPRITES 40
```

Amount of hardware sprites in OAM

### HARDWARE_SPRITE_CAN_FLIP_X

```c
#define HARDWARE_SPRITE_CAN_FLIP_X 1
```

True if sprite hardware can flip sprites by X (horizontally)

### HARDWARE_SPRITE_CAN_FLIP_Y

```c
#define HARDWARE_SPRITE_CAN_FLIP_Y 1
```

True if sprite hardware can flip sprites by Y (vertically)

### fill_rect

```c
#define fill_rect fill_bkg_rect
```

## Typedef

### int_handler

```c
typedef void(* int_handler) (void) NONBANKED
```

Interrupt handlers

### OAM_item_t

```c
typedef struct OAM_item_t OAM_item_t
```

Sprite Attributes structure

**Parameters**

- `x`: X Coordinate of the sprite on screen
- `y`: Y Coordinate of the sprite on screen
- `tile`: Sprite tile number (see set_sprite_tile)
- `prop`: OAM Property Flags (see set_sprite_prop)

## Function

### remove_VBL()

```c
void remove_VBL ( int_handler h)
```

The remove functions will remove any interrupt handler.

A handler of NULL will cause bad things to happen if the given interrupt is enabled.

Removes the VBL interrupt handler.

**See also**

add\_VBL()

Removes the VBL interrupt handler.

**See also**

add\_VBL()

### remove_LCD()

```c
void remove_LCD ( int_handler h)
```

Removes the LCD interrupt handler.

**See also**

add\_LCD(), remove\_VBL()

### remove_TIM()

```c
void remove_TIM ( int_handler h)
```

Removes the TIM interrupt handler.

**See also**

add\_TIM(), remove\_VBL()

### remove_SIO()

```c
void remove_SIO ( int_handler h)
```

Removes the Serial Link / SIO interrupt handler.

**See also**

add\_SIO(),

remove\_VBL()

The default SIO ISR gets installed automatically if any of the standard SIO calls are used (send\_byte(), receive\_byte()).

Once installed the default SIO ISR cannot be removed. Only secondary chained SIO ISRs (added with add\_SIO()) can be removed.

### remove_JOY()

```c
void remove_JOY ( int_handler h)
```

Removes the JOY interrupt handler.

**See also**

add\_JOY(), remove\_VBL()

### add_VBL()

```c
void add_VBL ( int_handler h)
```

Adds a Vertical Blanking interrupt handler.

**Parameters**

- `h`: The handler to be called whenever a V-blank interrupt occurs.

Up to 4 handlers may be added, with the last added being called last.

**Do not** use the function definition attributes CRITICAL and INTERRUPT when declaring ISR functions added via add\_VBL() (or LCD, etc). Those attributes are only required when constructing a bare jump from the interrupt vector itself (such as with ISR\_VECTOR()).

ISR handlers added using add\_VBL()/etc are instead called via the GBDK ISR dispatcher which makes the extra function attributes unecessary.

**Note**

The default GBDK VBL is installed automatically.

**See also**

ISR\_VECTOR()

Adds a V-blank interrupt handler.

### add_LCD()

```c
void add_LCD ( int_handler h)
```

Adds a LCD interrupt handler.

Called when the LCD interrupt occurs.

Up to 3 handlers may be added, with the last added being called last.

There are various sources controlled by the STAT\_REG register ($FF41) which can trigger this interrupt. Common examples include triggering on specific scanlines using LY\_REG == LYC\_REG. Another is applying graphics effects on a per-scanline basis such as modifying the X and Y scroll registers (SCX\_REG / SCY\_REG registers).

**Note**

LYC may not trigger with scanline 0 in the same way as other scanlines due to particular behavior with scanlines 153 and 0. Instead, using an add\_VBL() interrupt handler for start of frame behavior may be more suitable.

**Do not** use the function definition attributes CRITICAL and INTERRUPT when declaring ISR functions added via add\_VBL() (or LCD, etc). Those attributes are only required when constructing a bare jump from the interrupt vector itself (such as with ISR\_VECTOR()).

ISR handlers added using add\_VBL/LCD/etc are instead called via the GBDK ISR dispatcher which makes the extra function attributes unecessary.

If this ISR is to be called once per each scanline then make sure that the time it takes to execute is less than the duration of a scanline.

**See also**

add\_VBL, nowait\_int\_handler, ISR\_VECTOR()

Adds a LCD interrupt handler.

### add_TIM()

```c
void add_TIM ( int_handler h)
```

Adds a timer interrupt handler.

Can not be used together with add\_low\_priority\_TIM

This interrupt occurs when the TIMA\_REG register ($FF05) changes from $FF to $00.

Up to 4 handlers may be added, with the last added being called last.

**Note**

For NES make sure to wrap TIM interrupt handlers with a nooverlay pragma. For more details see docs\_nes\_tim\_overlay

**See also**

add\_VBL

set\_interrupts() with TIM\_IFLAG, ISR\_VECTOR()

### add_low_priority_TIM()

```c
void add_low_priority_TIM ( int_handler h)
```

Adds a timer interrupt handler, that could be interrupted by the other interrupts, as well as itself, if it runs too slow.

Can not be used together with add\_TIM

This interrupt occurs when the TIMA\_REG register ($FF05) changes from $FF to $00.

Up to 4 handlers may be added, with the last added being called last.

**See also**

add\_VBL

set\_interrupts() with TIM\_IFLAG, ISR\_VECTOR()

### add_SIO()

```c
void add_SIO ( int_handler h)
```

Adds a Serial Link transmit complete interrupt handler.

This interrupt occurs when a serial transfer has completed on the game link port.

Up to 4 handlers may be added, with the last added being called last.

The default SIO ISR gets installed automatically if any of the standard SIO calls are used (send\_byte(), receive\_byte()).

**See also**

send\_byte, receive\_byte(), add\_VBL()

set\_interrupts() with SIO\_IFLAG

### add_JOY()

```c
void add_JOY ( int_handler h)
```

Adds a joypad button change interrupt handler.

This interrupt occurs on a transition of any of the keypad input lines from high to low, if the relevant P1\_REG bits 4 or 5 are set.

For details about configuring flags or reading the data see: https://gbdev.io/pandocs/Interrupt\_Sources.html#int-60&ndash;joypad-interrupt https://gbdev.io/pandocs/Joypad\_Input.html#ff00&ndash;p1joyp-joypad

Due to the fact that keypad "bounce" is virtually always present, software should expect this interrupt to occur one or more times for every button press and one or more times for every button release.

Up to 4 handlers may be added, with the last added being called last.

An example use of this is allowing the user to trigger an exit from the lower-power STOP cpu state.

**See also**

joypad(), add\_VBL(), IEF\_HILO, P1F\_5, P1F\_4, P1F\_3, P1F\_2, P1F\_1, P1F\_0, P1F\_GET\_DPAD, P1F\_GET\_BTN, P1F\_GET\_NONE

### nowait_int_handler()

```c
void nowait_int_handler ( void )
```

Interrupt handler chain terminator that does **not** wait for .STAT

You must add this handler last in every interrupt handler chain if you want to change the default interrupt handler behaviour that waits for LCD controller mode to become 1 or 0 before return from the interrupt.

Example:

```c
CRITICAL {
add_SIO(nowait_int_handler); // Disable wait on VRAM state before returning from SIO interrupt
}
```

**See also**

wait\_int\_handler()

### wait_int_handler()

```c
void wait_int_handler ( void )
```

Default Interrupt handler chain terminator that waits for

**See also**

STAT\_REG and **only** returns at the BEGINNING of either Mode 0 or Mode 1.

Used by default at the end of interrupt chains to help prevent graphical glitches. The glitches are caused when an ISR interrupts a graphics operation in one mode but returns in a different mode for which that graphics operation is not allowed.

**See also**

nowait\_int\_handler()

### cancel_pending_interrupts()

```c
uint8_t cancel_pending_interrupts ( void ) inline
```

Cancel pending interrupts

### mode()

```c
void mode ( uint8_t m)
```

Set the current screen mode - one of M\_\* modes

Normally used by internal functions only.

**See also**

M\_DRAWING, M\_TEXT\_OUT, M\_TEXT\_INOUT, M\_NO\_SCROLL, M\_NO\_INTERP

### get_mode()

```c
uint8_t get_mode ( void )
```

Returns the current mode

**See also**

M\_DRAWING, M\_TEXT\_OUT, M\_TEXT\_INOUT, M\_NO\_SCROLL, M\_NO\_INTERP

### get_system()

```c
uint8_t get_system ( void ) inline
```

Returns the system gbdk is running on.

**See also**

SYSTEM\_50HZ, SYSTEM\_60HZ, SYSTEM\_BITS\_DENDY, SYSTEM\_BITS\_NTSC, SYSTEM\_BITS\_PAL, SYSTEM\_NTSC SYSTEM\_PAL

### send_byte()

```c
void send_byte ( void )
```

Serial Link: Send the byte in \_io\_out out through the serial port

Make sure to enable interrupts for the Serial Link before trying to transfer data.

**See also**

add\_SIO(), remove\_SIO()

set\_interrupts() with SIO\_IFLAG

### receive_byte()

```c
void receive_byte ( void )
```

Serial Link: Receive a byte from the serial port into \_io\_in

Make sure to enable interrupts for the Serial Link before trying to transfer data.

**See also**

add\_SIO(), remove\_SIO()

set\_interrupts() with SIO\_IFLAG

### delay()

```c
void delay ( uint16_t d)
```

Delays the given number of milliseconds. Uses no timers or interrupts, and can be called with interrupts disabled

### joypad()

```c
uint8_t joypad ( void )
```

Reads and returns the current state of the joypad. Follows Nintendo's guidelines for reading the pad. Return value is an OR of J\_\*

When testing for multiple different buttons, it's best to read the joypad state _once_ into a variable and then test using that variable.

**See also**

J\_START, J\_SELECT, J\_A, J\_B, J\_UP, J\_DOWN, J\_LEFT, J\_RIGHT

### waitpad()

```c
uint8_t waitpad ( uint8_t mask)
```

Waits until at least one of the buttons given in mask are pressed.

**Parameters**

- `mask`: Bitmask indicating which buttons to wait for

Normally only used for checking one key, but it will support many, even J\_LEFT at the same time as J\_RIGHT. :)

**Note**

Checks in a loop that doesn't HALT at all, so the CPU will be maxed out until this call returns.

**See also**

joypad

J\_START, J\_SELECT, J\_A, J\_B, J\_UP, J\_DOWN, J\_LEFT, J\_RIGHT

### waitpadup()

```c
void waitpadup ( void )
```

Waits for the directional pad and all buttons to be released.

**Note**

Checks in a loop that doesn't HALT at all, so the CPU will be maxed out until this call returns.

### joypad_init()

```c
uint8_t joypad_init ( uint8_t npads, joypads_t * joypads )
```

Initializes joypads\_t structure for polling multiple joypads (for the GB and ones connected via SGB)

**Parameters**

- `npads`: number of joypads requested (1, 2 or 4)
- `joypads`: pointer to joypads_t structure to be initialized

Only required for joypad\_ex, not required for calls to regular joypad()

**Returns**

number of joypads avaliable

**See also**

joypad\_ex(), joypads\_t

### joypad_ex()

```c
void joypad_ex ( joypads_t * joypads)
```

Polls all avaliable joypads (for the GB and ones connected via SGB)

**Parameters**

- `joypads`: pointer to joypads_t structure to be filled with joypad statuses, must be previously initialized with joypad_init()

**See also**

joypad\_init(), joypads\_t

### enable_interrupts()

```c
void enable_interrupts ( void ) inline
```

Enables unmasked interrupts

**Note**

Use CRITICAL {...} instead for creating a block of of code which should execute with interrupts temporarily turned off.

**See also**

disable\_interrupts, set\_interrupts, CRITICAL

### disable_interrupts()

```c
void disable_interrupts ( void ) inline
```

Disables interrupts

**Note**

Use CRITICAL {...} instead for creating a block of of code which should execute with interrupts temporarily turned off.

This function may be called as many times as you like; however the first call to enable\_interrupts will re-enable them.

**See also**

enable\_interrupts, set\_interrupts, CRITICAL

### set_interrupts()

```c
void set_interrupts ( uint8_t flags)
```

Clears any pending interrupts and sets the interrupt mask register IO to flags.

**Parameters**

- `flags`: A logical OR of *_IFLAGS

**Note**

This disables and then re-enables interrupts so it must be used outside of a critical section.

**See also**

enable\_interrupts(), disable\_interrupts()

VBL\_IFLAG, LCD\_IFLAG, TIM\_IFLAG, SIO\_IFLAG, JOY\_IFLAG

### reset()

```c
void reset ( void ) inline
```

Performs a soft reset.

For the Game Boy and related it does this by jumping to address 0x0150 which is in crt0.s (the c-runtime that executes before main() is called).

This performs various startup steps such as resetting the stack, clearing WRAM and OAM, resetting initialized variables and some display registers (scroll, window, LCDC), etc.

This is not the same a hard power reset.

### vsync()

```c
void vsync ( void )
```

HALTs the CPU and waits for the vertical blank interrupt and then returns when all registered VBL ISRs have completed.

This is often used in main loops to idle the CPU at low power until it's time to start the next frame. It's also useful for syncing animation with the screen re-draw.

Warning: If the VBL interrupt is disabled, this function will never return. If the screen is off this function returns immediately.

### wait_vbl_done()

```c
void wait_vbl_done ( void )
```

Obsolete. This function has been replaced by vsync(), which has identical behavior.

### display_off()

```c
void display_off ( void )
```

Turns the display off.

Waits until the VBL before turning the display off.

**See also**

DISPLAY\_ON

### refresh_OAM()

```c
void refresh_OAM ( void )
```

Copies data from shadow OAM to OAM

### hiramcpy()

```c
void hiramcpy ( uint8_t dst, const void * src, uint8_t n )
```

Copies data from somewhere in the lower address space to part of hi-ram.

**Parameters**

- `dst`: Offset in high ram (0xFF00 and above) to copy to.
- `src`: Area to copy from
- `n`: Number of bytes to copy.

### set_vram_byte()

```c
void set_vram_byte ( uint8_t * addr, uint8_t v )
```

Set byte in vram at given memory location

**Parameters**

- `addr`: address to write to
- `v`: value

### get_vram_byte()

```c
uint8_t get_vram_byte ( uint8_t * addr)
```

Get byte from vram at given memory location

**Parameters**

- `addr`: address to read from

**Returns**

read value

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

### get_bkg_xy_addr()

```c
uint8_t * get_bkg_xy_addr ( uint8_t x, uint8_t y )
```

Get address of X,Y tile of background map

### set_2bpp_palette()

```c
void set_2bpp_palette ( uint16_t palette) inline
```

Sets palette for 2bpp color translation for GG/SMS, does nothing on GB

### set_1bpp_colors_ex()

```c
void set_1bpp_colors_ex ( uint8_t fgcolor, uint8_t bgcolor, uint8_t mode )
```

Sets the Foreground and Background colors used by the set\_\*\_1bpp\_\*() functions

**Parameters**

- `fgcolor`: Foreground color
- `bgcolor`: Background color
- `mode`: Draw Mode

See set\_1bpp\_colors for details.

### set_1bpp_colors()

```c
void set_1bpp_colors ( uint8_t fgcolor, uint8_t bgcolor ) inline
```

Sets the Foreground and Background colors used by the set\_\*\_1bpp\_\*() functions

**Parameters**

- `fgcolor`: Foreground color to use
- `bgcolor`: Background color to use

The default colors are:

-   Foreground: DMG\_BLACK
-   Background: DMG\_WHITE

Example:

```c
// Use DMG_BLACK as the Foreground color and DMG_LITE_GRAY
// as the Background color when loading 1bpp tile data.
set_1bpp_colors(DMG_BLACK, DMG_LITE_GRAY);
```

**See also**

DMG\_BLACK, DMG\_DARK\_GRAY, DMG\_LITE\_GRAY, DMG\_WHITE

set\_bkg\_1bpp\_data, set\_win\_1bpp\_data, set\_sprite\_1bpp\_data

### set_bkg_data()

```c
void set_bkg_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data )
```

Sets VRAM Tile Pattern data for the Background / Window

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to (2 bpp) source tile data

Writes **nb\_tiles** tiles to VRAM starting at **first\_tile**, tile data is sourced from **data**. Each Tile is 16 bytes in size (8x8 pixels, 2 bits-per-pixel).

**Note**

Sprite Tiles 128-255 share the same memory region as Background Tiles 128-255.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

**See also**

set\_win\_data, set\_tile\_data

### set_bkg_1bpp_data()

```c
void set_bkg_1bpp_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data )
```

Sets VRAM Tile Pattern data for the Background / Window using 1bpp source data

**Parameters**

- `first_tile`: Index of the first Tile to write
- `nb_tiles`: Number of Tiles to write
- `data`: Pointer to (1bpp) source Tile Pattern data

Similar to set\_bkg\_data, except source data is 1 bit-per-pixel which gets expanded into 2 bits-per-pixel.

For a given bit that represent a pixel:

-   0 will be expanded into the Background color
-   1 will be expanded into the Foreground color

See set\_1bpp\_colors for details about setting the Foreground and Background colors.

**See also**

SHOW\_BKG, HIDE\_BKG, set\_bkg\_tiles

set\_win\_1bpp\_data, set\_sprite\_1bpp\_data

### get_bkg_data()

```c
void get_bkg_data ( uint8_t first_tile, uint8_t nb_tiles, uint8_t * data )
```

Copies from Background / Window VRAM Tile Pattern data into a buffer

**Parameters**

- `first_tile`: Index of the first Tile to read from
- `nb_tiles`: Number of Tiles to read
- `data`: Pointer to destination buffer for Tile Pattern data

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

Copies **nb\_tiles** tiles from VRAM starting at **first\_tile**, Tile data is copied into **data**.

Each Tile is 16 bytes, so the buffer pointed to by **data** should be at least **nb\_tiles** x 16 bytes in size.

**See also**

get\_win\_data, get\_data

### set_bkg_tiles()

```c
void set_bkg_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * tiles )
```

Sets a rectangular region of Background Tile Map.

**Parameters**

- `x`: X Start position in Background Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Background Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tiles`: Pointer to source tile map data

Entries are copied from map at **tiles** to the Background Tile Map starting at **x**, **y** writing across for **w** tiles and down for **h** tiles.

Use set\_bkg\_submap() instead when:

-   Source map is wider than 32 tiles.
-   Writing a width that does not match the source map width **and** more than one row high at a time.

One byte per source tile map entry.

Writes that exceed coordinate 31 on the x or y axis will wrap around to the Left and Top edges.

**Note**

Patterns 128-255 overlap with patterns 128-255 of the sprite Tile Pattern table.

GBC only: VBK\_REG determines whether Tile Numbers or Tile Attributes get set.

-   VBK\_REG = VBK\_TILES Tile Numbers are written
-   VBK\_REG = VBK\_ATTRIBUTES Tile Attributes are written

GBC Tile Attributes are defined as:

-   Bit 7 - Priority flag. When this is set, it puts the tile above the sprites with colour 0 being transparent.  
    0: Below sprites  
    1: Above sprites  
    Note: SHOW\_BKG needs to be set for these priorities to take place.
-   Bit 6 - Vertical flip. Dictates which way up the tile is drawn vertically.  
    0: Normal  
    1: Flipped Vertically
-   Bit 5 - Horizontal flip. Dictates which way up the tile is drawn horizontally.  
    0: Normal  
    1: Flipped Horizontally
-   Bit 4 - Not used
-   Bit 3 - Character Bank specification. Dictates from which bank of Background Tile Patterns the tile is taken.  
    0: Bank 0  
    1: Bank 1
-   Bit 2 - See bit 0.
-   Bit 1 - See bit 0.
-   Bit 0 - Bits 0-2 indicate which of the 7 BKG colour palettes the tile is assigned.

**See also**

SHOW\_BKG

set\_bkg\_data, set\_bkg\_submap, set\_win\_tiles, set\_tiles

### set_bkg_based_tiles()

```c
void set_bkg_based_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * tiles, uint8_t base_tile ) inline
```

Sets a rectangular region of Background Tile Map. The offset value in **base\_tile** is added to the tile ID for each map entry.

**Parameters**

- `x`: X Start position in Background Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Background Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tiles`: Pointer to source tile map data
- `base_tile`: Offset each tile ID entry of the source map by this value. Range 1 - 255

This is identical to set\_bkg\_tiles() except that it adds the **base\_tile** parameter for when a tile map's tiles don't start at index zero. (For example, the tiles used by the map range from 100 -> 120 in VRAM instead of 0 -> 20).

**See also**

set\_bkg\_tiles for more details

### set_bkg_attributes()

```c
void set_bkg_attributes ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * tiles ) inline
```

Sets a rectangular region of Background Tile Map Attributes.

**Parameters**

- `x`: X Start position in Background Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Background Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tiles`: Pointer to source tile map attribute data

Entries are copied from map at **tiles** to the Background Tile Map starting at **x**, **y** writing across for **w** tiles and down for **h** tiles.

Use set\_bkg\_submap\_attributes() instead when:

-   Source map is wider than 32 tiles.
-   Writing a width that does not match the source map width **and** more than one row high at a time.

One byte per source tile map entry.

Writes that exceed coordinate 31 on the x or y axis will wrap around to the Left and Top edges.

GBC Tile Attributes are defined as:

-   Bit 7 - Priority flag. When this is set, it puts the tile above the sprites with colour 0 being transparent.  
    0: Below sprites  
    1: Above sprites  
    Note: SHOW\_BKG needs to be set for these priorities to take place.
-   Bit 6 - Vertical flip. Dictates which way up the tile is drawn vertically.  
    0: Normal  
    1: Flipped Vertically
-   Bit 5 - Horizontal flip. Dictates which way up the tile is drawn horizontally.  
    0: Normal  
    1: Flipped Horizontally
-   Bit 4 - Not used
-   Bit 3 - Character Bank specification. Dictates from which bank of Background Tile Patterns the tile is taken.  
    0: Bank 0  
    1: Bank 1
-   Bit 2 - See bit 0.
-   Bit 1 - See bit 0.
-   Bit 0 - Bits 0-2 indicate which of the 7 BKG colour palettes the tile is assigned.

**See also**

SHOW\_BKG

set\_bkg\_data, set\_bkg\_submap\_attributes, set\_win\_tiles, set\_tiles

**Note**

On the Game Boy this is only usable in Game Boy Color mode

### set_bkg_submap()

```c
void set_bkg_submap ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * map, uint8_t map_w ) inline
```

Sets a rectangular area of the Background Tile Map using a sub-region from a source tile map. Useful for scrolling implementations of maps larger than 32 x 32 tiles.

**Parameters**

- `x`: X Start position in both the Source Tile Map and hardware Background Map tile coordinates. Range 0 - 255
- `y`: Y Start position in both the Source Tile Map and hardware Background Map tile coordinates. Range 0 - 255
- `w`: Width of area to set in tiles. Range 1 - 255
- `h`: Height of area to set in tiles. Range 1 - 255
- `map`: Pointer to source tile map data
- `map_w`: Width of source tile map in tiles. Range 1 - 255

Entries are copied from **map** to the Background Tile Map starting at **x**, **y** writing across for **w** tiles and down for **h** tiles, using **map\_w** as the rowstride for the source tile map.

The **x** and **y** parameters are in Source Tile Map tile coordinates. The location tiles will be written to on the hardware Background Map is derived from those, but only uses the lower 5 bits of each axis, for range of 0-31 (they are bit-masked: `x & 0x1F` and `y & 0x1F`). As a result the two coordinate systems are aligned together.

In order to transfer tile map data in a way where the coordinate systems are not aligned, an offset from the Source Tile Map pointer can be passed in: `(map_ptr + x + (y * map_width))`.

For example, if you want the tile id at `1,2` from the source map to show up at `0,0` on the hardware Background Map (instead of at `1,2`) then modify the pointer address that is passed in: `map_ptr + 1 + (2 * map_width)`

Use this instead of set\_bkg\_tiles when the source map is wider than 32 tiles or when writing a width that does not match the source map width.

One byte per source tile map entry.

Writes that exceed coordinate 31 on the x or y axis will wrap around to the Left and Top edges.

See set\_bkg\_tiles for setting CGB attribute maps with VBK\_REG.

**See also**

SHOW\_BKG

set\_bkg\_data, set\_bkg\_tiles, set\_win\_submap, set\_tiles

### set_bkg_based_submap()

```c
void set_bkg_based_submap ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * map, uint8_t map_w, uint8_t base_tile ) inline
```

Sets a rectangular area of the Background Tile Map using a sub-region from a source tile map. The offset value in **base\_tile** is added to the tile ID for each map entry.

**Parameters**

- `x`: X Start position in both the Source Tile Map and hardware Background Map tile coordinates. Range 0 - 255
- `y`: Y Start position in both the Source Tile Map and hardware Background Map tile coordinates. Range 0 - 255
- `w`: Width of area to set in tiles. Range 1 - 255
- `h`: Height of area to set in tiles. Range 1 - 255
- `map`: Pointer to source tile map data
- `map_w`: Width of source tile map in tiles. Range 1 - 255
- `base_tile`: Offset each tile ID entry of the source map by this value. Range 1 - 255

This is identical to set\_bkg\_submap() except that it adds the **base\_tile** parameter for when a tile map's tiles don't start at index zero. (For example, the tiles used by the map range from 100 -> 120 in VRAM instead of 0 -> 20).

**See also**

set\_bkg\_submap for more details

### set_bkg_submap_attributes()

```c
void set_bkg_submap_attributes ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * map, uint8_t map_w ) inline
```

Sets a rectangular area of the Background Tile Map Attributes using a sub-region from a source tile attribute map. Useful for scrolling implementations of maps larger than 32 x 32 tiles.

**Parameters**

- `x`: X Start position in both the Source Tile Map and hardware Background Map tile coordinates. Range 0 - 255
- `y`: Y Start position in both the Source Tile Map and hardware Background Map tile coordinates. Range 0 - 255
- `w`: Width of area to set in tiles. Range 1 - 255
- `h`: Height of area to set in tiles. Range 1 - 255
- `map`: Pointer to source tile map attribute data
- `map_w`: Width of source tile map in tiles. Range 1 - 255

Entries are copied from **map** to the Background Tile Map starting at **x**, **y** writing across for **w** tiles and down for **h** tiles, using **map\_w** as the rowstride for the source tile map.

The **x** and **y** parameters are in Source Tile Map tile coordinates. The location tiles will be written to on the hardware Background Map is derived from those, but only uses the lower 5 bits of each axis, for range of 0-31 (they are bit-masked: `x & 0x1F` and `y & 0x1F`). As a result the two coordinate systems are aligned together.

In order to transfer tile map data in a way where the coordinate systems are not aligned, an offset from the Source Tile Map pointer can be passed in: `(map_ptr + x + (y * map_width))`.

For example, if you want the tile id at `1,2` from the source map to show up at `0,0` on the hardware Background Map (instead of at `1,2`) then modify the pointer address that is passed in: `map_ptr + 1 + (2 * map_width)`

Use this instead of set\_bkg\_tiles when the source map is wider than 32 tiles or when writing a width that does not match the source map width.

One byte per source tile map entry.

Writes that exceed coordinate 31 on the x or y axis will wrap around to the Left and Top edges.

See set\_bkg\_tiles for setting CGB attribute maps with VBK\_REG.

**See also**

SHOW\_BKG

set\_bkg\_data, set\_bkg\_attributes, set\_win\_submap, set\_tiles

**Note**

On the Game Boy this is only usable in Game Boy Color mode

### get_bkg_tiles()

```c
void get_bkg_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, uint8_t * tiles )
```

Copies a rectangular region of Background Tile Map entries into a buffer.

**Parameters**

- `x`: X Start position in Background Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Background Map tile coordinates. Range 0 - 31
- `w`: Width of area to copy in tiles. Range 0 - 31
- `h`: Height of area to copy in tiles. Range 0 - 31
- `tiles`: Pointer to destination buffer for Tile Map data

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

Entries are copied into **tiles** from the Background Tile Map starting at **x**, **y** reading across for **w** tiles and down for **h** tiles.

One byte per tile.

The buffer pointed to by **tiles** should be at least **x** x **y** bytes in size.

**See also**

get\_win\_tiles, get\_bkg\_tile\_xy, get\_tiles, get\_vram\_byte

### set_bkg_tile_xy()

```c
uint8_t * set_bkg_tile_xy ( uint8_t x, uint8_t y, uint8_t t )
```

Set single tile t on background layer at x,y

**Parameters**

- `x`: X-coordinate
- `y`: Y-coordinate
- `t`: tile index

**Returns**

returns the address of tile, so you may use faster set\_vram\_byte() later

### set_bkg_attribute_xy()

```c
uint8_t * set_bkg_attribute_xy ( uint8_t x, uint8_t y, uint8_t a ) inline
```

Set single attribute data a on background layer at x,y

**Parameters**

- `x`: X-coordinate
- `y`: Y-coordinate
- `a`: tile attributes

**Returns**

returns the address of tile attribute, so you may use faster set\_vram\_byte() later

**Note**

On the Game Boy this is only usable in Game Boy Color mode

### get_bkg_tile_xy()

```c
uint8_t get_bkg_tile_xy ( uint8_t x, uint8_t y )
```

Get single tile t on background layer at x,y

**Parameters**

- `x`: X-coordinate
- `y`: Y-coordinate

**Returns**

returns tile index

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

### move_bkg()

```c
void move_bkg ( uint8_t x, uint8_t y ) inline
```

Moves the Background Layer to the position specified in **x** and **y** in pixels.

**Parameters**

- `x`: X axis screen coordinate for Left edge of the Background
- `y`: Y axis screen coordinate for Top edge of the Background

0,0 is the top left corner of the GB screen. The Background Layer wraps around the screen, so when part of it goes off the screen it appears on the opposite side (factoring in the larger size of the Background Layer versus the screen size).

The background layer is always under the Window Layer.

**See also**

SHOW\_BKG, HIDE\_BKG

### scroll_bkg()

```c
void scroll_bkg ( int8_t x, int8_t y ) inline
```

Moves the Background relative to it's current position.

**Parameters**

- `x`: Number of pixels to move the Background on the X axisRange: -128 - 127
- `y`: Number of pixels to move the Background on the Y axisRange: -128 - 127

**See also**

move\_bkg

### get_win_xy_addr()

```c
uint8_t * get_win_xy_addr ( uint8_t x, uint8_t y )
```

Get address of X,Y tile of window map

### set_win_data()

```c
void set_win_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data )
```

Sets VRAM Tile Pattern data for the Window / Background

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to (2 bpp) source Tile Pattern data.

This is the same as set\_bkg\_data, since the Window Layer and Background Layer share the same Tile pattern data.

**See also**

set\_bkg\_data

set\_win\_tiles, set\_bkg\_data, set\_data

SHOW\_WIN, HIDE\_WIN

### set_win_1bpp_data()

```c
void set_win_1bpp_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data )
```

Sets VRAM Tile Pattern data for the Window / Background using 1bpp source data

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to (1bpp) source Tile Pattern data

This is the same as set\_bkg\_1bpp\_data, since the Window Layer and Background Layer share the same Tile pattern data.

For a given bit that represent a pixel:

-   0 will be expanded into the Background color
-   1 will be expanded into the Foreground color

See set\_1bpp\_colors for details about setting the Foreground and Background colors.

**See also**

set\_bkg\_data, set\_win\_data, set\_1bpp\_colors

set\_bkg\_1bpp\_data, set\_sprite\_1bpp\_data

### get_win_data()

```c
void get_win_data ( uint8_t first_tile, uint8_t nb_tiles, uint8_t * data )
```

Copies from Window / Background VRAM Tile Pattern data into a buffer

**Parameters**

- `first_tile`: Index of the first Tile to read from
- `nb_tiles`: Number of Tiles to read
- `data`: Pointer to destination buffer for Tile Pattern Data

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

This is the same as get\_bkg\_data, since the Window Layer and Background Layer share the same Tile pattern data.

**See also**

get\_bkg\_data, get\_data

### set_win_tiles()

```c
void set_win_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * tiles )
```

Sets a rectangular region of the Window Tile Map.

**Parameters**

- `x`: X Start position in Window Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Window Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tiles`: Pointer to source tile map data

Entries are copied from map at **tiles** to the Window Tile Map starting at **x**, **y** writing across for **w** tiles and down for **h** tiles.

Use set\_win\_submap() instead when:

-   Source map is wider than 32 tiles.
-   Writing a width that does not match the source map width **and** more than one row high at a time.

One byte per source tile map entry.

Writes that exceed coordinate 31 on the x or y axis will wrap around to the Left and Top edges.

**Note**

Patterns 128-255 overlap with patterns 128-255 of the sprite Tile Pattern table.

GBC only: VBK\_REG determines whether Tile Numbers or Tile Attributes get set.

-   VBK\_REG = VBK\_TILES Tile Numbers are written
-   VBK\_REG = VBK\_ATTRIBUTES Tile Attributes are written

For more details about GBC Tile Attributes see set\_bkg\_tiles.

**See also**

SHOW\_WIN, HIDE\_WIN, set\_win\_submap, set\_bkg\_tiles, set\_bkg\_data, set\_tiles

### set_win_based_tiles()

```c
void set_win_based_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * tiles, uint8_t base_tile ) inline
```

Sets a rectangular region of the Window Tile Map. The offset value in **base\_tile** is added to the tile ID for each map entry.

**Parameters**

- `x`: X Start position in Window Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Window Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tiles`: Pointer to source tile map data
- `base_tile`: Offset each tile ID entry of the source map by this value. Range 1 - 255

This is identical to set\_win\_tiles() except that it adds the **base\_tile** parameter for when a tile map's tiles don't start at index zero. (For example, the tiles used by the map range from 100 -> 120 in VRAM instead of 0 -> 20).

**See also**

set\_win\_tiles for more details

### set_win_submap()

```c
void set_win_submap ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * map, uint8_t map_w ) inline
```

Sets a rectangular area of the Window Tile Map using a sub-region from a source tile map.

**Parameters**

- `x`: X Start position in both the Source Tile Map and hardware Window Map tile coordinates. Range 0 - 255
- `y`: Y Start position in both the Source Tile Map and hardware Window Map tile coordinates. Range 0 - 255
- `w`: Width of area to set in tiles. Range 1 - 255
- `h`: Height of area to set in tiles. Range 1 - 255
- `map`: Pointer to source tile map data
- `map_w`: Width of source tile map in tiles. Range 1 - 255

Entries are copied from **map** to the Window Tile Map starting at **x**, **y** writing across for **w** tiles and down for **h** tiles, using **map\_w** as the rowstride for the source tile map.

The **x** and **y** parameters are in Source Tile Map tile coordinates. The location tiles will be written to on the hardware Background Map is derived from those, but only uses the lower 5 bits of each axis, for range of 0-31 (they are bit-masked: `x & 0x1F` and `y & 0x1F`). As a result the two coordinate systems are aligned together.

In order to transfer tile map data in a way where the coordinate systems are not aligned, an offset from the Source Tile Map pointer can be passed in: `(map_ptr + x + (y * map_width))`.

For example, if you want the tile id at `1,2` from the source map to show up at `0,0` on the hardware Background Map (instead of at `1,2`) then modify the pointer address that is passed in: `map_ptr + 1 + (2 * map_width)`

Use this instead of set\_win\_tiles when the source map is wider than 32 tiles or when writing a width that does not match the source map width.

One byte per source tile map entry.

Writes that exceed coordinate 31 on the x or y axis will wrap around to the Left and Top edges.

GBC only: VBK\_REG determines whether Tile Numbers or Tile Attributes get set.

-   VBK\_REG = VBK\_TILES Tile Numbers are written
-   VBK\_REG = VBK\_ATTRIBUTES Tile Attributes are written

See set\_bkg\_tiles for details about CGB attribute maps with VBK\_REG.

**See also**

SHOW\_WIN, HIDE\_WIN, set\_win\_tiles, set\_bkg\_submap, set\_bkg\_tiles, set\_bkg\_data, set\_tiles

### set_win_based_submap()

```c
void set_win_based_submap ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, const uint8_t * map, uint8_t map_w, uint8_t base_tile ) inline
```

Sets a rectangular area of the Window Tile Map using a sub-region from a source tile map. The offset value in **base\_tile** is added to the tile ID for each map entry.

**Parameters**

- `x`: X Start position in both the Source Tile Map and hardware Window Map tile coordinates. Range 0 - 255
- `y`: Y Start position in both the Source Tile Map and hardware Window Map tile coordinates. Range 0 - 255
- `w`: Width of area to set in tiles. Range 1 - 255
- `h`: Height of area to set in tiles. Range 1 - 255
- `map`: Pointer to source tile map data
- `map_w`: Width of source tile map in tiles. Range 1 - 255
- `base_tile`: Offset each tile ID entry of the source map by this value. Range 1 - 255

This is identical to set\_win\_submap() except that it adds the **base\_tile** parameter for when a tile map's tiles don't start at index zero. (For example, the tiles used by the map range from 100 -> 120 in VRAM instead of 0 -> 20).

**See also**

set\_win\_submap for more details

### get_win_tiles()

```c
void get_win_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, uint8_t * tiles )
```

Copies a rectangular region of Window Tile Map entries into a buffer.

**Parameters**

- `x`: X Start position in Window Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Window Map tile coordinates. Range 0 - 31
- `w`: Width of area to copy in tiles. Range 0 - 31
- `h`: Height of area to copy in tiles. Range 0 - 31
- `tiles`: Pointer to destination buffer for Tile Map data

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

Entries are copied into **tiles** from the Window Tile Map starting at **x**, **y** reading across for **w** tiles and down for **h** tiles.

One byte per tile.

The buffer pointed to by **tiles** should be at least **x** x **y** bytes in size.

**See also**

get\_bkg\_tiles, get\_bkg\_tile\_xy, get\_tiles, get\_vram\_byte

### set_win_tile_xy()

```c
uint8_t * set_win_tile_xy ( uint8_t x, uint8_t y, uint8_t t )
```

Set single tile t on window layer at x,y

**Parameters**

- `x`: X-coordinate
- `y`: Y-coordinate
- `t`: tile index

**Returns**

returns the address of tile, so you may use faster set\_vram\_byte() later

### get_win_tile_xy()

```c
uint8_t get_win_tile_xy ( uint8_t x, uint8_t y )
```

Get single tile t on window layer at x,y

**Parameters**

- `x`: X-coordinate
- `y`: Y-coordinate

**Returns**

returns the tile index

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

### move_win()

```c
void move_win ( uint8_t x, uint8_t y ) inline
```

Moves the Window to the **x**, **y** position on the screen.

**Parameters**

- `x`: X coordinate for Left edge of the Window (actual displayed location will be X - 7)
- `y`: Y coordinate for Top edge of the Window

7,0 is the top left corner of the screen in Window coordinates. The Window is locked to the bottom right corner.

The Window is always over the Background layer.

**See also**

SHOW\_WIN, HIDE\_WIN

### scroll_win()

```c
void scroll_win ( int8_t x, int8_t y ) inline
```

Move the Window relative to its current position.

**Parameters**

- `x`: Number of pixels to move the window on the X axisRange: -128 - 127
- `y`: Number of pixels to move the window on the Y axisRange: -128 - 127

**See also**

move\_win

### set_sprite_data()

```c
void set_sprite_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data )
```

Sets VRAM Tile Pattern data for Sprites

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to (2 bpp) source Tile Pattern data

Writes **nb\_tiles** tiles to VRAM starting at **first\_tile**, tile data is sourced from **data**. Each Tile is 16 bytes in size (8x8 pixels, 2 bits-per-pixel).

**Note**

Sprite Tiles 128-255 share the same memory region as Background Tiles 128-255.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

### set_sprite_1bpp_data()

```c
void set_sprite_1bpp_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data )
```

Sets VRAM Tile Pattern data for Sprites using 1bpp source data

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to (1bpp) source Tile Pattern data

Similar to set\_sprite\_data, except source data is 1 bit-per-pixel which gets expanded into 2 bits-per-pixel.

For a given bit that represent a pixel:

-   0 will be expanded into the Background color
-   1 will be expanded into the Foreground color

See set\_1bpp\_colors for details about setting the Foreground and Background colors.

**See also**

SHOW\_SPRITES, HIDE\_SPRITES, set\_sprite\_tile

set\_bkg\_1bpp\_data, set\_win\_1bpp\_data

### get_sprite_data()

```c
void get_sprite_data ( uint8_t first_tile, uint8_t nb_tiles, uint8_t * data )
```

Copies from Sprite VRAM Tile Pattern data into a buffer

**Parameters**

- `first_tile`: Index of the first tile to read from
- `nb_tiles`: Number of tiles to read
- `data`: Pointer to destination buffer for Tile Pattern data

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

Copies **nb\_tiles** tiles from VRAM starting at **first\_tile**, tile data is copied into **data**.

Each Tile is 16 bytes, so the buffer pointed to by **data** should be at least **nb\_tiles** x 16 bytes in size.

### SET_SHADOW_OAM_ADDRESS()

```c
void SET_SHADOW_OAM_ADDRESS ( void * address) inline
```

Enable OAM DMA copy each VBlank and set it to transfer any 256-byte aligned array

### set_sprite_tile()

```c
void set_sprite_tile ( uint8_t nb, uint8_t tile ) inline
```

Sets sprite number **nb\_\_in the OAM to display tile number \_\_tile**.

**Parameters**

- `nb`: Sprite number, range 0 - 39
- `tile`: Selects a tile (0 - 255) from memory at 8000h - 8FFFhIn CGB Mode this could be either in VRAM Bank0 or 1, depending on Bit 3 of the OAM Attribute Flag(see set_sprite_prop)

In 8x16 mode:

-   The sprite will also display the next tile (**tile** + 1) directly below (y + 8) the first tile.
-   The lower bit of the tile number is ignored: the upper 8x8 tile is (**tile** & 0xFE), and the lower 8x8 tile is (**tile** | 0x01).
-   See: SPRITES\_8x16

### get_sprite_tile()

```c
uint8_t get_sprite_tile ( uint8_t nb) inline
```

Returns the tile number of sprite number **nb** in the OAM.

**Parameters**

- `nb`: Sprite number, range 0 - 39

**See also**

set\_sprite\_tile for more details

### set_sprite_prop()

```c
void set_sprite_prop ( uint8_t nb, uint8_t prop ) inline
```

Sets the OAM Property Flags of sprite number **nb** to those defined in **prop**.

**Parameters**

- `nb`: Sprite number, range 0 - 39
- `prop`: Property setting (see bitfield description)

The bits in **prop** represent:

-   Bit 7 - Priority flag. When this is set the sprites appear behind the background and window layer.  
    0: infront  
    1: behind
-   Bit 6 - Vertical flip. Dictates which way up the sprite is drawn vertically.  
    0: normal  
    1:upside down
-   Bit 5 - Horizontal flip. Dictates which way up the sprite is drawn horizontally.  
    0: normal  
    1:back to front
-   Bit 4 - DMG/Non-CGB Mode Only. Assigns either one of the two b/w palettes to the sprite.  
    0: OBJ palette 0  
    1: OBJ palette 1
-   Bit 3 - GBC only. Dictates from which bank of Sprite Tile Patterns the tile is taken.  
    0: Bank 0  
    1: Bank 1
-   Bit 2 - See bit 0.
-   Bit 1 - See bit 0.
-   Bit 0 - GBC only. Bits 0-2 indicate which of the 7 OBJ colour palettes the sprite is assigned.

It's recommended to use GBDK constants (eg: S\_FLIPY) to configure sprite properties as these are crossplatform.

```c
// Load palette data into the first palette
set_sprite_palette(4, 1, exampleSprite_palettes)

// Set the OAM value for the sprite
// These flags tell the sprite to flip both vertically and horizontally.
set_sprite_prop(0, S_FLIPY | S_FLIPX);
```

**See also**

S\_PALETTE, S\_FLIPX, S\_FLIPY, S\_PRIORITY

### get_sprite_prop()

```c
uint8_t get_sprite_prop ( uint8_t nb) inline
```

Returns the OAM Property Flags of sprite number **nb**.

**Parameters**

- `nb`: Sprite number, range 0 - 39

**See also**

set\_sprite\_prop for property bitfield settings

### move_sprite()

```c
void move_sprite ( uint8_t nb, uint8_t x, uint8_t y ) inline
```

Moves sprite number **nb** to the **x**, **y** position on the screen.

**Parameters**

- `nb`: Sprite number, range 0 - 39
- `x`: X Position. Specifies the sprites horizontal position on the screen (minus 8).An offscreen value (X=0 or X>=168) hides the sprite, but the sprite still affects the priority ordering - a better way to hide a sprite is to set its Y-coordinate offscreen.
- `y`: Y Position. Specifies the sprites vertical position on the screen (minus 16).An offscreen value (for example, Y=0 or Y>=160) hides the sprite.

Moving the sprite to 0,0 (or similar off-screen location) will hide it.

### scroll_sprite()

```c
void scroll_sprite ( uint8_t nb, int8_t x, int8_t y ) inline
```

Moves sprite number **nb** relative to its current position.

**Parameters**

- `nb`: Sprite number, range 0 - 39
- `x`: Number of pixels to move the sprite on the X axisRange: -128 - 127
- `y`: Number of pixels to move the sprite on the Y axisRange: -128 - 127

**See also**

move\_sprite for more details about the X and Y position

### hide_sprite()

```c
void hide_sprite ( uint8_t nb) inline
```

Hides sprite number **nb** by moving it to zero position by Y.

**Parameters**

- `nb`: Sprite number, range 0 - 39

**See also**

hide\_sprites\_range, HIDE\_SPRITES

### set_data()

```c
void set_data ( uint8_t * vram_addr, const uint8_t * data, uint16_t len )
```

Copies arbitrary data to an address in VRAM without taking into account the state of LCDC bits 3 or 4.

**Parameters**

- `vram_addr`: Pointer to destination VRAM Address
- `data`: Pointer to source buffer
- `len`: Number of bytes to copy

Copies **len** bytes from a buffer at **data** to VRAM starting at **vram\_addr**.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

**See also**

set\_bkg\_data, set\_win\_data, set\_bkg\_tiles, set\_win\_tiles, set\_tile\_data, set\_tiles

### get_data()

```c
void get_data ( uint8_t * data, uint8_t * vram_addr, uint16_t len )
```

Copies arbitrary data from an address in VRAM into a buffer without taking into account the state of LCDC bits 3 or 4.

**Parameters**

- `vram_addr`: Pointer to source VRAM Address
- `data`: Pointer to destination buffer
- `len`: Number of bytes to copy

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

Copies **len** bytes from VRAM starting at **vram\_addr** into a buffer at **data**.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

**See also**

get\_bkg\_data, get\_win\_data, get\_bkg\_tiles, get\_win\_tiles, get\_tiles

### vmemcpy()

```c
void vmemcpy ( uint8_t * dest, uint8_t * sour, uint16_t len )
```

Copies arbitrary data from an address in VRAM into a buffer

**Parameters**

- `dest`: Pointer to destination buffer (may be in VRAM)
- `sour`: Pointer to source buffer (may be in VRAM)
- `len`: Number of bytes to copy

Copies **len** bytes from or to VRAM starting at **sour** into a buffer or to VRAM at **dest**.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

### set_tiles()

```c
void set_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, uint8_t * vram_addr, const uint8_t * tiles )
```

Sets a rectangular region of Tile Map entries at a given VRAM Address without taking into account the state of LCDC bit 3.

**Parameters**

- `x`: X Start position in Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `vram_addr`: Pointer to destination VRAM Address
- `tiles`: Pointer to source Tile Map data

Entries are copied from **tiles** to Tile Map at address vram\_addr starting at **x**, **y** writing across for **w** tiles and down for **h** tiles.

One byte per source tile map entry.

There are two 32x32 Tile Maps in VRAM at addresses 9800h-9BFFh and 9C00h-9FFFh.

GBC only: VBK\_REG determines whether Tile Numbers or Tile Attributes get set.

-   VBK\_REG = VBK\_TILES Tile Numbers are written
-   VBK\_REG = VBK\_ATTRIBUTES Tile Attributes are written

**See also**

set\_bkg\_tiles, set\_win\_tiles

### set_tile_data()

```c
void set_tile_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data, uint8_t base )
```

Sets VRAM Tile Pattern data starting from given base address without taking into account the state of LCDC bit 4.

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to (2 bpp) source Tile Pattern data.
- `base`: MSB of the destination address in VRAM (usually 0x80 or 0x90 which gives 0x8000 or 0x9000)

**See also**

set\_bkg\_data, set\_win\_data, set\_data

### get_tiles()

```c
void get_tiles ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, uint8_t * vram_addr, uint8_t * tiles )
```

Copies a rectangular region of Tile Map entries from a given VRAM Address into a buffer without taking into account the state of LCDC bit 3.

**Parameters**

- `x`: X Start position in Background Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Background Map tile coordinates. Range 0 - 31
- `w`: Width of area to copy in tiles. Range 0 - 31
- `h`: Height of area to copy in tiles. Range 0 - 31
- `vram_addr`: Pointer to source VRAM Address
- `tiles`: Pointer to destination buffer for Tile Map data

**Note**

In general **avoid reading from VRAM** since that memory is not accessible at all times. It is also not supported by GBDK on the NES platform. See coding guidelines for more details.

Entries are copied into **tiles** from the Background Tile Map starting at **x**, **y** reading across for **w** tiles and down for **h** tiles.

One byte per tile.

There are two 32x32 Tile Maps in VRAM at addresses 9800h - 9BFFh and 9C00h - 9FFFh.

The buffer pointed to by **tiles** should be at least **x** x **y** bytes in size.

**See also**

get\_bkg\_tiles, get\_win\_tiles

### set_native_tile_data()

```c
void set_native_tile_data ( uint16_t first_tile, uint8_t nb_tiles, const uint8_t * data ) inline
```

Sets VRAM Tile Pattern data in the native format

**Parameters**

- `first_tile`: Index of the first tile to write (0 - 511)
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to source Tile Pattern data.

When `first_tile` is larger than 256 on the GB/AP, it will write to sprite data instead of background data.

The bit depth of the source Tile Pattern data depends on which console is being used:

-   Game Boy/Analogue Pocket: loads 2bpp tiles data
-   SMS/GG: loads 4bpp tile data

### set_bkg_native_data()

```c
void set_bkg_native_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data ) inline
```

Sets VRAM Tile Pattern data for the Background / Window in the native format

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to source tile data

Writes **nb\_tiles** tiles to VRAM starting at **first\_tile**, tile data is sourced from **data**.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

**See also**

set\_win\_data, set\_tile\_data

### set_sprite_native_data()

```c
void set_sprite_native_data ( uint8_t first_tile, uint8_t nb_tiles, const uint8_t * data ) inline
```

Sets VRAM Tile Pattern data for Sprites in the native format

**Parameters**

- `first_tile`: Index of the first tile to write
- `nb_tiles`: Number of tiles to write
- `data`: Pointer to source tile data

Writes **nb\_tiles** tiles to VRAM starting at **first\_tile**, tile data is sourced from **data**.

GBC only: VBK\_REG determines which bank of tile patterns are written to.

-   VBK\_REG = VBK\_BANK\_0 indicates the first bank
-   VBK\_REG = VBK\_BANK\_1 indicates the second

### init_win()

```c
void init_win ( uint8_t c)
```

Initializes the entire Window Tile Map with Tile Number **c**

**Parameters**

- `c`: Tile number to fill with

**Note**

This function avoids writes during modes 2 & 3

### init_bkg()

```c
void init_bkg ( uint8_t c)
```

Initializes the entire Background Tile Map with Tile Number **c**

**Parameters**

- `c`: Tile number to fill with

**Note**

This function avoids writes during modes 2 & 3

### vmemset()

```c
void vmemset ( void * s, uint8_t c, size_t n )
```

Fills the VRAM memory region **s** of size **n** with Tile Number **c**

**Parameters**

- `s`: Start address in VRAM
- `c`: Tile number to fill with
- `n`: Size of memory region (in bytes) to fill

**Note**

This function avoids writes during modes 2 & 3

### fill_bkg_rect()

```c
void fill_bkg_rect ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, uint8_t tile )
```

Fills a rectangular region of Tile Map entries for the Background layer with tile.

**Parameters**

- `x`: X Start position in Background Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Background Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tile`: Fill value

### fill_win_rect()

```c
void fill_win_rect ( uint8_t x, uint8_t y, uint8_t w, uint8_t h, uint8_t tile )
```

Fills a rectangular region of Tile Map entries for the Window layer with tile.

**Parameters**

- `x`: X Start position in Window Map tile coordinates. Range 0 - 31
- `y`: Y Start position in Window Map tile coordinates. Range 0 - 31
- `w`: Width of area to set in tiles. Range 1 - 32
- `h`: Height of area to set in tiles. Range 1 - 32
- `tile`: Fill value

## Variable

### c

```c
void c
```

### d

```c
void d
```

### e

```c
void e
```

### h

```c
void h
```

### l

```c
void l
```

**Initial value:**
```c
{
__asm__("ei")
```

### _cpu

```c
uint8_t _cpu extern
```

GB CPU type

**See also**

DMG\_TYPE, MGB\_TYPE, CGB\_TYPE, cpu\_fast(), cpu\_slow(), \_is\_GBA

### _is_GBA

```c
uint8_t _is_GBA extern
```

GBA detection

**See also**

GBA\_DETECTED, GBA\_NOT\_DETECTED, \_cpu

### sys_time

```c
volatile uint16_t sys_time extern
```

Global Time Counter in VBL periods (60Hz)

Increments once per Frame

Will wrap around every ~18 minutes (unsigned 16 bits = 65535 / 60 / 60 = 18.2)

### _vbl_done

```c
__REG _vbl_done
```

Flag indicating the VBlank ISR has run

Flag gets cleared at the start of vsync() / wait\_vbl\_done() and set in the default VBlank ISR handler.

### _io_status

```c
volatile uint8_t _io_status extern
```

Serial Link: Current IO Status. An OR of IO\_\*

### _io_in

```c
volatile uint8_t _io_in extern
```

Serial Link: Byte just read after calling receive\_byte()

### _io_out

```c
volatile uint8_t _io_out extern
```

Serial Link: Write byte to send here before calling send\_byte()

### _current_bank

```c
__REG _current_bank
```

Tracks current active ROM bank

In most cases the CURRENT\_BANK macro for this variable is recommended for use instead of the variable itself.

The active bank number is not tracked by \_current\_bank when SWITCH\_ROM\_MBC5\_8M is used.

This variable is updated automatically when you call SWITCH\_ROM\_MBC1 or SWITCH\_ROM\_MBC5, SWITCH\_ROM(), or call a BANKED function.

**See also**

SWITCH\_ROM\_MBC1(), SWITCH\_ROM\_MBC5(), SWITCH\_ROM()

### b

```c
void b
```

### _current_1bpp_colors

```c
uint16_t _current_1bpp_colors extern
```

### _map_tile_offset

```c
uint8_t _map_tile_offset extern
```

### _submap_tile_offset

```c
uint8_t _submap_tile_offset extern
```

### shadow_OAM

```c
volatile struct OAM_item_t shadow_OAM[] extern
```

Shadow OAM array in WRAM, that is DMA-transferred into the real OAM each VBlank

### _shadow_OAM_base

```c
__REG _shadow_OAM_base
```

MSB of shadow\_OAM address is used by OAM DMA copying routine
