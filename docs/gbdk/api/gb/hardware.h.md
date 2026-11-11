# gb/hardware.h

> Source header: `gbdk-lib/include/gb/hardware.h` (GBDK-2020 v4.5.0)

`#include <types.h>`

## Macro Definition

### __BYTES

```c
#define __BYTES extern UBYTE
```

### __BYTE_REG

```c
#define __BYTE_REG extern volatile UBYTE
```

### __REG

```c
#define __REG extern volatile SFR
```

### MBC7_LATCH_ERASE

```c
#define MBC7_LATCH_ERASE 0x55u
```

### MBC7_LATCH_CAPTURE

```c
#define MBC7_LATCH_CAPTURE 0xAAu
```

### MBC7_SRAM_ENABLE_KEY_1

```c
#define MBC7_SRAM_ENABLE_KEY_1 0x0Au
```

### MBC7_SRAM_ENABLE_KEY_2

```c
#define MBC7_SRAM_ENABLE_KEY_2 0x40u
```

### rP1

```c
#define rP1 P1_REG
```

### P1F_5

```c
#define P1F_5 0b00100000
```

### P1F_4

```c
#define P1F_4 0b00010000
```

### P1F_3

```c
#define P1F_3 0b00001000
```

### P1F_2

```c
#define P1F_2 0b00000100
```

### P1F_1

```c
#define P1F_1 0b00000010
```

### P1F_0

```c
#define P1F_0 0b00000001
```

### P1F_GET_DPAD

```c
#define P1F_GET_DPAD P1F_5
```

### P1F_GET_BTN

```c
#define P1F_GET_BTN P1F_4
```

### P1F_GET_NONE

```c
#define P1F_GET_NONE (P1F_4 | P1F_5)
```

### rSB

```c
#define rSB SB_REG
```

### rSC

```c
#define rSC SC_REG
```

### SIOF_XFER_START

```c
#define SIOF_XFER_START 0b10000000
```

Serial IO: Start Transfer. Automatically cleared at the end of transfer

### SIOF_CLOCK_INT

```c
#define SIOF_CLOCK_INT 0b00000001
```

Serial IO: Use Internal clock

### SIOF_CLOCK_EXT

```c
#define SIOF_CLOCK_EXT 0b00000000
```

Serial IO: Use External clock

### SIOF_SPEED_1X

```c
#define SIOF_SPEED_1X 0b00000000
```

Serial IO: If internal clock then 8KHz mode, 1KB/s (16Khz in CGB high-speed mode, 2KB/s)

### SIOF_SPEED_32X

```c
#define SIOF_SPEED_32X 0b00000010
```

Serial IO: **CGB-Mode ONLY** If internal clock then 256KHz mode, 32KB/s (512KHz in CGB high-speed mode, 64KB/s)

### SIOF_B_CLOCK

```c
#define SIOF_B_CLOCK 0
```

### SIOF_B_SPEED

```c
#define SIOF_B_SPEED 1
```

### SIOF_B_XFER_START

```c
#define SIOF_B_XFER_START 7
```

### SCF_START

```c
#define SCF_START SIOF_XFER_START
```

### SCF_SOURCE

```c
#define SCF_SOURCE SIOF_CLOCK_INT
```

### SCF_SPEED

```c
#define SCF_SPEED SIOF_SPEED_32X
```

### rDIV

```c
#define rDIV DIV_REG
```

### rTIMA

```c
#define rTIMA TIMA_REG
```

### rTMA

```c
#define rTMA TMA_REG
```

### rTAC

```c
#define rTAC TAC_REG
```

### TACF_START

```c
#define TACF_START 0b00000100
```

### TACF_STOP

```c
#define TACF_STOP 0b00000000
```

### TACF_4KHZ

```c
#define TACF_4KHZ 0b00000000
```

### TACF_16KHZ

```c
#define TACF_16KHZ 0b00000011
```

### TACF_65KHZ

```c
#define TACF_65KHZ 0b00000010
```

### TACF_262KHZ

```c
#define TACF_262KHZ 0b00000001
```

### rIF

```c
#define rIF IF_REG
```

### rAUD1SWEEP

```c
#define rAUD1SWEEP NR10_REG
```

Sound Channel 1, NR10: Sweep

### AUD1SWEEP_UP

```c
#define AUD1SWEEP_UP 0b00000000
```

For Sound Channel 1, NR10: Sweep Addition, period increases

### AUD1SWEEP_DOWN

```c
#define AUD1SWEEP_DOWN 0b00001000
```

For Sound Channel 1, NR10: Sweep Subtraction, period decreases

### AUD1SWEEP_TIME

```c
#define AUD1SWEEP_TIME ( x) ((x) << 4)
```

