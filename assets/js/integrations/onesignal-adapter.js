/**
 * OneSignal Integration Adapter
 * Handles push notifications
 */

const USE_MOCK = false

class OneSignalAdapter {
  constructor() {
    this.initialized = false

    if (USE_MOCK) {
      console.log("[OneSignal] Using mock mode")
    } else {
      console.log("[OneSignal] Using real OneSignal SDK")
    }
  }

  /**
   * Initialize OneSignal (call on page load)
   */
  async init() {
    if (USE_MOCK) {
      console.log("[OneSignal] Mock init")
      this.initialized = true
      return
    }

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(async (OneSignal) => {
        await OneSignal.init({
          appId: "1d63b1ac-a6b2-406d-9d43-47db049dac54",
          allowLocalhostAsSecureOrigin: true,
        })
      })
      this.initialized = true
      console.log("[OneSignal] Initialized successfully")
    } catch (error) {
      console.error("[OneSignal] Initialization error:", error)
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    if (USE_MOCK) {
      console.log("[OneSignal] Mock requestPermission")
      return "granted"
    }

    try {
      const permission = await window.OneSignal.Notifications.requestPermission()
      console.log("[OneSignal] Permission:", permission)
      return permission
    } catch (error) {
      console.error("[OneSignal] Permission request error:", error)
      return "denied"
    }
  }

  /**
   * Get player ID (user identifier)
   */
  async getPlayerId() {
    if (USE_MOCK) {
      console.log("[OneSignal] Mock getPlayerId")
      return "mock-player-" + Date.now()
    }

    try {
      const playerId = await window.OneSignal.User.PushSubscription.id
      console.log("[OneSignal] Player ID:", playerId)
      return playerId
    } catch (error) {
      console.error("[OneSignal] Get player ID error:", error)
      return null
    }
  }

  /**
   * Set user tags (for segmentation)
   */
  async setTags(tags) {
    if (USE_MOCK) {
      console.log("[OneSignal] Mock setTags:", tags)
      return
    }

    try {
      await window.OneSignal.User.addTags(tags)
      console.log("[OneSignal] Tags set:", tags)
    } catch (error) {
      console.error("[OneSignal] Set tags error:", error)
    }
  }

  /**
   * Send notification (server-side)
   * Note: This should be called from your backend, not client-side
   */
  async sendNotification(notificationData) {
    if (USE_MOCK) {
      console.log("[OneSignal] Mock sendNotification:", notificationData)
      return { id: "mock-notification-" + Date.now() }
    }

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationData),
      })
      const result = await response.json()
      console.log("[OneSignal] Notification sent:", result)
      return result
    } catch (error) {
      console.error("[OneSignal] Send notification error:", error)
      return null
    }
  }

  /**
   * Subscribe to notification events
   */
  onNotificationReceived(callback) {
    if (USE_MOCK) {
      console.log("[OneSignal] Mock onNotificationReceived")
      return
    }

    try {
      window.OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("[OneSignal] Notification clicked:", event)
        callback(event)
      })
    } catch (error) {
      console.error("[OneSignal] Event listener error:", error)
    }
  }

  /**
   * Check if user is subscribed to notifications
   */
  async isSubscribed() {
    if (USE_MOCK) {
      return false
    }

    try {
      const isPushSupported = await window.OneSignal.Notifications.isPushSupported()
      const permission = await window.OneSignal.Notifications.permissionNative
      return isPushSupported && permission === "granted"
    } catch (error) {
      console.error("[OneSignal] Check subscription error:", error)
      return false
    }
  }
}

export const oneSignal = new OneSignalAdapter()
