# Links, Tools and Debugging

> Source: https://gbdk.org/docs/api/docs_links_and_tools.html (GBDK-2020 v4.5.0)

This is a brief list of useful tools and information. It is not meant to be complete or exhaustive, for a larger list see the Awesome Game Boy Development list.

## SDCC Compiler Suite User Manual

-   GBDK-2020 uses the SDCC compiler and related tools. The SDCC manual goes into much more detail about available features and how to use them.  
    http://sdcc.sourceforge.net/doc/sdccman.pdf  
    http://sdcc.sourceforge.net
-   The SDCC assembler and linker (sdas / asxxxx and aslink) manual.  
    https://sourceforge.net/p/sdcc/code/HEAD/tree/trunk/sdcc/sdas/doc/asmlnk.txt

## Getting Help

-   GBDK Discord community:  
    https://github.com/gbdk-2020/gbdk-2020/#discord-servers
-   Game Boy discussion forum:  
    https://gbdev.gg8.se/forums/

## Game Boy Documentation

-   **Pandocs**  
    Extensive and up-to-date technical documentation about the Game Boy and related hardware.  
    https://gbdev.io/pandocs/
-   **Awesome Game Boy Development list**  
    A list of Game Boy/Color development resources, tools, docs, related projects and homebrew.  
    https://gbdev.io/resources.html

## Sega Master System / Game Gear Documentation

-   **SMS Power!**  
    Community site with technical documentation, reviews and other content related to the Sega 8-bit systems.  
    https://www.smspower.org/

## Mega Duck / Cougar Boy Documentation

-   **MegaDuck.dev**  
    A collection of technical information and resources for the Mega Duck / Cougar Boy console.  
    https://megaduck.dev/

## Tutorials

-   **Larold's Jubilant Junkyard Tutorials**  
    Several walk throughs about the fundamentals of developing for the Game Boy with GBDK-2020. There are simple examples with source code.  
    https://laroldsjubilantjunkyard.com/tutorials/
-   **Gaming Monsters Tutorials**  
    Several video tutorials and code for making games with GBDK/GBDK-2020.  
    https://www.youtube.com/playlist?list=PLeEj4c2zF7PaFv5MPYhNAkBGrkx4iPGJo  
    https://github.com/gingemonster/GamingMonstersGameBoySampleCode
-   **Pocket Leage Tutorial**  
    https://blog.ty-porter.dev/development/2021/04/04/writing-a-gameboy-game-in-2021-pt-0.html

## Example code

-   **Simplified GBDK examples**  
    https://github.com/mrombout/gbdk\_playground/commits/master

## Graphics Tools

-     
    **Game Boy Tile Designer and Map Builder (GBTD / GBMB)**  
    Sprite / Tile editor and Map Builder that can export to C that works with GBDK.  
    This is an updated version with const export fixed and other improvements.  
    https://github.com/gbdk-2020/GBTD\_GBMB
    -   A GIMP plugin to read/write GBR/GBM files and do map conversion:  
        https://github.com/bbbbbr/gimp-tilemap-gb
    -   Command line version of the above tool that doesn't require GIMP (png2gbtiles):  
        https://github.com/bbbbbr/gimp-tilemap-gb/tree/master/console
-   **Tilemap Studio**  
    A tilemap editor for Game Boy, GBC, GBA, or SNES projects.  
    https://github.com/Rangi42/tilemap-studio/

## Music And Sound Effects for the Game Boy

-   **hUGEtracker** and **hUGEdriver**  
    A tracker and music driver that work with GBDK and RGBDS. It is smaller, more efficient and more versatile than gbt\_player.  
    https://github.com/SuperDisk/hUGEDriver  
    https://github.com/SuperDisk/hUGETracker
-   **CBT-FX**  
    A sound effects driver which can play effects created in FX Hammer. https://github.com/datguywitha3ds/CBT-FX
-   **VGM2GBSFX**  
    A sound effects converter and driver for DMG VGM files, FX Hammer and PCM WAV files. https://github.com/untoxa/VGM2GBSFX
-   **GBT Player**  
    A .mod converter and music driver that works with GBDK and RGBDS.  
    https://github.com/AntonioND/gbt-player  
    Docs from GBStudio that should mostly apply: https://www.gbstudio.dev/docs/music/

## Music And Sound Effects for the SMS/Game Gear

-   **Banjo**  
    A sound driver for Sega Master System and Game Gear which can import from Furnace tracker.  
    -   https://github.com/joffb/banjo An example of using it with GBDK can be found in the CrossZGB engine.
    -   https://github.com/gbdk-2020/CrossZGB/commit/8ecd46639f3af420cfe139fc155740e8aa14d7c5

## Emulators

-   **Emulicious**  
    An accurate emulator with extensive tools including source level debugging. https://emulicious.net/
-   **BGB**  
    Accurate emulator, has useful debugging tools.  
    http://bgb.bircd.org/
-   **Super Junior SameDuck** The only MegaDuck emulator with support for the Mega Duck Laptop models (Quique and Junior Super Computer) https://github.com/bbbbbr/SuperJuniorSameDuck  
    

Intellisense in VSCode may have trouble identifying some GBDK types or functions, and therefore flag them as warnings or unidentified.

GBDK platform constants can be declared so that header files are parsed more completely in VSCode. The following `c_cpp_properties.json` example may be adapted for your own project.

    {
        "configurations": \[
            {
                "name": "gameboy",
                "includePath": \[
                    "${workspaceFolder}/src/\*\*",
                    "${workspaceFolder}/res/\*\*",
                    "${workspaceFolder}/include/\*\*",
                    "${workspaceFolder}/../../../gbdk/include/\*\*"
                \],
                "defines": \["\_\_PORT\_sm83", "\_\_TARGET\_gb"\],
                "compilerPath": "",
                "cStandard": "c11",
                "intelliSenseMode": "${default}",
                "compilerArgs": \[\],
                "browse": {
                    "limitSymbolsToIncludedHeaders": true
                }
            }
        \],
        "version": 4
    }

## Debugging tools

-   **Emulicious debug adapter**  
    Provides source-level debugging in VS Code and Sublime Text that works with GBDK2020.  
    https://marketplace.visualstudio.com/items?itemName=emulicious.emulicious-debugger
    -   If compiler optimization is making the program source hard to step through in the debugger then adding this flag to lcc can help. Note that using this flag will likely reduce code performance and increase code size while enabled, so it is best to only use it temporarily.
        -   `-Wf--max-allocs-per-node0`
-   **romusage**  
    Calculate used and free space in banks (ROM/RAM) and warn about errors such as bank overflows.  
    See romusage-settings
-   **noi file to sym conversion for bgb**  
    Debug information in .noi files can be converted to a symbol format that BGB recognizes using:
    -   lcc : `-Wm-yS` (with `--debug`, or `-Wl-j` to create the .noi)
    -   directly with makebin : `-yS` (with `-j` passed to the linker)
-   **src2sym.pl**  
    Add line-by-line C source code to the main symbol file in a BGB compatible format. This allows for C source-like debugging in BGB in a limited way. https://gbdev.gg8.se/forums/viewtopic.php?id=710

## Optimizing Assembly

-   **Optimizing Assembly Code**  
    Pret has a useful guide to optimizing assembly for the Game Boy for times when asm using in a project in addition to C. https://github.com/pret/pokecrystal/wiki/Optimizing-assembly-code

## Continuous Integration and Deployment

-   **GBDK GitHub Action Builder**  
    A Github Action which provides basic CI/CD for building projects based on GBDK (not for building GBDK itself).  
    https://github.com/wujood/gbdk-2020-github-builder