For Sound Channel 1, NR10: Sweep Time/Pace, Range: 0-7

### AUD1SWEEP_LENGTH

```c
#define AUD1SWEEP_LENGTH ( x) (x)
```

For Sound Channel 1, NR10: Sweep Length/Individual step, Range: 0-7

### rAUD1LEN

```c
#define rAUD1LEN NR11_REG
```

Sound Channel 1, NR11: Sound length/Wave pattern duty

### rAUD1ENV

```c
#define rAUD1ENV NR12_REG
```

Sound Channel 1, NR12: Volume Envelope

### rAUD1LOW

```c
#define rAUD1LOW NR13_REG
```

Sound Channel 1, NR13: Frequency Low

### rAUD1HIGH

```c
#define rAUD1HIGH NR14_REG
```

Sound Channel 1, NR14: Frequency High

### rAUD2LEN

```c
#define rAUD2LEN NR21_REG
```

Sound Channel 2, NR21\_REG: Tone

### rAUD2ENV

```c
#define rAUD2ENV NR22_REG
```

Sound Channel 2, NR22\_REG: Volume Envelope

### rAUD2LOW

```c
#define rAUD2LOW NR23_REG
```

Sound Channel 2, NR23\_REG: Frequency data Low

### rAUD2HIGH

```c
#define rAUD2HIGH NR24_REG
```

Sound Channel 2, NR24\_REG: Frequency data High

### rAUD3ENA

```c
#define rAUD3ENA NR30_REG
```

Sound Channel 3, NR30\_REG: Sound on/off

### rAUD3LEN

```c
#define rAUD3LEN NR31_REG
```

Sound Channel 3, NR31\_REG: Sound Length

### rAUD3LEVEL

```c
#define rAUD3LEVEL NR32_REG
```

Sound Channel 3, NR32\_REG: Select output level

### rAUD3LOW

```c
#define rAUD3LOW NR33_REG
```

Sound Channel 3, NR33\_REG: Frequency data Low

### rAUD3HIGH

```c
#define rAUD3HIGH NR34_REG
```

Sound Channel 3, NR34\_REG: Frequency data High

### rAUD4LEN

```c
#define rAUD4LEN NR41_REG
```

Sound Channel 4, NR41\_REG: Sound Length

### rAUD4ENV

```c
#define rAUD4ENV NR42_REG
```

Sound Channel 4, NR42\_REG: Volume Envelope

### rAUD4POLY

```c
#define rAUD4POLY NR43_REG
```

Sound Channel 4, NR43\_REG: Polynomial Counter

### AUD4POLY_WIDTH_15BIT

```c
#define AUD4POLY_WIDTH_15BIT 0x00
```

For Sound Channel 4, NR43\_REG: Polynomial counter use 15 steps

### AUD4POLY_WIDTH_7BIT

```c
#define AUD4POLY_WIDTH_7BIT 0x08
```

For Sound Channel 4, NR43\_REG: Polynomial counter use 7 steps

### rAUD4GO

```c
#define rAUD4GO NR44_REG
```

Sound Channel 4, NR44\_REG: Counter / Consecutive and Initial

### rAUDVOL

```c
#define rAUDVOL NR50_REG
```

Sound Master Volume, NR50: Volume and Cart external sound input (VIN)

### AUDVOL_VOL_LEFT

```c
#define AUDVOL_VOL_LEFT ( x) ((x) << 4)
```

For Sound Master Volume, NR50: Left Volume, Range: 0-7

### AUDVOL_VOL_RIGHT

```c
#define AUDVOL_VOL_RIGHT ( x) ((x))
```

For Sound Master Volume, NR50: Right Volume, Range: 0-7

### AUDVOL_VIN_LEFT

```c
#define AUDVOL_VIN_LEFT 0b10000000
```

For Sound Master Volume, NR50: Cart external sound input (VIN) Left bit, 1 = ON, 0 = OFF

### AUDVOL_VIN_RIGHT

```c
#define AUDVOL_VIN_RIGHT 0b00001000
```

For Sound Master Volume, NR50: Cart external sound input (VIN) Right bit, 1 = ON, 0 = OFF

### rAUDTERM

```c
#define rAUDTERM NR51_REG
```

Sound Panning, NR51: Enable/disable left and right output for sound channels

### AUDTERM_4_LEFT

```c
#define AUDTERM_4_LEFT 0b10000000
```

For Sound Panning, NR51: Channel 4 Left bit, 1 = ON, 0 = OFF

### AUDTERM_3_LEFT

```c
#define AUDTERM_3_LEFT 0b01000000
```

For Sound Panning, NR51: Channel 3 Left bit, 1 = ON, 0 = OFF

### AUDTERM_2_LEFT

```c
#define AUDTERM_2_LEFT 0b00100000
```

