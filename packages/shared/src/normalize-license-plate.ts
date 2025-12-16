/**
 * Normalizes a license plate by converting to uppercase and removing whitespace and dashes.
 * Used for consistent storage and comparison in the database.
 *
 * @param plate - The raw license plate string
 * @returns The normalized license plate (uppercase, no spaces or dashes)
 *
 * @example
 * normalizeLicensePlate("abc 123") // "ABC123"
 * normalizeLicensePlate("XYZ-456") // "XYZ456"
 * normalizeLicensePlate("def 789") // "DEF789"
 */
export function normalizeLicensePlate(plate: string): string {
  return plate.toUpperCase().replaceAll(/[\s-]/g, "");
}
