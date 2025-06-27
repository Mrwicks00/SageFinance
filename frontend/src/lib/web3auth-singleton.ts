// lib/web3auth-singleton.ts
import { Web3Auth } from "@web3auth/modal"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "your-client-id"

class Web3AuthSingleton {
  private _instance: Web3Auth | null = null
  private _isInitialized = false

  get instance(): Web3Auth {
    if (!this._instance) {
      throw new Error("Web3Auth not initialized. Call init() first.")
    }
    return this._instance
  }

  get isInitialized(): boolean {
    return this._isInitialized
  }

  async init(): Promise<void> {
    if (this._isInitialized) return

    try {
      // Configure the private key provider
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x1", // Ethereum Mainnet
            rpcTarget: "https://rpc.ankr.com/eth",
            displayName: "Ethereum Mainnet",
            ticker: "ETH",
            tickerName: "Ethereum",
            // Remove blockExplorer - not supported in chainConfig
          },
        },
      })

      // Initialize Web3Auth
      this._instance = new Web3Auth({
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or TESTNET for development
        // Remove privateKeyProvider from here
        uiConfig: {
          appName: "SageFi",
          mode: "dark", // or "light"
          logoLight: "https://your-logo-url.com/logo-light.svg",
          logoDark: "https://your-logo-url.com/logo-dark.svg",
          defaultLanguage: "en",
          loginGridCol: 3,
          primaryButton: "externalLogin",
        },
      })

      // Configure and add the OpenLogin adapter
      const openloginAdapter = new OpenloginAdapter({
        privateKeyProvider,
        adapterSettings: {
          loginConfig: {
            google: {
              verifier: "your-google-verifier", // You need to create this in Web3Auth dashboard
              typeOfLogin: "google",
              clientId: "your-google-oauth-client-id", // Google OAuth client ID
            },
            // Add other login providers as needed
            facebook: {
              verifier: "your-facebook-verifier",
              typeOfLogin: "facebook",
              clientId: "your-facebook-app-id",
            },
            twitter: {
              verifier: "your-twitter-verifier",
              typeOfLogin: "twitter",
              clientId: "your-twitter-client-id",
            },
          },
          whiteLabel: {
            appName: "Your App Name",
            logoLight: "https://your-logo-url.com/logo-light.svg",
            logoDark: "https://your-logo-url.com/logo-dark.svg",
            defaultLanguage: "en",
            mode: "dark",
          },
        },
      })

      // Add the adapter to Web3Auth instance
      // this._instance.addAdapter(openloginAdapter)

      // Initialize the Web3Auth instance
      await this._instance.init()
      this._isInitialized = true

      console.log("Web3Auth initialized successfully")
    } catch (error) {
      console.error("Web3Auth initialization failed:", error)
      throw error
    }
  }

  async connect(loginProvider: string = "google"): Promise<any> {
    if (!this._instance) {
      throw new Error("Web3Auth not initialized")
    }

    try {
      // const web3authProvider = await this._instance.connectTo(OpenLoginAdapter.name, {
      //   loginProvider,
      // })
      
      // return web3authProvider
    } catch (error) {
      console.error("Web3Auth connection failed:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this._instance) return

    try {
      await this._instance.logout()
      console.log("Web3Auth disconnected successfully")
    } catch (error) {
      console.error("Web3Auth disconnection failed:", error)
      throw error
    }
  }
}

export const web3AuthSingleton = new Web3AuthSingleton()