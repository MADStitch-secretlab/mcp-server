"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

import type { SearchParamEntries } from "@/lib/search-params"
import {
  createOAuthParams,
  getEffectiveOAuthParams,
  saveLoginSession,
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
  const incomingParams = useMemo(
    () => createOAuthParams(initialParams),
    [initialParams],
  )
  const hasIncomingCallback = Boolean(incomingParams.get("cb"))
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
    const accessToken = String(formData.get("accessToken") || "").trim()
    const refreshToken = String(formData.get("refreshToken") || "").trim()
    const companyCode = String(formData.get("companyCode") || "").trim()
    const params = getEffectiveOAuthParams(initialParams)
    const cb = params.get("cb") || ""

    if (!accessToken || !refreshToken || !companyCode) {
      setError("accessToken, refreshToken, companyCode를 모두 입력해주세요.")
      setLoading(false)
      return
    }

    if (!cb) {
      setError("cb 쿼리가 없습니다. Claude Desktop 연결부터 다시 시작해주세요.")
      setLoading(false)
      return
    }

    try {
      saveOAuthParams(params)
      saveLoginSession({ accessToken, refreshToken })

      const response = await fetch(cb, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          companyCode,
        }),
      })
      const result = (await response.json()) as {
        error?: string
        error_description?: string
        redirect_url?: string
      }

      if (response.ok && result.redirect_url) {
        window.location.href = result.redirect_url
        return
      }

      setError(
        result.error_description ||
          result.error ||
          "MCP 콜백 처리 중 오류가 발생했습니다.",
      )
      setLoading(false)
    } catch {
      setError("MCP 콜백 서버로 토큰 정보를 전송하지 못했습니다.")
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl bg-white p-8 shadow-2xl"
    >
      <div className="space-y-2">
        <Label htmlFor="accessToken">Access Token</Label>
        <textarea
          id="accessToken"
          name="accessToken"
          rows={4}
          className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Factsheet accessToken"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="refreshToken">Refresh Token</Label>
        <textarea
          id="refreshToken"
          name="refreshToken"
          rows={4}
          className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Factsheet refreshToken"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyCode">Company Code</Label>
        <Input
          id="companyCode"
          name="companyCode"
          type="text"
          placeholder="fsinv"
          required
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : !hasIncomingCallback ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          cb 없이 열린 화면입니다. Claude Desktop 연결부터 다시 시작해주세요.
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
            토큰으로 연결
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  )
}
