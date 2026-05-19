import { AuthShell } from "@/components/auth-shell"
import LoginForm from "@/components/login-form"
import {
  type PageSearchParams,
  toSearchParamEntries,
} from "@/lib/search-params"

export default function LoginPage({
  searchParams,
}: {
  searchParams?: PageSearchParams
}) {
  return (
    <AuthShell
      title="토큰 연결"
      description="Factsheet 토큰과 회사 코드를 입력하세요"
      footer="입력한 값은 cb 콜백 URL로만 전송됩니다"
    >
      <LoginForm initialParams={toSearchParamEntries(searchParams)} />
    </AuthShell>
  )
}
