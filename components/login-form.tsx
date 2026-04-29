"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"

import type { SearchParamEntries } from "@/lib/search-params"
import {
  createOAuthParams,
  getEffectiveOAuthParams,
  hasRedirectUrl,
  saveOAuthParams,
} from "@/lib/oauth-params"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm({
  initialParams,
}: {
  initialParams: SearchParamEntries
}) {
  const router = useRouter()
  const incomingParams = useMemo(
    () => createOAuthParams(initialParams),
    [initialParams],
  )
  const hasIncomingRedirectUrl = hasRedirectUrl(incomingParams)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    saveOAuthParams(incomingParams)
  }, [incomingParams])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const loginId = String(formData.get("loginId") || "")
    const password = String(formData.get("password") || "")
    const params = getEffectiveOAuthParams(initialParams)
    const query = params.toString()

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId, password }),
      })
      const result = (await response.json()) as {
        ok?: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        setError(result.message || "로그인에 실패했습니다.")
        setLoading(false)
        return
      }

      if (!hasRedirectUrl(params)) {
        router.push("/")
        return
      }

      saveOAuthParams(params)
      router.push(`/select-company?${query}`)
    } catch {
      setError("로그인 요청 중 오류가 발생했습니다.")
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl bg-white p-8 shadow-2xl"
    >
      <div className="space-y-2">
        <Label htmlFor="loginId">아이디 또는 이메일</Label>
        <Input
          id="loginId"
          name="loginId"
          type="text"
          placeholder="factsheet.admin"
          autoComplete="username"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : !hasIncomingRedirectUrl ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          redirectUrl 없이 열린 화면입니다. 일반 로그인으로 처리됩니다.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full bg-[#E8531A] text-base font-semibold text-white hover:bg-[#cc4212]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            처리 중...
          </>
        ) : (
          <>
            로그인
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  )
}
