export type PageSearchParams = Record<string, string | string[] | undefined>
export type SearchParamEntries = Array<[string, string]>

export function toSearchParamEntries(
  searchParams: PageSearchParams = {},
): SearchParamEntries {
  return Object.entries(searchParams).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => [key, item] as [string, string])
    }

    if (typeof value === "string") {
      return [[key, value] as [string, string]]
    }

    return []
  })
}