For Sound Panning, NR51: Channel 2 Left bit, 1 = ON, 0 = OFF

### AUDTERM_1_LEFT

```c
#define AUDTERM_1_LEFT 0b00010000
```

For Sound Panning, NR51: Channel 1 Left bit, 1 = ON, 0 = OFF

### AUDTERM_4_RIGHT

```c
#define AUDTERM_4_RIGHT 0b00001000
```

For Sound Panning, NR51: Channel 4 Right bit, 1 = ON, 0 = OFF

### AUDTERM_3_RIGHT

```c
#define AUDTERM_3_RIGHT 0b00000100
```

For Sound Panning, NR51: Channel 4 Right bit, 1 = ON, 0 = OFF

### AUDTERM_2_RIGHT

```c
#define AUDTERM_2_RIGHT 0b00000010
```

For Sound Panning, NR51: Channel 4 Right bit, 1 = ON, 0 = OFF

### AUDTERM_1_RIGHT

```c
#define AUDTERM_1_RIGHT 0b00000001
```

For Sound Panning, NR51: Channel 4 Right bit, 1 = ON, 0 = OFF

### rAUDENA

```c
#define rAUDENA NR52_REG
```

Sound Master Control, NR52: ON / OFF

### AUDENA_ON

```c
#define AUDENA_ON 0b10000000
```

For Sound Master Control, NR52: Sound ON

### AUDENA_OFF

```c
#define AUDENA_OFF 0b00000000
```

For Sound Master Control, NR52: Sound OFF

### rLCDC

```c
#define rLCDC LCDC_REG
```

### LCDCF_OFF

```c
#define LCDCF_OFF 0b00000000
```

LCD Control: Off

### LCDCF_ON

```c
#define LCDCF_ON 0b10000000
```

LCD Control: On

### LCDCF_WIN9800

```c
#define LCDCF_WIN9800 0b00000000
```

Window Tile Map: Use 9800 Region

### LCDCF_WIN9C00

```c
#define LCDCF_WIN9C00 0b01000000
```

Window Tile Map: Use 9C00 Region

### LCDCF_WINOFF

```c
#define LCDCF_WINOFF 0b00000000
```

Window Display: Hidden

### LCDCF_WINON

```c
#define LCDCF_WINON 0b00100000
```

Window Display: Visible

### LCDCF_BG8800

```c
#define LCDCF_BG8800 0b00000000
```

BG & Window Tile Data: Use 8800 Region

### LCDCF_BG8000

```c
#define LCDCF_BG8000 0b00010000
```

BG & Window Tile Data: Use 8000 Region

### LCDCF_BG9800

```c
#define LCDCF_BG9800 0b00000000
```

BG Tile Map: use 9800 Region

### LCDCF_BG9C00

```c
#define LCDCF_BG9C00 0b00001000
```

BG Tile Map: use 9C00 Region

### LCDCF_OBJ8

```c
#define LCDCF_OBJ8 0b00000000
```

Sprites Size: 8x8 pixels

### LCDCF_OBJ16

```c
#define LCDCF_OBJ16 0b00000100
```

Sprites Size: 8x16 pixels

### LCDCF_OBJOFF

```c
#define LCDCF_OBJOFF 0b00000000
```

Sprites Display: Hidden

### LCDCF_OBJON

```c
#define LCDCF_OBJON 0b00000010
```

Sprites Display: Visible

### LCDCF_BGOFF

```c
#define LCDCF_BGOFF 0b00000000
```

Background Display: Hidden

### LCDCF_BGON

```c
#define LCDCF_BGON 0b00000001
```

Background Display: Visible

### LCDCF_B_ON

```c
#define LCDCF_B_ON 7
```

Bit for LCD On/Off Select

### LCDCF_B_WIN9C00

```c
#define LCDCF_B_WIN9C00 6
```

Bit for Window Tile Map Region Select

### LCDCF_B_WINON

```c
#define LCDCF_B_WINON 5
```

Bit for Window Display On/Off Control

### LCDCF_B_BG8000

```c
#define LCDCF_B_BG8000 4
```

Bit for BG & Window Tile Data Region Select

### LCDCF_B_BG9C00

```c
#define LCDCF_B_BG9C00 3
```

Bit for BG Tile Map Region Select

### LCDCF_B_OBJ16

```c
#define LCDCF_B_OBJ16 2
```

Bit for Sprites Size Select

### LCDCF_B_OBJON

```c
#define LCDCF_B_OBJON 1
```

Bit for Sprites Display Visible/Hidden Select

### LCDCF_B_BGON

```c
#define LCDCF_B_BGON 0
```

Bit for Background Display Visible/Hidden Select

### rSTAT

```c
#define rSTAT STAT_REG
```

### STATF_LYC

