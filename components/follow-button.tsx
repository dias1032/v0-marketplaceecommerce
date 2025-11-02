"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  storeId: string
  initialFollowing: boolean
  variant?: "default" | "outline"
}

export function FollowButton({ storeId, initialFollowing, variant = "default" }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleFollow = async () => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    if (isFollowing) {
      // Unfollow
      await supabase.from("store_followers").delete().eq("store_id", storeId).eq("buyer_id", user.id)
      setIsFollowing(false)
    } else {
      // Follow
      await supabase.from("store_followers").insert({
        store_id: storeId,
        buyer_id: user.id,
      })
      setIsFollowing(true)
    }

    setIsLoading(false)
    router.refresh()
  }

  return (
    <Button onClick={handleToggleFollow} disabled={isLoading} variant={isFollowing ? "outline" : variant}>
      {isFollowing ? "Seguindo" : "Seguir"}
    </Button>
  )
}
