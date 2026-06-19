/**
 * Safely filters and maps data for SelectItem components
 * Ensures all items have valid id and display values
 */
export function safeSelectItems<T extends Record<string, any>>(
  items: T[],
  idField: keyof T = "id",
  displayField: keyof T = "name",
  fallbackDisplay?: string,
): Array<{ id: string; display: string; original: T }> {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .filter((item) => {
      // Ensure item exists and has required fields
      if (!item) return false

      const id = item[idField]
      const display = item[displayField]

      // ID must be truthy and not empty string
      if (!id || (typeof id === "string" && id.trim() === "")) return false

      // Display value must exist (can be empty string but not null/undefined)
      if (display === null || display === undefined) return false

      return true
    })
    .map((item) => ({
      id: String(item[idField]),
      display: String(item[displayField] || fallbackDisplay || "Unknown"),
      original: item,
    }))
}

/**
 * Creates a safe SelectItem component with proper error handling
 */
export function createSafeSelectItems<T extends Record<string, any>>(
  items: T[],
  idField: keyof T = "id",
  displayField: keyof T = "name",
  fallbackDisplay?: string,
) {
  const safeItems = safeSelectItems(items, idField, displayField, fallbackDisplay)

  return safeItems.map(({ id, display }) => ({
    value: id,
    label: display,
    key: id,
  }))
}