```c
#define STATF_LYC 0b01000000
```

STAT Interrupt: LYC=LY Coincidence Source Enable

### STATF_MODE10

```c
#define STATF_MODE10 0b00100000
```

STAT Interrupt: Mode 2 OAM Source Enable

### STATF_MODE01

```c
#define STATF_MODE01 0b00010000
```

STAT Interrupt: Mode 1 VBlank Source Enable

### STATF_MODE00

```c
#define STATF_MODE00 0b00001000
```

STAT Interrupt: Mode 0 HBlank Source Enable

### STATF_LYCF

```c
#define STATF_LYCF 0b00000100
```

LYC=LY Coincidence Status Flag, Set when LY contains the same value as LYC

### STATF_HBL

```c
#define STATF_HBL 0b00000000
```

Current LCD Mode is: 0, in H-Blank

### STATF_VBL

```c
#define STATF_VBL 0b00000001
```

Current LCD Mode is: 1, in V-Blank

### STATF_OAM

```c
#define STATF_OAM 0b00000010
```

Current LCD Mode is: 2, in OAM-RAM is used by system (Searching OAM)

### STATF_LCD

```c
#define STATF_LCD 0b00000011
```

Current LCD Mode is: 3, both OAM and VRAM used by system (Transferring Data to LCD Controller)

### STATF_BUSY

```c
#define STATF_BUSY 0b00000010
```

When set, VRAM access is unsafe

### STATF_B_LYC

```c
#define STATF_B_LYC 6
```

Bit for STAT Interrupt: LYC=LY Coincidence Source Enable

### STATF_B_MODE10

```c
#define STATF_B_MODE10 5
```

Bit for STAT Interrupt: Mode 2 OAM Source Enable

### STATF_B_MODE01

```c
#define STATF_B_MODE01 4
```

Bit for STAT Interrupt: Mode 1 VBlank Source Enable

### STATF_B_MODE00

```c
#define STATF_B_MODE00 3
```

Bit for STAT Interrupt: Mode 0 HBlank Source Enable

### STATF_B_LYCF

```c
#define STATF_B_LYCF 2
```

Bit for LYC=LY Coincidence Status Flag

### STATF_B_VBL

```c
#define STATF_B_VBL 0
```

### STATF_B_OAM

```c
#define STATF_B_OAM 1
```

### STATF_B_BUSY

```c
#define STATF_B_BUSY 1
```

Bit for when VRAM access is unsafe

### rSCY

```c
#define rSCY
```

### rSCX

```c
#define rSCX SCX_REG
```

### rLY

```c
#define rLY LY_REG
```

### rLYC

```c
#define rLYC LYC_REG
```

### rDMA

```c
#define rDMA DMA_REG
```

### rBGP

```c
#define rBGP BGP_REG
```

### rOBP0

```c
#define rOBP0 OBP0_REG
```

### rOBP1

```c
#define rOBP1 OBP1_REG
```

### rWY

```c
#define rWY WY_REG
```

### rWX

```c
#define rWX WX_REG
```

### rKEY1

```c
#define rKEY1 KEY1_REG
```

### rSPD

```c
#define rSPD KEY1_REG
```

### KEY1F_DBLSPEED

```c
#define KEY1F_DBLSPEED 0b10000000
```

### KEY1F_PREPARE

```c
#define KEY1F_PREPARE 0b00000001
```

### rVBK

```c
#define rVBK VBK_REG
```

### VBK_BANK_0

```c
#define VBK_BANK_0 0
```

Select Regular Map and Normal Tiles (CGB Mode Only)

### VBK_TILES

```c
#define VBK_TILES 0
```

Select Regular Map and Normal Tiles (CGB Mode Only)

### VBK_BANK_1

```c
#define VBK_BANK_1 1
```

Select Map Attributes and Extra Tile Bank (CGB Mode Only)

### VBK_ATTRIBUTES

```c
#define VBK_ATTRIBUTES 1
```

Select Map Attributes and Extra Tile Bank (CGB Mode Only)

### BKGF_PRI

```c
#define BKGF_PRI 0b10000000
```

Background CGB BG and Window over Sprite priority Enabled

### BKGF_YFLIP

```c
#define BKGF_YFLIP 0b01000000
```

Background CGB Y axis flip: Vertically mirrored

### BKGF_XFLIP

```c
#define BKGF_XFLIP 0b00100000
```

Background CGB X axis flip: Horizontally mirrored

### BKGF_BANK0

```c
#define BKGF_BANK0 0b00000000
```

Background CGB Tile VRAM-Bank: Use Bank 0 (CGB Mode Only)

### BKGF_BANK1

```c
#define BKGF_BANK1 0b00001000
```

Background CGB Tile VRAM-Bank: Use Bank 1 (CGB Mode Only)

