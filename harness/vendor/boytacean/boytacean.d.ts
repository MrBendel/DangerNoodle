/* tslint:disable */
/* eslint-disable */

export class BessState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    agent_wa(): string;
    has_image_wa(): boolean;
    image_eager_wa(): Uint8Array;
    model_wa(): string;
    timestamp_wa(): bigint;
    title_wa(): string;
}

export enum BootRom {
    Dmg = 0,
    Sgb = 1,
    DmgBootix = 2,
    MgbBootix = 3,
    Cgb = 4,
    CgbBoytacean = 5,
    Other = 6,
    None = 7,
}

export class BosState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    agent_wa(): string;
    has_image_wa(): boolean;
    image_eager_wa(): Uint8Array;
    model_wa(): string;
    timestamp_wa(): bigint;
    title_wa(): string;
}

export class BoscState {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

/**
 * Structure that defines the ROM and ROM contents
 * of a Game Boy cartridge.
 *
 * Should correctly address the specifics of all the
 * major MBCs (Memory Bank Controllers).
 */
export class Cartridge {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    cgb_flag(): CgbMode;
    checksum(): number;
    clear_ram_data(): void;
    description(column_length: number): string;
    gb_mode(): GameBoyMode;
    has_battery(): boolean;
    /**
     * A cartridge is considered legacy (DMG only) if it does
     * not have a CGB flag bit (bit 7 of 0x0143) set.
     *
     * These are the monochromatic only cartridges built
     * for the original DMG Game Boy.
     */
    is_legacy(): boolean;
    licensee(): Licensee;
    ram_data_eager(): Uint8Array;
    ram_size(): RamSize;
    ram_size_s(): string;
    region(): Region;
    rom_data_eager(): Uint8Array;
    rom_size(): RomSize;
    rom_size_s(): string;
    rom_type(): RomType;
    rom_type_s(): string;
    set_ram_data(data: Uint8Array): void;
    sgb_flag(): SgbMode;
    title(): string;
    valid_checksum(): boolean;
}

export enum CgbMode {
    NoCgb = 0,
    CgbCompatible = 128,
    CgbOnly = 192,
}

export class ClockFrame {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    frame_buffer_eager(): Uint8Array | undefined;
    cycles: bigint;
    frames: number;
}

export class FromGbOptions {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static new(thumbnail: boolean, state_format?: StateFormat | null, agent?: string | null, agent_version?: string | null): FromGbOptions;
}

/**
 * Top level structure that abstracts the usage of the
 * Game Boy system under the Boytacean emulator.
 *
 * Should serve as the main entry-point API.
 */
export class GameBoy {
    free(): void;
    [Symbol.dispose](): void;
    add_cheat_code_wa(code: string): boolean;
    apu_clock(cycles: number): void;
    apu_enabled(): boolean;
    attach_null_serial(): void;
    attach_printer_serial(): void;
    attach_stdout_serial(): void;
    audio_all_output(): Uint16Array;
    audio_buffer_eager(clear: boolean): Int16Array;
    audio_ch1_enabled(): boolean;
    audio_ch1_output(): number;
    audio_ch2_enabled(): boolean;
    audio_ch2_output(): number;
    audio_ch3_enabled(): boolean;
    audio_ch3_output(): number;
    audio_ch4_enabled(): boolean;
    audio_ch4_output(): number;
    audio_channels(): number;
    audio_filter_mode_wa(): number;
    audio_output(): number;
    audio_sampling_rate(): number;
    /**
     * Direct boot method that immediately jumps the machine
     * to the post boot state, this will effectively skip the
     * boot sequence and jump to the cartridge execution.
     */
    boot(): void;
    boot_rom(): BootRom;
    boot_rom_s(): string;
    cartridge_eager(): Cartridge;
    /**
     * Advance the clock of the system by one tick, this will
     * usually imply executing one CPU instruction and advancing
     * all the other components of the system by the required
     * amount of cycles.
     *
     * This method takes into account the current speed of the
     * system (single or double) and will execute the required
     * amount of cycles in the other components of the system
     * accordingly.
     *
     * The amount of cycles executed by the CPU is returned.
     */
    clock(): number;
    clock_freq(): number;
    clock_freq_s(): string;
    /**
     * Risky function that will clock the CPU multiple times
     * allowing an undefined number of cycles to be executed
     * in the other Game Boy components.
     *
     * This can cause unwanted behaviour in components like
     * the PPU where only one mode switch operation is expected
     * per each clock call.
     *
     * At the end of this execution major synchronization issues
     * may arise, so use with caution.
     */
    clock_many(count: number): number;
    /**
     * Function equivalent to [`clock()`][GameBoy::clock()] but that allows pre-emptive
     * breaking of the clock cycle loop if the PC (Program Counter)
     * reaches the provided address, making sure that in such a situation
     * the devices are not clocked.
     */
    clock_step(addr: number): number;
    /**
     * Equivalent to [`clock()`][GameBoy::clock()] but allows the execution of multiple
     * clock operations in a single call.
     */
    clocks(count: number): bigint;
    /**
     * Clocks the emulator until the limit of cycles that has been
     * provided and returns the amount of cycles that have been
     * clocked.
     */
    clocks_cycles(limit: number): bigint;
    /**
     * Clocks the emulator until the limit of cycles that has been
     * provided and returns the amount of cycles that have been
     * clocked together with the frame buffer of the PPU.
     *
     * Allows a caller to clock the emulator and at the same time
     * retrieve the frame buffer of the PPU at the proper timing
     * (on V-Blank).
     *
     * This method allows for complex foreign call optimizations
     * by preventing the need to call the emulator clock multiple
     * times to obtain the right frame buffer retrieval timing.
     */
    clocks_frame_buffer(limit: number): ClockFrame;
    cpu_clock(): number;
    description(column_length: number): string;
    description_debug(): string;
    display_height(): number;
    display_width(): number;
    dma_clock(cycles: number): void;
    dma_enabled(): boolean;
    frame_buffer_eager(): Uint8Array;
    frame_buffer_raw_eager(): Uint8Array;
    /**
     * Obtains the tile structure for the tile at the
     * given index, no conversion in the pixel buffer
     * is done so that the color reference is the GB one.
     */
    get_tile(index: number): Tile;
    /**
     * Obtains the pixel buffer for the tile at the
     * provided index, converting the color buffer
     * using the currently loaded (background) palette.
     */
    get_tile_buffer(index: number): Uint8Array;
    hram_eager(): Uint8Array;
    /**
     * Updates the emulation mode using the cartridge info
     * for the provided data to obtain the CGB flag value
     * and set the mode accordingly.
     *
     * This can be an expensive operation as it will require
     * cartridge data parsing to obtain the CGB flag.
     * It will also have to clone the data buffer.
     */
    infer_mode_wa(data: Uint8Array): void;
    is_cgb(): boolean;
    is_dmg(): boolean;
    is_sgb(): boolean;
    key_lift(key: PadKey): void;
    key_press(key: PadKey): void;
    /**
     * Loads the machine directly to after the boot execution state,
     * setting the state of the system accordingly and updating the
     * Program Counter (PC) to the post boot address (0x0100).
     *
     * Should allow the machine to jump to the cartridge (ROM) execution
     * directly, skipping the boot sequence.
     *
     * Currently supports only DMG machines.
     */
    load_boot_state(): void;
    load_callbacks_wa(): void;
    load_logger_wa(): void;
    load_null_wa(): void;
    load_printer_wa(): void;
    load_rom_wa(data: Uint8Array): Cartridge;
    /**
     * Unsafe load strategy that will panic the current system
     * in case there are boot ROM loading issues.
     */
    load_unsafe(boot: boolean): void;
    mode(): GameBoyMode;
    multiplier(): number;
    constructor(mode?: GameBoyMode | null);
    /**
     * Clocks the system until the next frame is reached and returns
     * the amount of cycles that have been clocked.
     *
     * This function is used to clock the system until the next frame
     * is reached and returns the amount of cycles that have been
     * clocked.
     */
    next_frame(): number;
    ppu_clock(cycles: number): void;
    ppu_enabled(): boolean;
    ppu_frame(): number;
    ppu_ly(): number;
    ppu_mode(): PpuMode;
    ram_data_eager(): Uint8Array;
    ram_size(): RamSize;
    registers(): Registers;
    reload_wa(): void;
    /**
     * Resets the entire state of the Game Boy system,
     * including all its components and the CPU.
     *
     * This method ensures that the [`Ppu`], [`Apu`], [`Timer`],
     * [`Serial`], [`Mmu`], and [`Cpu`] are all reset to their initial states.
     */
    reset(): void;
    /**
     * Resets all the cheats currently registered in the system.
     *
     * It clears both Game Genie and GameShark cheats from the
     * respective cheat managers.
     */
    reset_cheats(): void;
    serial_clock(cycles: number): void;
    serial_enabled(): boolean;
    set_all_enabled(value: boolean): void;
    set_apu_enabled(value: boolean): void;
    set_audio_ch1_enabled(enabled: boolean): void;
    set_audio_ch2_enabled(enabled: boolean): void;
    set_audio_ch3_enabled(enabled: boolean): void;
    set_audio_ch4_enabled(enabled: boolean): void;
    set_audio_filter_mode_wa(mode: number): void;
    set_boot_rom(value: BootRom): void;
    set_clock_freq(value: number): void;
    set_dma_enabled(value: boolean): void;
    set_mode(value: GameBoyMode): void;
    set_palette_colors_wa(value: any[]): void;
    static set_panic_hook_wa(): void;
    set_ppu_enabled(value: boolean): void;
    set_ram_data(ram_data: Uint8Array): void;
    set_serial_enabled(value: boolean): void;
    set_timer_enabled(value: boolean): void;
    speed(): GameBoySpeed;
    /**
     * Clocks the system until the Program Counter (PC) reaches the
     * provided address and returns the amount of cycles that have been
     * clocked.
     *
     * This advances the emulation step by step, accumulating the number of
     * cycles spent until the CPU's PC matches `addr`. Useful for precise
     * debugging or driving the emulator to a known execution point.
     */
    step_to(addr: number): number;
    timer_clock(cycles: number): void;
    timer_enabled(): boolean;
    /**
     * Verifies if the provided data represents a valid Game Boy ROM.
     *
     * It is used to verify if the provided data is a valid ROM
     * before loading it into the Game Boy.
     * Preventing the loading of invalid ROMs into the Game Boy which
     * would cause the emulator to crash at runtime.
     *
     * This approach is not guaranteed to be 100% accurate, but it
     * is a good (enough) way to verify if the provided data is
     * a valid ROM.
     */
    static verify_rom(data: Uint8Array): boolean;
    vram_eager(): Uint8Array;
    vram_size(): RamSize;
}

export class GameBoyConfig {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    apu_enabled(): boolean;
    clock_freq(): number;
    dma_enabled(): boolean;
    is_cgb(): boolean;
    is_dmg(): boolean;
    is_sgb(): boolean;
    mode(): GameBoyMode;
    ppu_enabled(): boolean;
    serial_enabled(): boolean;
    set_apu_enabled(value: boolean): void;
    set_clock_freq(value: number): void;
    set_dma_enabled(value: boolean): void;
    set_mode(value: GameBoyMode): void;
    set_ppu_enabled(value: boolean): void;
    set_serial_enabled(value: boolean): void;
    set_timer_enabled(value: boolean): void;
    timer_enabled(): boolean;
}

export enum GameBoyDevice {
    Cpu = 0,
    Mmu = 1,
    Ppu = 3,
    Apu = 4,
    Dma = 5,
    Pad = 6,
    Timer = 7,
    Serial = 8,
    Unknown = 100,
}

/**
 * Enumeration that describes the multiple running
 * modes of the Game Boy emulator.
 *
 * DMG = Original Game Boy
 * CGB = Game Boy Color
 * SGB = Super Game Boy
 */
export enum GameBoyMode {
    Dmg = 1,
    Cgb = 2,
    Sgb = 3,
}

export enum GameBoySpeed {
    Normal = 0,
    Double = 1,
}

export class GameGenie {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

/**
 * Implementation of the GameShark cheat code system
 * that "patches" RAM entries, making use of the V-Blank
 * time to do that.
 *
 * The codes in the GameShark system are in an hexadecimal
 * ASCII format in the form of "ABCDGHEF" where:
 * AB = RAM bank
 * CD = New data
 * GH = Address LSB
 * EF = Address MSB
 *
 * [Wikipedia - GameShark](https://en.wikipedia.org/wiki/GameShark)
 */
export class GameShark {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class Info {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static compilation_date(): string;
    static compilation_time(): string;
    /**
     * Obtains the name of the compiler that has been
     * used in the compilation of the base Boytacean
     * library. Can be used for diagnostics.
     */
    static compiler(): string;
    static compiler_version(): string;
    /**
     * Obtains the name of the emulator.
     */
    static name(): string;
    /**
     * Obtains the name of the emulator in lowercase.
     * Useful for file paths and other cases where.
     */
    static name_lower(): string;
    /**
     * Obtains the system this emulator is emulating.
     */
    static system(): string;
    /**
     * Obtains the version of the emulator.
     */
    static version(): string;
    static wasm_engine(): string | undefined;
}

export enum Licensee {
    Unknown = 0,
    None = 1,
    Nintendo = 2,
    Capcom = 3,
    HOTB = 4,
    Jaleco = 5,
    CoconutsJapan = 6,
    EliteSystems = 7,
    EAElectronicArts = 8,
    HudsonSoft = 9,
    ITCEntertainment = 10,
    Yanoman = 11,
    JapanClary = 12,
    VirginGamesLtd = 13,
    PCMComplete = 14,
    SanX = 15,
    Kemco = 16,
    SETACorporation = 17,
    Infogrames = 18,
    Bandai = 19,
    NewLicensee = 20,
    Konami = 21,
    HectorSoft = 22,
    Banpresto = 23,
    EntertainmentI = 24,
    Gremlin = 25,
    UbiSoft = 26,
    Atlus = 27,
    MalibuInteractive = 28,
    Angel = 29,
    SpectrumHoloby = 30,
    Irem = 31,
    USGold = 32,
    Absolute = 33,
    AcclaimEntertainment = 34,
    Activision = 35,
    SammyUSACorporation = 36,
    GameTek = 37,
    ParkPlace = 38,
    LJN = 39,
    Matchbox = 40,
    MiltonBradleyCompany = 41,
    Mindscape = 42,
    Romstar = 43,
    NaxatSoft = 44,
    Tradewest = 45,
    TitusInteractive = 46,
    OceanSoftware = 47,
    EliteSystems2 = 48,
    ElectroBrain = 49,
    InterplayEntertainment = 50,
    Broderbund = 51,
    SculpturedSoftware = 52,
    TheSalesCurveLimited = 53,
    THQ = 54,
    Accolade = 55,
    TriffixEntertainment = 56,
    Microprose = 57,
    MisawaEntertainment = 58,
    Lozc = 59,
    TokumaShoten = 60,
    BulletProofSoftware = 61,
    VicTokai = 62,
    Ape = 63,
    IMax = 64,
    Chunsoft = 65,
    VideoSystem = 66,
    TsubarayaProductions = 67,
    Varie = 68,
    YonezawaSpal = 69,
    Arc = 70,
    NihonBussan = 71,
    Tecmo = 72,
    Imagineer = 73,
    Nova = 74,
    HoriElectric = 75,
    Kawada = 76,
    Takara = 77,
    TechnosJapan = 78,
    ToeiAnimation = 79,
    Toho = 80,
    Namco = 81,
    ASCIICorporationOrNexsoft = 82,
    SquareEnix = 83,
    HALLaboratory = 84,
    SNK = 85,
    PonyCanyon = 86,
    CultureBrain = 87,
    Sunsoft = 88,
    SonyImagesoft = 89,
    SammyCorporation = 90,
    Taito = 91,
    Square = 92,
    DataEast = 93,
    Tonkinhouse = 94,
    Koei = 95,
    UFL = 96,
    Ultra = 97,
    Vap = 98,
    UseCorporation = 99,
    Meldac = 100,
    PoneyCanyon = 101,
    Sofel = 102,
    Quest = 103,
    SigmaEnterprises = 104,
    ASKKodanshaCo = 105,
    CopyaSystem = 106,
    Tomy = 107,
    NCS = 108,
    Human = 109,
    Altron = 110,
    TowaChiki = 111,
    Yutaka = 112,
    Epcoh = 113,
    Athena = 114,
    AsmikAceEntertainment = 115,
    Natsume = 116,
    KingRecords = 117,
    EpicSonyRecords = 118,
    IGS = 119,
    AWave = 120,
    ExtremeEntertainment = 121,
    NintendoResearchDevelopment1 = 122,
    BAI = 123,
    KSS = 124,
    PlanningOfficeWADA = 125,
    Viacom = 126,
    HiTechExpressions = 127,
    Mattel = 128,
    LucasfilmGames = 129,
    TsukudaOriginal = 130,
    ChunsoftCo = 131,
    OceanSoftwareAcclaimEntertainment = 132,
    Kaneko = 133,
    PackInVideo = 134,
    BottomUp = 135,
    KonamiYuGiOh = 136,
    MTO = 137,
    Kodansha = 138,
}

export enum MbcType {
    NoMbc = 0,
    Mbc1 = 1,
    Mbc2 = 2,
    Mbc3 = 3,
    Mbc5 = 4,
    Mbc6 = 5,
    Mbc7 = 6,
    Unknown = 7,
}

export class ObjectData {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export enum PadKey {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
    Start = 4,
    Select = 5,
    A = 6,
    B = 7,
}

/**
 * Represents a palette together with the metadata
 * that is associated with it.
 */
export class PaletteInfo {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export enum PpuMode {
    HBlank = 0,
    VBlank = 1,
    OamRead = 2,
    VramRead = 3,
}

export enum RamSize {
    NoRam = 0,
    Unused = 1,
    Size8K = 2,
    Size16K = 3,
    Size32K = 4,
    Size64K = 5,
    Size128K = 6,
    SizeUnknown = 7,
}

export enum Region {
    World = 0,
    Japan = 1,
    USA = 2,
    Europe = 3,
    Spain = 4,
    Italy = 5,
    France = 6,
    Germany = 7,
    Korean = 8,
    Australia = 9,
    Unknown = 10,
}

export class Registers {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    h: number;
    l: number;
    ly: number;
    lyc: number;
    pc: number;
    scx: number;
    scy: number;
    sp: number;
    wx: number;
    wy: number;
}

export enum RomSize {
    Size32K = 0,
    Size64K = 1,
    Size128K = 2,
    Size256K = 3,
    Size512K = 4,
    Size1M = 5,
    Size2M = 6,
    Size4M = 7,
    Size8M = 8,
    SizeUnknown = 9,
}

export enum RomType {
    RomOnly = 0,
    Mbc1 = 1,
    Mbc1Ram = 2,
    Mbc1RamBattery = 3,
    Mbc2 = 5,
    Mbc2Battery = 6,
    RomRam = 8,
    RomRamBattery = 9,
    Mmm01 = 11,
    Mmm01Ram = 12,
    Mmm01RamBattery = 13,
    Mbc3TimerBattery = 15,
    Mbc3TimerRamBattery = 16,
    Mbc3 = 17,
    Mbc3Ram = 18,
    Mbc3RamBattery = 19,
    Mbc5 = 25,
    Mbc5Ram = 26,
    Mbc5RamBattery = 27,
    Mbc5Rumble = 28,
    Mbc5RumbleRam = 29,
    Mbc5RumbleRamBattery = 30,
    Mbc6 = 32,
    Mbc7SensorRumbleRamBattery = 34,
    PocketCamera = 252,
    BandaiTama5 = 253,
    HuC3 = 254,
    HuC1RamBattery = 255,
    Unknown = 239,
}

export enum SaveStateFormat {
    /**
     * Boytacean Save Compressed format (BOSC).
     *
     * This format uses the Zippy compression algorithm
     * to compress the underlying BOS contents.
     *
     * The BOSC format is the default format for the
     * save state.
     *
     * Using a compressed file format means that BESS out-of-the
     * box compatibility is not possible.
     */
    Bosc = 1,
    /**
     * Boytacean Save format (uncompressed) (BOS).
     *
     * This format is the uncompressed version of the
     * BOSC format.
     *
     * Using an uncompressed file format means that BESS
     * out-of-the box compatibility is possible.
     */
    Bos = 2,
    /**
     * Best Effort Save State format (BESS).
     *
     * This is an abstract payload opaque format created
     * by the same people of Sameboy.
     */
    Bess = 3,
}

export enum SgbMode {
    NoSgb = 0,
    SgbFunctions = 3,
}

/**
 * Represents the different formats for the state storage
 * and retrieval.
 *
 * Different formats will have different levels of detail
 * and will require different amounts of data to be
 * stored and retrieved.
 */
export enum StateFormat {
    /**
     * Minimal state format, meaning that only the most basic
     * elements of the component will be stored and retrieved.
     */
    Minimal = 1,
    /**
     * Partial state format, meaning that only the essential
     * elements of the component will be stored and retrieved.
     * All the remaining data, should inferred or computed.
     */
    Partial = 2,
    /**
     * Full state format, meaning that every single element
     * of the component will be stored and retrieved. This
     * should included redundant and calculated data.
     */
    Full = 3,
}

/**
 * Top level manager structure containing the
 * entrypoint static methods for saving and loading
 * [BESS](https://github.com/LIJI32/SameBoy/blob/master/BESS.md) state
 * files and buffers for the Game Boy.
 */
export class StateManager {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static format_str_wa(data: Uint8Array): string;
    static format_wa(data: Uint8Array): SaveStateFormat;
    static load_wa(data: Uint8Array, gb: GameBoy, format?: SaveStateFormat | null, options?: ToGbOptions | null): void;
    static read_bess_wa(data: Uint8Array): BessState;
    static read_bos_auto_wa(data: Uint8Array): BosState;
    static read_bos_wa(data: Uint8Array): BosState;
    static read_bosc_wa(data: Uint8Array): BoscState;
    static save_wa(gb: GameBoy, format?: SaveStateFormat | null, options?: FromGbOptions | null): Uint8Array;
    static thumbnail_wa(data: Uint8Array, format?: SaveStateFormat | null): Uint8Array;
    static validate_wa(data: Uint8Array, title?: string | null): void;
}

/**
 * Represents a tile within the Game Boy context,
 * should contain the pixel buffer of the tile.
 * The tiles are always 8x8 pixels in size.
 */
export class Tile {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    buffer(): Uint8Array;
    get(x: number, y: number): number;
    get_flipped(x: number, y: number, xflip: boolean, yflip: boolean): number;
    static new(): Tile;
    set(x: number, y: number, value: number): void;
}

export class TileData {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class ToGbOptions {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

/**
 * Returns the current timestamp in seconds since the UNIX epoch.
 *
 * This function has different implementations depending on whether
 * the `wasm` feature is enabled or not.
 *
 * WASM implementation is a static one using `js_sys::Date`.
 */
export function timestamp(): bigint;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_bessstate_free: (a: number, b: number) => void;
    readonly __wbg_boscstate_free: (a: number, b: number) => void;
    readonly __wbg_bosstate_free: (a: number, b: number) => void;
    readonly __wbg_cartridge_free: (a: number, b: number) => void;
    readonly __wbg_clockframe_free: (a: number, b: number) => void;
    readonly __wbg_fromgboptions_free: (a: number, b: number) => void;
    readonly __wbg_gameboy_free: (a: number, b: number) => void;
    readonly __wbg_gameboyconfig_free: (a: number, b: number) => void;
    readonly __wbg_gamegenie_free: (a: number, b: number) => void;
    readonly __wbg_gameshark_free: (a: number, b: number) => void;
    readonly __wbg_get_clockframe_cycles: (a: number) => bigint;
    readonly __wbg_get_clockframe_frames: (a: number) => number;
    readonly __wbg_get_registers_a: (a: number) => number;
    readonly __wbg_get_registers_b: (a: number) => number;
    readonly __wbg_get_registers_c: (a: number) => number;
    readonly __wbg_get_registers_d: (a: number) => number;
    readonly __wbg_get_registers_e: (a: number) => number;
    readonly __wbg_get_registers_h: (a: number) => number;
    readonly __wbg_get_registers_l: (a: number) => number;
    readonly __wbg_get_registers_ly: (a: number) => number;
    readonly __wbg_get_registers_lyc: (a: number) => number;
    readonly __wbg_get_registers_pc: (a: number) => number;
    readonly __wbg_get_registers_scx: (a: number) => number;
    readonly __wbg_get_registers_scy: (a: number) => number;
    readonly __wbg_get_registers_sp: (a: number) => number;
    readonly __wbg_get_registers_wx: (a: number) => number;
    readonly __wbg_get_registers_wy: (a: number) => number;
    readonly __wbg_info_free: (a: number, b: number) => void;
    readonly __wbg_paletteinfo_free: (a: number, b: number) => void;
    readonly __wbg_registers_free: (a: number, b: number) => void;
    readonly __wbg_set_clockframe_cycles: (a: number, b: bigint) => void;
    readonly __wbg_set_clockframe_frames: (a: number, b: number) => void;
    readonly __wbg_set_registers_a: (a: number, b: number) => void;
    readonly __wbg_set_registers_b: (a: number, b: number) => void;
    readonly __wbg_set_registers_c: (a: number, b: number) => void;
    readonly __wbg_set_registers_d: (a: number, b: number) => void;
    readonly __wbg_set_registers_e: (a: number, b: number) => void;
    readonly __wbg_set_registers_h: (a: number, b: number) => void;
    readonly __wbg_set_registers_l: (a: number, b: number) => void;
    readonly __wbg_set_registers_ly: (a: number, b: number) => void;
    readonly __wbg_set_registers_lyc: (a: number, b: number) => void;
    readonly __wbg_set_registers_pc: (a: number, b: number) => void;
    readonly __wbg_set_registers_scx: (a: number, b: number) => void;
    readonly __wbg_set_registers_scy: (a: number, b: number) => void;
    readonly __wbg_set_registers_sp: (a: number, b: number) => void;
    readonly __wbg_set_registers_wx: (a: number, b: number) => void;
    readonly __wbg_set_registers_wy: (a: number, b: number) => void;
    readonly __wbg_tile_free: (a: number, b: number) => void;
    readonly __wbg_tiledata_free: (a: number, b: number) => void;
    readonly __wbg_togboptions_free: (a: number, b: number) => void;
    readonly bessstate_agent_wa: (a: number) => [number, number, number, number];
    readonly bessstate_has_image_wa: (a: number) => number;
    readonly bessstate_image_eager_wa: (a: number) => [number, number, number, number];
    readonly bessstate_model_wa: (a: number) => [number, number, number, number];
    readonly bessstate_timestamp_wa: (a: number) => [bigint, number, number];
    readonly bessstate_title_wa: (a: number) => [number, number, number, number];
    readonly bosstate_agent_wa: (a: number) => [number, number, number, number];
    readonly bosstate_has_image_wa: (a: number) => number;
    readonly bosstate_image_eager_wa: (a: number) => [number, number, number, number];
    readonly bosstate_model_wa: (a: number) => [number, number, number, number];
    readonly bosstate_timestamp_wa: (a: number) => [bigint, number, number];
    readonly bosstate_title_wa: (a: number) => [number, number, number, number];
    readonly cartridge_cgb_flag: (a: number) => number;
    readonly cartridge_checksum: (a: number) => number;
    readonly cartridge_clear_ram_data: (a: number) => void;
    readonly cartridge_description: (a: number, b: number) => [number, number];
    readonly cartridge_gb_mode: (a: number) => number;
    readonly cartridge_has_battery: (a: number) => number;
    readonly cartridge_is_legacy: (a: number) => number;
    readonly cartridge_licensee: (a: number) => number;
    readonly cartridge_ram_data_eager: (a: number) => [number, number];
    readonly cartridge_ram_size: (a: number) => number;
    readonly cartridge_ram_size_s: (a: number) => [number, number];
    readonly cartridge_region: (a: number) => number;
    readonly cartridge_rom_data_eager: (a: number) => [number, number];
    readonly cartridge_rom_size: (a: number) => number;
    readonly cartridge_rom_size_s: (a: number) => [number, number];
    readonly cartridge_rom_type: (a: number) => number;
    readonly cartridge_rom_type_s: (a: number) => [number, number];
    readonly cartridge_set_ram_data: (a: number, b: number, c: number) => void;
    readonly cartridge_sgb_flag: (a: number) => number;
    readonly cartridge_title: (a: number) => [number, number];
    readonly cartridge_valid_checksum: (a: number) => number;
    readonly clockframe_frame_buffer_eager: (a: number) => [number, number];
    readonly fromgboptions_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly gameboy_add_cheat_code_wa: (a: number, b: number, c: number) => [number, number, number];
    readonly gameboy_apu_clock: (a: number, b: number) => void;
    readonly gameboy_apu_enabled: (a: number) => number;
    readonly gameboy_attach_null_serial: (a: number) => void;
    readonly gameboy_attach_printer_serial: (a: number) => void;
    readonly gameboy_attach_stdout_serial: (a: number) => void;
    readonly gameboy_audio_all_output: (a: number) => [number, number];
    readonly gameboy_audio_buffer_eager: (a: number, b: number) => [number, number];
    readonly gameboy_audio_ch1_enabled: (a: number) => number;
    readonly gameboy_audio_ch1_output: (a: number) => number;
    readonly gameboy_audio_ch2_enabled: (a: number) => number;
    readonly gameboy_audio_ch2_output: (a: number) => number;
    readonly gameboy_audio_ch3_enabled: (a: number) => number;
    readonly gameboy_audio_ch3_output: (a: number) => number;
    readonly gameboy_audio_ch4_enabled: (a: number) => number;
    readonly gameboy_audio_ch4_output: (a: number) => number;
    readonly gameboy_audio_channels: (a: number) => number;
    readonly gameboy_audio_filter_mode_wa: (a: number) => number;
    readonly gameboy_audio_output: (a: number) => number;
    readonly gameboy_audio_sampling_rate: (a: number) => number;
    readonly gameboy_boot: (a: number) => void;
    readonly gameboy_boot_rom: (a: number) => number;
    readonly gameboy_boot_rom_s: (a: number) => [number, number];
    readonly gameboy_cartridge_eager: (a: number) => number;
    readonly gameboy_clock: (a: number) => number;
    readonly gameboy_clock_freq: (a: number) => number;
    readonly gameboy_clock_freq_s: (a: number) => [number, number];
    readonly gameboy_clock_many: (a: number, b: number) => number;
    readonly gameboy_clock_step: (a: number, b: number) => number;
    readonly gameboy_clocks: (a: number, b: number) => bigint;
    readonly gameboy_clocks_cycles: (a: number, b: number) => bigint;
    readonly gameboy_clocks_frame_buffer: (a: number, b: number) => number;
    readonly gameboy_cpu_clock: (a: number) => number;
    readonly gameboy_description: (a: number, b: number) => [number, number];
    readonly gameboy_description_debug: (a: number) => [number, number];
    readonly gameboy_display_height: (a: number) => number;
    readonly gameboy_display_width: (a: number) => number;
    readonly gameboy_dma_clock: (a: number, b: number) => void;
    readonly gameboy_dma_enabled: (a: number) => number;
    readonly gameboy_frame_buffer_eager: (a: number) => [number, number];
    readonly gameboy_frame_buffer_raw_eager: (a: number) => [number, number];
    readonly gameboy_get_tile: (a: number, b: number) => number;
    readonly gameboy_get_tile_buffer: (a: number, b: number) => [number, number];
    readonly gameboy_hram_eager: (a: number) => [number, number];
    readonly gameboy_infer_mode_wa: (a: number, b: number, c: number) => [number, number];
    readonly gameboy_is_cgb: (a: number) => number;
    readonly gameboy_is_dmg: (a: number) => number;
    readonly gameboy_is_sgb: (a: number) => number;
    readonly gameboy_key_lift: (a: number, b: number) => void;
    readonly gameboy_key_press: (a: number, b: number) => void;
    readonly gameboy_load_callbacks_wa: (a: number) => void;
    readonly gameboy_load_logger_wa: (a: number) => void;
    readonly gameboy_load_printer_wa: (a: number) => void;
    readonly gameboy_load_rom_wa: (a: number, b: number, c: number) => [number, number, number];
    readonly gameboy_load_unsafe: (a: number, b: number) => void;
    readonly gameboy_mode: (a: number) => number;
    readonly gameboy_multiplier: (a: number) => number;
    readonly gameboy_new: (a: number) => number;
    readonly gameboy_next_frame: (a: number) => number;
    readonly gameboy_ppu_clock: (a: number, b: number) => void;
    readonly gameboy_ppu_enabled: (a: number) => number;
    readonly gameboy_ppu_frame: (a: number) => number;
    readonly gameboy_ppu_ly: (a: number) => number;
    readonly gameboy_ppu_mode: (a: number) => number;
    readonly gameboy_ram_data_eager: (a: number) => [number, number];
    readonly gameboy_ram_size: (a: number) => number;
    readonly gameboy_registers: (a: number) => number;
    readonly gameboy_reload_wa: (a: number) => [number, number];
    readonly gameboy_reset: (a: number) => void;
    readonly gameboy_reset_cheats: (a: number) => void;
    readonly gameboy_serial_clock: (a: number, b: number) => void;
    readonly gameboy_serial_enabled: (a: number) => number;
    readonly gameboy_set_all_enabled: (a: number, b: number) => void;
    readonly gameboy_set_apu_enabled: (a: number, b: number) => void;
    readonly gameboy_set_audio_ch1_enabled: (a: number, b: number) => void;
    readonly gameboy_set_audio_ch2_enabled: (a: number, b: number) => void;
    readonly gameboy_set_audio_ch3_enabled: (a: number, b: number) => void;
    readonly gameboy_set_audio_ch4_enabled: (a: number, b: number) => void;
    readonly gameboy_set_audio_filter_mode_wa: (a: number, b: number) => void;
    readonly gameboy_set_boot_rom: (a: number, b: number) => void;
    readonly gameboy_set_clock_freq: (a: number, b: number) => void;
    readonly gameboy_set_dma_enabled: (a: number, b: number) => void;
    readonly gameboy_set_mode: (a: number, b: number) => void;
    readonly gameboy_set_palette_colors_wa: (a: number, b: number, c: number) => void;
    readonly gameboy_set_ppu_enabled: (a: number, b: number) => void;
    readonly gameboy_set_ram_data: (a: number, b: number, c: number) => void;
    readonly gameboy_set_serial_enabled: (a: number, b: number) => void;
    readonly gameboy_set_timer_enabled: (a: number, b: number) => void;
    readonly gameboy_speed: (a: number) => number;
    readonly gameboy_step_to: (a: number, b: number) => number;
    readonly gameboy_timer_clock: (a: number, b: number) => void;
    readonly gameboy_timer_enabled: (a: number) => number;
    readonly gameboy_verify_rom: (a: number, b: number) => number;
    readonly gameboy_vram_size: (a: number) => number;
    readonly gameboyconfig_apu_enabled: (a: number) => number;
    readonly gameboyconfig_clock_freq: (a: number) => number;
    readonly gameboyconfig_dma_enabled: (a: number) => number;
    readonly gameboyconfig_is_cgb: (a: number) => number;
    readonly gameboyconfig_is_dmg: (a: number) => number;
    readonly gameboyconfig_is_sgb: (a: number) => number;
    readonly gameboyconfig_mode: (a: number) => number;
    readonly gameboyconfig_ppu_enabled: (a: number) => number;
    readonly gameboyconfig_serial_enabled: (a: number) => number;
    readonly gameboyconfig_set_apu_enabled: (a: number, b: number) => void;
    readonly gameboyconfig_set_clock_freq: (a: number, b: number) => void;
    readonly gameboyconfig_set_dma_enabled: (a: number, b: number) => void;
    readonly gameboyconfig_set_mode: (a: number, b: number) => void;
    readonly gameboyconfig_set_ppu_enabled: (a: number, b: number) => void;
    readonly gameboyconfig_set_serial_enabled: (a: number, b: number) => void;
    readonly gameboyconfig_set_timer_enabled: (a: number, b: number) => void;
    readonly gameboyconfig_timer_enabled: (a: number) => number;
    readonly info_compilation_date: () => [number, number];
    readonly info_compilation_time: () => [number, number];
    readonly info_compiler: () => [number, number];
    readonly info_compiler_version: () => [number, number];
    readonly info_name: () => [number, number];
    readonly info_name_lower: () => [number, number];
    readonly info_system: () => [number, number];
    readonly info_version: () => [number, number];
    readonly info_wasm_engine: () => [number, number];
    readonly statemanager_format_str_wa: (a: number, b: number) => [number, number, number, number];
    readonly statemanager_format_wa: (a: number, b: number) => [number, number, number];
    readonly statemanager_load_wa: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly statemanager_read_bess_wa: (a: number, b: number) => [number, number, number];
    readonly statemanager_read_bos_auto_wa: (a: number, b: number) => [number, number, number];
    readonly statemanager_read_bos_wa: (a: number, b: number) => [number, number, number];
    readonly statemanager_read_bosc_wa: (a: number, b: number) => [number, number, number];
    readonly statemanager_save_wa: (a: number, b: number, c: number) => [number, number, number, number];
    readonly statemanager_thumbnail_wa: (a: number, b: number, c: number) => [number, number, number, number];
    readonly statemanager_validate_wa: (a: number, b: number, c: number, d: number) => [number, number];
    readonly tile_buffer: (a: number) => [number, number];
    readonly tile_get: (a: number, b: number, c: number) => number;
    readonly tile_get_flipped: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly tile_new: () => number;
    readonly tile_set: (a: number, b: number, c: number, d: number) => void;
    readonly gameboy_load_boot_state: (a: number) => void;
    readonly gameboy_load_null_wa: (a: number) => void;
    readonly gameboy_vram_eager: (a: number) => [number, number];
    readonly __wbg_objectdata_free: (a: number, b: number) => void;
    readonly __wbg_statemanager_free: (a: number, b: number) => void;
    readonly gameboy_set_panic_hook_wa: () => void;
    readonly timestamp: () => bigint;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
