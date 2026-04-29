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
      title="로그인"
      description="MCP 서버 연동을 위해 로그인하세요"
      footer="JSON에 등록된 계정만 로그인할 수 있습니다"
    >
      <LoginForm initialParams={toSearchParamEntries(searchParams)} />
    </AuthShell>
  )
}