### BKGF_CGB_PAL0

```c
#define BKGF_CGB_PAL0 0b00000000
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL1

```c
#define BKGF_CGB_PAL1 0b00000001
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL2

```c
#define BKGF_CGB_PAL2 0b00000010
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL3

```c
#define BKGF_CGB_PAL3 0b00000011
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL4

```c
#define BKGF_CGB_PAL4 0b00000100
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL5

```c
#define BKGF_CGB_PAL5 0b00000101
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL6

```c
#define BKGF_CGB_PAL6 0b00000110
```

Background CGB Palette number (CGB Mode Only)

### BKGF_CGB_PAL7

```c
#define BKGF_CGB_PAL7 0b00000111
```

Background CGB Palette number (CGB Mode Only)

### rHDMA1

```c
#define rHDMA1 HDMA1_REG
```

### rHDMA2

```c
#define rHDMA2 HDMA2_REG
```

### rHDMA3

```c
#define rHDMA3 HDMA3_REG
```

### rHDMA4

```c
#define rHDMA4 HDMA4_REG
```

### rHDMA5

```c
#define rHDMA5 HDMA5_REG
```

### HDMA5F_MODE_GP

```c
#define HDMA5F_MODE_GP 0b00000000
```

### HDMA5F_MODE_HBL

```c
#define HDMA5F_MODE_HBL 0b10000000
```

### HDMA5F_BUSY

```c
#define HDMA5F_BUSY 0b10000000
```

### rRP

```c
#define rRP RP_REG
```

### RPF_ENREAD

```c
#define RPF_ENREAD 0b11000000
```

### RPF_DATAIN

```c
#define RPF_DATAIN 0b00000010
```

### RPF_WRITE_HI

```c
#define RPF_WRITE_HI 0b00000001
```

### RPF_WRITE_LO

```c
#define RPF_WRITE_LO 0b00000000
```

### rBCPS

```c
#define rBCPS BCPS_REG
```

### BCPSF_AUTOINC

```c
#define BCPSF_AUTOINC 0b10000000
```

### rBCPD

```c
#define rBCPD BCPD_REG
```

### rOCPS

```c
#define rOCPS OCPS_REG
```

### OCPSF_AUTOINC

```c
#define OCPSF_AUTOINC 0b10000000
```

### rOCPD

```c
#define rOCPD OCPD_REG
```

### rSVBK

```c
#define rSVBK SVBK_REG
```

### rSMBK

```c
#define rSMBK SVBK_REG
```

### rPCM12

```c
#define rPCM12 PCM12_REG
```

### rPCM34

```c
#define rPCM34 PCM34_REG
```

### rIE

```c
#define rIE IE_REG
```

### IEF_HILO

```c
#define IEF_HILO 0b00010000
```

Joypad interrupt enable flag

### IEF_SERIAL

```c
#define IEF_SERIAL 0b00001000
```

Serial interrupt enable flag

### IEF_TIMER

```c
#define IEF_TIMER 0b00000100
```

Timer interrupt enable flag

### IEF_STAT

```c
#define IEF_STAT 0b00000010
```

Stat interrupt enable flag

### IEF_VBLANK

```c
#define IEF_VBLANK 0b00000001
```

VBlank interrupt enable flag

### AUDLEN_DUTY_12_5

```c
#define AUDLEN_DUTY_12_5 0b00000000
```

### AUDLEN_DUTY_25

```c
#define AUDLEN_DUTY_25 0b01000000
```

### AUDLEN_DUTY_50

```c
#define AUDLEN_DUTY_50 0b10000000
```

### AUDLEN_DUTY_75

```c
#define AUDLEN_DUTY_75 0b11000000
```

### AUDLEN_LENGTH

```c
#define AUDLEN_LENGTH ( x) (x)
```

### AUDENV_VOL

```c
#define AUDENV_VOL ( x) ((x) << 4)
```

### AUDENV_UP

```c
#define AUDENV_UP 0b00001000
```

### AUDENV_DOWN

```c
#define AUDENV_DOWN 0b00000000
```

### AUDENV_LENGTH

```c
#define AUDENV_LENGTH ( x) (x)
```

### AUDHIGH_RESTART

```c
#define AUDHIGH_RESTART 0b10000000
```

### AUDHIGH_LENGTH_ON

```c
#define AUDHIGH_LENGTH_ON 0b01000000
```

### AUDHIGH_LENGTH_OFF

```c
#define AUDHIGH_LENGTH_OFF 0b00000000
```

### OAMF_PRI

```c
#define OAMF_PRI 0b10000000
```

BG and Window over Sprite Enabled

### OAMF_YFLIP

```c
#define OAMF_YFLIP 0b01000000
```

