import type { SearchParamEntries } from "@/lib/search-params"

const OAUTH_STORAGE_KEY = "factsheet-mcp-redirect-url-params"
const LOGIN_SESSION_STORAGE_KEY = "factsheet-mcp-login-session"

export type LoginSession = {
  accessToken: string
  refreshToken: string
}

export function createOAuthParams(entries: SearchParamEntries) {
  return new URLSearchParams(entries)
}

export function hasRedirectUrl(params: URLSearchParams) {
  return Boolean(params.get("redirectUrl"))
}

export function hasCallbackTarget(params: URLSearchParams) {
  return Boolean(params.get("cb") || params.get("redirectUrl"))
}

export function getCallbackTarget(params: URLSearchParams) {
  return params.get("cb") || params.get("redirectUrl") || ""
}

export function saveOAuthParams(params: URLSearchParams) {
  if (typeof window === "undefined" || !hasCallbackTarget(params)) {
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

  if (hasCallbackTarget(currentParams)) {
    return currentParams
  }

  return getStoredOAuthParams()
}

export function saveLoginSession(session: LoginSession) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    LOGIN_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  )
}

export function getLoginSession(): LoginSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.sessionStorage.getItem(LOGIN_SESSION_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    const parsed = JSON.parse(stored) as Partial<LoginSession>

    if (
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string"
    ) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      }
    }
  } catch {
    return null
  }

  return null
}
