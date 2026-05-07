import companies from "@/data/mcp-companies.json"

export type CompanyRole = "ADMIN" | "MEMBER" | "VIEWER"

export type Company = {
  company_code: string
  company_name: string
  role: CompanyRole
}

export type CompanyResponse = Company & {
  is_current: boolean
}

const DEFAULT_ACCESS_TOKEN = "fake_access_token_abc123"
const ACCESS_TOKEN = process.env.MCP_TEST_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN
const DEFAULT_COMPANY_CODE = "azflow"

type McpAuthGlobal = typeof globalThis & {
  __factsheetMcpCompanyByToken?: Map<string, string>
}

const globalForMcpAuth = globalThis as McpAuthGlobal

const companyByToken =
  globalForMcpAuth.__factsheetMcpCompanyByToken ??
  new Map<string, string>([[ACCESS_TOKEN, DEFAULT_COMPANY_CODE]])

globalForMcpAuth.__factsheetMcpCompanyByToken = companyByToken

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const [scheme, token] = authorization.split(" ")

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null
  }

  return token
}

export function isKnownToken(token: string) {
  return companyByToken.has(token)
}

export function getCompaniesForToken(token: string): CompanyResponse[] | null {
  const currentCompanyCode = companyByToken.get(token)

  if (!currentCompanyCode) {
    return null
  }

  return (companies as Company[]).map((company) => ({
    ...company,
    is_current: company.company_code === currentCompanyCode,
  }))
}

export function switchCompanyForToken(token: string, companyCode: string) {
  const tokenCompanies = getCompaniesForToken(token)

  if (!tokenCompanies) {
    return { status: "unauthorized" as const }
  }

  const company = tokenCompanies.find(
    (candidate) => candidate.company_code === companyCode,
  )

  if (!company) {
    return { status: "forbidden" as const }
  }

  companyByToken.set(token, companyCode)

  return {
    status: "ok" as const,
    company: {
      ...company,
      is_current: true,
    },
  }
}
