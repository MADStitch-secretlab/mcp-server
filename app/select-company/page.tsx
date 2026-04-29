import { AuthShell } from "@/components/auth-shell"
import CompanySelector from "@/components/company-selector"
import {
  type PageSearchParams,
  toSearchParamEntries,
} from "@/lib/search-params"

export default function SelectCompanyPage({
  searchParams,
}: {
  searchParams?: PageSearchParams
}) {
  return (
    <AuthShell
      title="회사 선택"
      description="소속 회사를 선택하세요"
      footer="PoC: 어느 회사 선택해도 가짜 code가 발급됩니다"
    >
      <CompanySelector initialParams={toSearchParamEntries(searchParams)} />
    </AuthShell>
  )
}
