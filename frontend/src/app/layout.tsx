// src/app/layout.tsx (or similar path)

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "../providers/Web3Provider"
// --- ADD THESE TWO IMPORTS ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// -----------------------------

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SageFi - Your AI Financial Navigator for DeFi",
  description:
    "Execute sophisticated cross-chain strategies through simple conversations. No technical knowledge required.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
        {/* --- ADD THIS COMPONENT --- */}
        <ToastContainer
          position="bottom-right" // You can customize the position
          autoClose={5000}        // Close after 5 seconds
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"            // Match your dark theme
        />
        {/* --------------------------- */}
      </body>
    </html>
  )
}