Sprite Y axis flip: Vertically mirrored

### OAMF_XFLIP

```c
#define OAMF_XFLIP 0b00100000
```

Sprite X axis flip: Horizontally mirrored

### OAMF_PAL0

```c
#define OAMF_PAL0 0b00000000
```

Sprite Palette number: use OBP0 (Non-CGB Mode Only)

### OAMF_PAL1

```c
#define OAMF_PAL1 0b00010000
```

Sprite Palette number: use OBP1 (Non-CGB Mode Only)

### OAMF_BANK0

```c
#define OAMF_BANK0 0b00000000
```

Sprite Tile VRAM-Bank: Use Bank 0 (CGB Mode Only)

### OAMF_BANK1

```c
#define OAMF_BANK1 0b00001000
```

Sprite Tile VRAM-Bank: Use Bank 1 (CGB Mode Only)

### OAMF_CGB_PAL0

```c
#define OAMF_CGB_PAL0 0b00000000
```

Sprite CGB Palette number: use OCP0 (CGB Mode Only)

### OAMF_CGB_PAL1

```c
#define OAMF_CGB_PAL1 0b00000001
```

Sprite CGB Palette number: use OCP1 (CGB Mode Only)

### OAMF_CGB_PAL2

```c
#define OAMF_CGB_PAL2 0b00000010
```

Sprite CGB Palette number: use OCP2 (CGB Mode Only)

### OAMF_CGB_PAL3

```c
#define OAMF_CGB_PAL3 0b00000011
```

Sprite CGB Palette number: use OCP3 (CGB Mode Only)

### OAMF_CGB_PAL4

```c
#define OAMF_CGB_PAL4 0b00000100
```

Sprite CGB Palette number: use OCP4 (CGB Mode Only)

### OAMF_CGB_PAL5

```c
#define OAMF_CGB_PAL5 0b00000101
```

Sprite CGB Palette number: use OCP5 (CGB Mode Only)

### OAMF_CGB_PAL6

```c
#define OAMF_CGB_PAL6 0b00000110
```

Sprite CGB Palette number: use OCP6 (CGB Mode Only)

### OAMF_CGB_PAL7

```c
#define OAMF_CGB_PAL7 0b00000111
```

Sprite CGB Palette number: use OCP7 (CGB Mode Only)

### OAMF_PALMASK

```c
#define OAMF_PALMASK 0b00000111
```

Mask for Sprite CGB Palette number (CGB Mode Only)

### DEVICE_SCREEN_X_OFFSET

```c
#define DEVICE_SCREEN_X_OFFSET 0
```

Offset of visible screen (in tile units) from left edge of hardware map

### DEVICE_SCREEN_Y_OFFSET

```c
#define DEVICE_SCREEN_Y_OFFSET 0
```

Offset of visible screen (in tile units) from top edge of hardware map

### DEVICE_SCREEN_WIDTH

```c
#define DEVICE_SCREEN_WIDTH 20
```

Width of visible screen in tile units

### DEVICE_SCREEN_HEIGHT

```c
#define DEVICE_SCREEN_HEIGHT 18
```

Height of visible screen in tile units

### DEVICE_SCREEN_BUFFER_WIDTH

```c
#define DEVICE_SCREEN_BUFFER_WIDTH 32
```

Width of hardware map buffer in tile units

### DEVICE_SCREEN_BUFFER_HEIGHT

```c
#define DEVICE_SCREEN_BUFFER_HEIGHT 32
```

Height of hardware map buffer in tile units

### DEVICE_SCREEN_MAP_ENTRY_SIZE

```c
#define DEVICE_SCREEN_MAP_ENTRY_SIZE 1
```

Number of bytes per hardware map entry

### DEVICE_SPRITE_PX_OFFSET_X

```c
#define DEVICE_SPRITE_PX_OFFSET_X 8
```

Offset of sprite X coordinate origin (in pixels) from left edge of visible screen

### DEVICE_SPRITE_PX_OFFSET_Y

```c
#define DEVICE_SPRITE_PX_OFFSET_Y 16
```

Offset of sprite Y coordinate origin (in pixels) from top edge of visible screen

### DEVICE_WINDOW_PX_OFFSET_X

```c
#define DEVICE_WINDOW_PX_OFFSET_X 7
```

Minimal X coordinate of the window layer

### DEVICE_WINDOW_PX_OFFSET_Y

```c
#define DEVICE_WINDOW_PX_OFFSET_Y 0
```

Minimal Y coordinate of the window layer

### DEVICE_SCREEN_PX_WIDTH

```c
#define DEVICE_SCREEN_PX_WIDTH (DEVICE_SCREEN_WIDTH * 8)
```

Width of visible screen in pixels

### DEVICE_SCREEN_PX_HEIGHT

