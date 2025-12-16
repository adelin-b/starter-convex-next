/**
 * Get initials from a user's name.
 * Returns up to 2 uppercase characters from the first letter of each word.
 *
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Alice") // "A"
 * getInitials("Mary Jane Watson") // "MJ"
 * getInitials(undefined) // "?"
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) {
    return "?";
  }
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
