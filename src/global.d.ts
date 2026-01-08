// src/global.d.ts
declare global {
  interface Number {
    /**
     * Converts a number representing time into a human-readable duration format.
     *
     * This method takes a number (either in seconds or milliseconds) and converts it into a string
     * representing the duration in the format `HH:MM:SS`. The unit of the input number can be specified
     * as either 'seconds' or 'milliseconds'. If no unit is specified, 'seconds' is used by default.
     *
     * @param unit - The unit of the input number. Can be either 'seconds' or 'milliseconds'. Defaults to 'seconds'.
     * @returns A string representing the duration in the format `HH:MM:SS`.
     *
     * @example
     * const durationInSeconds = (3661).toDuration(); // "01:01:01"
     * const durationInMilliseconds = (3661000).toDuration('milliseconds'); // "01:01:01"
     *
     * @throws {TypeError} If the unit is not 'seconds' or 'milliseconds'.
     */
    toDuration(unit?: 'seconds' | 'milliseconds'): string;
    /**
     * Converts a number representing bytes into a human-readable file size format.
     *
     * This method takes a number of bytes and converts it into a string representing
     * the file size in a human-readable format (e.g., 'B', 'KB', 'MB', 'GB', 'TB').
     * The method uses a base of 1024 to calculate the size units.
     *
     * @returns A string representing the file size in a human-readable format.
     *
     * @example
     * const fileSize = 1024 * 1024 * 2.5; // 2.5 MB
     * const formattedSize = fileSize.toFileSize(); // "2.50 MB"
     *
     * @throws {TypeError} If the input is not a number.
     */ toFileSize(): string;
  }
}
export {};
