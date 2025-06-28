// frontend/src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface ChatRequest {
  message: string
  conversationId?: string
}

interface ChatResponse {
  response: string
  conversationId: string
  success: boolean
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, conversationId } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message is required' 
        },
        { status: 400 }
      )
    }

    // Get Eliza agent URL from environment variables
    const elizaUrl = process.env.ELIZA_AGENT_URL || 'http://localhost:3001'
    
    console.log('Sending message to Eliza agent:', { message, conversationId })

    // Send request to Eliza agent
    const elizaResponse = await fetch(`${elizaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        conversationId: conversationId || `conv_${Date.now()}`,
        userId: 'web_user', // You can make this dynamic later
      }),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!elizaResponse.ok) {
      console.error('Eliza agent response not ok:', elizaResponse.status, elizaResponse.statusText)
      
      // If Eliza is not available, return a fallback response
      return NextResponse.json({
        success: true,
        response: "I'm currently connecting to the DeFi networks. Please try again in a moment, or check if the Eliza agent is running.",
        conversationId: conversationId || `conv_${Date.now()}`
      })
    }

    const elizaData = await elizaResponse.json()
    console.log('Received response from Eliza:', elizaData)

    // Format the response for our frontend
    const chatResponse: ChatResponse = {
      success: true,
      response: elizaData.response || elizaData.message || "I'm processing your request...",
      conversationId: elizaData.conversationId || conversationId || `conv_${Date.now()}`
    }

    return NextResponse.json(chatResponse)

  } catch (error) {
    console.error('Error in chat API route:', error)
    
    // Return a user-friendly error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      {
        success: false,
        error: `Failed to connect to AI agent: ${errorMessage}`,
        response: "I'm having trouble connecting right now. Please make sure the Eliza agent is running and try again.",
        conversationId: `conv_${Date.now()}`
      },
      { status: 500 }
    )
  }
}

// Optional: Handle GET requests for health checks
export async function GET() {
  return NextResponse.json({ 
    status: 'Chat API is running',
    timestamp: new Date().toISOString(),
    elizaUrl: process.env.ELIZA_AGENT_URL || 'http://localhost:3001'
  })
}