```c
#define DEVICE_SCREEN_PX_HEIGHT (DEVICE_SCREEN_HEIGHT * 8)
```

Height of visible screen in pixels

## Variable

### _VRAM

```c
__BYTES _VRAM[]
```

Memory map

### _VRAM8000

```c
__BYTES _VRAM8000[]
```

### _VRAM8800

```c
__BYTES _VRAM8800[]
```

### _VRAM9000

```c
__BYTES _VRAM9000[]
```

### _SCRN0

```c
__BYTES _SCRN0[]
```

### _SCRN1

```c
__BYTES _SCRN1[]
```

### _SRAM

```c
__BYTES _SRAM[]
```

### _RAM

```c
__BYTES _RAM[]
```

### _RAMBANK

```c
__BYTES _RAMBANK[]
```

### _OAMRAM

```c
__BYTES _OAMRAM[]
```

### _IO

```c
__BYTE_REG _IO[]
```

### _AUD3WAVERAM

```c
__BYTE_REG _AUD3WAVERAM[]
```

### _HRAM

```c
__BYTE_REG _HRAM[]
```

### rRAMG

```c
__BYTE_REG rRAMG
```

MBC5 registers

### rROMB0

```c
__BYTE_REG rROMB0
```

### rROMB1

```c
__BYTE_REG rROMB1
```

### rRAMB

```c
__BYTE_REG rRAMB
```

### rMBC7_SRAM_ENABLE_1

```c
__BYTE_REG rMBC7_SRAM_ENABLE_1
```

MBC7 registers

### rMBC7_SRAM_ENABLE_2

```c
__BYTE_REG rMBC7_SRAM_ENABLE_2
```

### rMBC7_LATCH_1

```c
__BYTE_REG rMBC7_LATCH_1
```

### rMBC7_LATCH_2

```c
__BYTE_REG rMBC7_LATCH_2
```

### rMBC7_ACCEL_X_LO

```c
__BYTE_REG rMBC7_ACCEL_X_LO
```

### rMBC7_ACCEL_X_HI

```c
__BYTE_REG rMBC7_ACCEL_X_HI
```

### rMBC7_ACCEL_Y_LO

```c
__BYTE_REG rMBC7_ACCEL_Y_LO
```

### rMBC7_ACCEL_Y_HI

```c
__BYTE_REG rMBC7_ACCEL_Y_HI
```

### P1_REG

```c
__REG P1_REG
```

IO Registers Joystick register

**See also**

joypad(), add\_JOY(), IEF\_HILO, P1F\_5, P1F\_4, P1F\_3, P1F\_2, P1F\_1, P1F\_0, P1F\_GET\_DPAD, P1F\_GET\_BTN, P1F\_GET\_NONE

### SB_REG

```c
__REG SB_REG
```

Serial IO data buffer

### SC_REG

```c
__REG SC_REG
```

Serial IO control register

### DIV_REG

```c
__REG DIV_REG
```

Divider register

### TIMA_REG

```c
__REG TIMA_REG
```

Timer counter

### TMA_REG

```c
__REG TMA_REG
```

Timer modulo

### TAC_REG

```c
__REG TAC_REG
```

Timer control

### IF_REG

```c
__REG IF_REG
```

Interrupt flags: IEF\_HILO, IEF\_SERIAL, IEF\_TIMER, IEF\_STAT, IEF\_VBLANK

### NR10_REG

```c
__REG NR10_REG
```

Sound Channel 1, NR10: Sweep

### NR11_REG

```c
__REG NR11_REG
```

Sound Channel 1, NR11: Sound length/Wave pattern duty

### NR12_REG

```c
__REG NR12_REG
```

Sound Channel 1, NR12: Volume Envelope

### NR13_REG

```c
__REG NR13_REG
```

Sound Channel 1, NR13: Frequency Low

### NR14_REG

```c
__REG NR14_REG
```

Sound Channel 1, NR14: Frequency High

### NR21_REG

```c
__REG NR21_REG
```

Sound Channel 2, NR21\_REG: Tone

### NR22_REG

```c
__REG NR22_REG
```

Sound Channel 2, NR22\_REG: Volume Envelope

### NR23_REG

```c
__REG NR23_REG
```

Sound Channel 2, NR23\_REG: Frequency data Low

### NR24_REG

```c
__REG NR24_REG
```

Sound Channel 2, NR24\_REG: Frequency data High

### NR30_REG

```c
__REG NR30_REG
```

Sound Channel 3, NR30\_REG: Sound on/off

### NR31_REG

```c
__REG NR31_REG
```

Sound Channel 3, NR31\_REG: Sound Length

### NR32_REG

```c
__REG NR32_REG
```

Sound Channel 3, NR32\_REG: Select output level

