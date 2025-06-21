import { web3auth, configureWeb3AuthAdapter } from "@/config/web3auth.config"

class Web3AuthSingleton {
  private initialized = false
  private initPromise: Promise<void> | null = null

  async init() {
    if (this.initialized) {
      return
    }
    
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.doInit()
    return this.initPromise
  }

  private async doInit() {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      throw new Error('Web3Auth can only be initialized on the client side')
    }

    try {
      // Configure adapter before initializing
      configureWeb3AuthAdapter()
      
      // Initialize Web3Auth
      await web3auth.init()
      this.initialized = true
      console.log("Web3Auth initialized successfully")
    } catch (error) {
      console.error("Web3Auth initialization failed:", error)
      this.initPromise = null // Reset on failure
      throw error
    }
  }

  get instance() {
    return web3auth
  }

  get isInitialized() {
    return this.initialized
  }
}

export const web3AuthSingleton = new Web3AuthSingleton()