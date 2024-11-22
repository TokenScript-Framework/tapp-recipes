'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import Image from "next/image"
import { Menu, Settings } from 'lucide-react'
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ERROR_LIST, ERROR_PARAM, NEXT_PUBLIC_BACKEND_BASE, TOKEN_PARAM, TWITTER_ROOT } from "../lib/constants"
import { useCallback, useEffect, useState } from "react"
import { SpinLoading } from "./spin-loading"
import { verifyAuth } from "../lib/api"
import { useAtom } from "jotai"
import { twitterAccountAtom } from "../lib/store"
import { SidebarContent } from "./sidebar-content"
import { useToast } from "@/hooks/use-toast"

export const Header = () => {
  const [linking, setLinking] = useState(false)
  const [accessToken, setAccessToken] = useState("")
  const [error, setError] = useState("")
  const [twitterAccount, setTwitterAccount] = useAtom(twitterAccountAtom)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { toast } = useToast()

  function signTwitterClick() {
    setLinking(true)
    window.open(
      `${NEXT_PUBLIC_BACKEND_BASE}auth/twitter/login`,
      "_self"
    )
  }

  const checkSocialStatus = useCallback(async () => {
    try {
      const result = await verifyAuth('twitter', accessToken)

      if (result.value) {
        setAccessToken("")
        setLinking(false)
        console.log('result--', result)
        setTwitterAccount(result)
      }
    } catch (e: Error | unknown) {
      setLinking(false)
      if ((e as { response?: { data?: { error?: string } } }).response?.data?.error) {
        setError(String(e))
      }
      setAccessToken("")
      console.log("failed to check twitter status")
    }
  }, [accessToken, setTwitterAccount])

  useEffect(() => {
    if (accessToken) {
      checkSocialStatus()
    }
  }, [checkSocialStatus, accessToken])

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        })
      }, 0)

      return (() => clearTimeout(timeout))
    }
  }, [toast, error])

  useEffect(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get(ERROR_PARAM)
    console.log(ERROR_PARAM, error, ERROR_LIST[error as keyof typeof ERROR_LIST] ?? "Unknown error")
    if (error) {
      console.log('######')
      setError(ERROR_LIST[error as keyof typeof ERROR_LIST] ?? "Unknown error")
      url.searchParams.delete(ERROR_PARAM)
      history.replaceState(history.state, "", url.href)
      setLinking(false)
    }

    const authToken = url.searchParams.get(TOKEN_PARAM)
    if (authToken) {
      setAccessToken(authToken)
      url.searchParams.delete(TOKEN_PARAM)
      history.replaceState(history.state, "", url.href)
    }
  }, [toast])



  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white">
              <ScrollArea className="h-full">
                <div className="py-4">
                  <SidebarContent onSelect={() => setSheetOpen(false)} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <a href="/" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Logo" width={48} height={48} className="h-12 w-auto" /> <span className="font-bold text-3xl uppercase">Twitter Creators</span>
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectButton showBalance={false} />
          {!twitterAccount ? (<><Button variant="outline" className="rounded-lg bg-black gap-2 text-white font-bold h-10 text-base hover:bg-black hover:text-white hover:scale-[1.025]" disabled={linking} onClick={() => {
            signTwitterClick()
          }}>
            {linking && <SpinLoading />}
            {!linking && (<><Image src="/images/twitter.svg" alt="twitter" height={24} width={24} />
              Sign Twitter</>)}
          </Button></>) : (<>
            <a className="bg-black text-white rounded-xl flex p-2 h-10 items-center gap-2 hover:scale-[1.025]" href={`${TWITTER_ROOT}/${twitterAccount.username}`} target="_blank">
              <Image src="/images/twitter.svg" alt="twitter" height={24} width={24} />
              <div className="text-lg">{twitterAccount.name}</div>
              <div className="text-xs opacity-50">@{twitterAccount.username}</div>
            </a>
          </>)}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Open settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>)
}