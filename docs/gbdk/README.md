# GBDK-2020 Reference (v4.5.0)

Local Markdown copy of the GBDK-2020 documentation for Danger Noodle (copied from RogueGB).
Source: https://gbdk.org/docs/api/ (Doxygen docs) and the `4.5.0` tag of
https://github.com/gbdk-2020/gbdk-2020 (raw headers). Captured 2026-10-10.

Only Game Boy–relevant material is included. The NES, SMS/Game Gear, MSX,
Mega Duck and 6502/Z80 headers were left out.

## Layout

| Folder | What's in it |
|---|---|
| `guides/` | The hand-written manual pages, converted to Markdown |
| `api/` | One file per header: every macro, type, variable and function with its signature and docs |
| `include/` | The original `.h` files from GBDK 4.5.0, which are the source of truth when the docs are unclear |

## Where to look for what

| Topic | File |
|---|---|
| Install, first build, `lcc` basics | `guides/01-getting-started.md` |
| Sprites, backgrounds, window, input, VRAM loading | `api/gb/gb.h.md` |
| Interrupts, startup behavior, compression, inline asm, incbin, known limits | `guides/02-using-gbdk.md` |
| Asset conversion (`png2asset`) | `guides/05-toolchain.md`, `guides/09-faq.md` |
| Writing fast C for SDCC, data types, `const`, globals vs locals | `guides/03-coding-guidelines.md` |
| ROM/SRAM banking, MBC types, `#pragma bank`, autobanking, saves | `guides/04-rom-banking-mbcs.md`, `api/gbdk/far_ptr.h.md` |
| Toolchain (lcc, sdcc, makebin, png2asset, bankpack) | `guides/05-toolchain.md` |
| Every compiler/linker flag | `guides/06-toolchain-settings.md` |
| Cross-platform macros, platform differences | `guides/07-supported-consoles.md` |
| Example programs that ship with GBDK | `guides/08-example-programs.md` |
| Common gotchas | `guides/09-faq.md` |
| Emulators, debuggers, asset tools | `guides/10-links-and-tools.md` |
| Breaking changes between versions | `guides/11-migrating-versions.md` |
| Changelog | `guides/12-release-notes.md` |
| Hardware registers (LCDC, STAT, OAM, sound, DIV, etc.) | `api/gb/hardware.h.md` |
| Game Boy Color: palettes, VRAM bank 1, double speed | `api/gb/cgb.h.md` |
| Metasprites (multi-tile sprites) | `api/gb/metasprites.h.md` |
| Interrupt handlers | `api/gb/isr.h.md` |
| Random numbers (`rand`, `initrand`, `arand`) | `api/rand.h.md` |
| Super Game Boy borders and palettes | `api/gb/sgb.h.md` |
| Compression (gb, RLE, ZX0) | `api/gb/gbdecompress.h.md`, `api/gbdk/rledecompress.h.md`, `api/gbdk/zx0decompress.h.md` |
| Emulator debug logging (Emulicious, BGB) | `api/gbdk/emu_debug.h.md` |
| Embedding binary files | `api/gbdk/incbin.h.md` |
| Score/BCD math | `api/gb/bcd.h.md` |
| Fixed-width ints, `memcpy`/`memset` | `api/stdint.h.md`, `api/asm/sm83/string.h.md` |

## Guides

| File | Page |
|---|---|
| `guides/00-overview.md` | General Documentation (index) |
| `guides/01-getting-started.md` | Getting Started |
| `guides/02-using-gbdk.md` | Using GBDK |
| `guides/03-coding-guidelines.md` | Coding Guidelines |
| `guides/04-rom-banking-mbcs.md` | ROM/SRAM Banking and MBCs |
| `guides/05-toolchain.md` | GBDK Toolchain |
| `guides/06-toolchain-settings.md` | Toolchain settings |
| `guides/07-supported-consoles.md` | Supported Consoles & Cross Compiling |
| `guides/08-example-programs.md` | Example Programs |
| `guides/09-faq.md` | FAQ |
| `guides/10-links-and-tools.md` | Links, Tools and Debugging |
| `guides/11-migrating-versions.md` | Migrating to new GBDK Versions |
| `guides/12-release-notes.md` | GBDK Release Notes |

## API files (symbol count)

- `api/gb/`: `gb.h` (213), `hardware.h` (312), `cgb.h` (32), `drawing.h` (29), `sgb.h` (28), `metasprites.h` (18), `isr.h` (8), `bcd.h` (7), `gbdecompress.h` (4), `hblankcpy.h` (4), `crash_handler.h` (1), `emu_debug.h`, `bgb_emu.h`
- `api/gbdk/`: `emu_debug.h` (17), `far_ptr.h` (11), `font.h` (11), `console.h` (5), `incbin.h` (4), `rledecompress.h` (3), `zx0decompress.h` (1), `version.h` (1), plus `bcd.h`, `gbdecompress.h`, `metasprites.h`, `platform.h`, `gbdk-lib.h` (these only redirect to the platform header)
- `api/asm/`: `types.h` (20), `sm83/string.h` (13), `sm83/types.h` (9), `sm83/stdarg.h` (4), `sm83/provides.h` (3)
- `api/` (C library): `stdint.h` (72), `typeof.h` (21), `limits.h` (18), `stdlib.h` (15), `rand.h` (9), `setjmp.h` (9), `stddef.h` (8), `ctype.h` (7), `stdio.h` (6), `time.h` (4), `stdbool.h` (4), `types.h` (4), `assert.h` (2), `stdatomic.h` (2), `stdnoreturn.h` (1), `string.h`, `stdarg.h`

## Notes

- Cross-reference links from the original HTML were removed, so search by symbol name (e.g. `### set_sprite_data`).
- Inline code examples inside function docs sometimes lost their line breaks during conversion. If one is hard to read, check the matching file in `include/`.
- To refresh for a newer GBDK version, recapture from gbdk.org and change the version tag above.