### NR33_REG

```c
__REG NR33_REG
```

Sound Channel 3, NR33\_REG: Frequency data Low

### NR34_REG

```c
__REG NR34_REG
```

Sound Channel 3, NR34\_REG: Frequency data High

### NR41_REG

```c
__REG NR41_REG
```

Sound Channel 4, NR41\_REG: Sound Length

### NR42_REG

```c
__REG NR42_REG
```

Sound Channel 4, NR42\_REG: Volume Envelope

### NR43_REG

```c
__REG NR43_REG
```

Sound Channel 4, NR43\_REG: Polynomial Counter

### NR44_REG

```c
__REG NR44_REG
```

Sound Channel 4, NR44\_REG: Counter / Consecutive and Initial

### NR50_REG

```c
__REG NR50_REG
```

Sound Master Volume, NR50: Volume and Cart external sound input (VIN)

### NR51_REG

```c
__REG NR51_REG
```

Sound Panning, NR51: Enable/disable left and right output for sound channels

### NR52_REG

```c
__REG NR52_REG
```

Sound Master Control, NR52: ON / OFF

### AUD3WAVE

```c
__BYTE_REG AUD3WAVE[16]
```

### PCM_SAMPLE

```c
__BYTE_REG PCM_SAMPLE[16]
```

### LCDC_REG

```c
__REG LCDC_REG
```

LCD control

### STAT_REG

```c
__REG STAT_REG
```

LCD status

### SCY_REG

```c
__REG SCY_REG
```

Scroll Y

### SCX_REG

```c
__REG SCX_REG
```

Scroll X

### LY_REG

```c
__REG LY_REG
```

LCDC Y-coordinate

### LYC_REG

```c
__REG LYC_REG
```

LY compare

### DMA_REG

```c
__REG DMA_REG
```

DMA transfer

### BGP_REG

```c
__REG BGP_REG
```

Set and Read the Background palette.  
  
Example with the DMG\_PALETTE() helper function and constants:  
BGP\_REG = DMG\_PALETTE(DMG\_BLACK, DMG\_DARK\_GRAY, DMG\_LITE\_GRAY, DMG\_WHITE);

### OBP0_REG

```c
__REG OBP0_REG
```

Set and Read the OBJ (Sprite) palette 0.  
  
The first color entry is always transparent.  
  
Example with the DMG\_PALETTE() helper function and constants:  
OBP0\_REG = DMG\_PALETTE(DMG\_BLACK, DMG\_DARK\_GRAY, DMG\_LITE\_GRAY, DMG\_WHITE);

### OBP1_REG

```c
__REG OBP1_REG
```

Set and Read the OBJ (Sprite) palette 1.  
  
The first color entry is always transparent.  
  
Example with the DMG\_PALETTE() helper function and constants:  
OBP1\_REG = DMG\_PALETTE(DMG\_BLACK, DMG\_DARK\_GRAY, DMG\_LITE\_GRAY, DMG\_WHITE);

### WY_REG

```c
__REG WY_REG
```

Window Y coordinate

### WX_REG

```c
__REG WX_REG
```

Window X coordinate

### KEY1_REG

```c
__REG KEY1_REG
```

CPU speed

### VBK_REG

```c
__REG VBK_REG
```

VRAM bank select (CGB only)

**See also**

VBK\_BANK\_0, VBK\_TILES, VBK\_BANK\_1, VBK\_ATTRIBUTES

### HDMA1_REG

```c
__REG HDMA1_REG
```

DMA control 1

### HDMA2_REG

```c
__REG HDMA2_REG
```

DMA control 2

### HDMA3_REG

```c
__REG HDMA3_REG
```

DMA control 3

### HDMA4_REG

```c
__REG HDMA4_REG
```

DMA control 4

### HDMA5_REG

```c
__REG HDMA5_REG
```

DMA control 5

### RP_REG

```c
__REG RP_REG
```

IR port

### BCPS_REG

```c
__REG BCPS_REG
```

BG color palette specification

### BCPD_REG

```c
__REG BCPD_REG
```

BG color palette data

### OCPS_REG

```c
__REG OCPS_REG
```

OBJ color palette specification

### OCPD_REG

```c
__REG OCPD_REG
```

OBJ color palette data

### SVBK_REG

```c
__REG SVBK_REG
```

Selects the WRAM upper region bank (CGB Only). WRAM Banking is NOT officially supported in GBDK and SDCC. The stack must be moved and other special care taken.

### PCM12_REG

```c
__REG PCM12_REG
```

Sound channel 1&2 PCM amplitude (R)

### PCM34_REG

```c
__REG PCM34_REG
```

Sound channel 3&4 PCM amplitude (R)

### IE_REG

```c
__REG IE_REG
```

Interrupt enable
