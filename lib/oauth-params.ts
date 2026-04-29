import type { SearchParamEntries } from "@/lib/search-params"

const OAUTH_STORAGE_KEY = "factsheet-mcp-redirect-url-params"

export function createOAuthParams(entries: SearchParamEntries) {
  return new URLSearchParams(entries)
}

export function hasRedirectUrl(params: URLSearchParams) {
  return Boolean(params.get("redirectUrl"))
}

export function saveOAuthParams(params: URLSearchParams) {
  if (typeof window === "undefined" || !hasRedirectUrl(params)) {
    return
  }

  window.sessionStorage.setItem(OAUTH_STORAGE_KEY, params.toString())
}

export function getStoredOAuthParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams()
  }

  return new URLSearchParams(
    window.sessionStorage.getItem(OAUTH_STORAGE_KEY) || "",
  )
}

export function getEffectiveOAuthParams(entries: SearchParamEntries) {
  const currentParams = createOAuthParams(entries)

  if (hasRedirectUrl(currentParams)) {
    return currentParams
  }

  return getStoredOAuthParams()
}
