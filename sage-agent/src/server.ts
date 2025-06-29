// sage-agent/src/server.ts
import express from 'express'
import cors from 'cors'
import { AgentRuntime, elizaLogger, generateMessageResponse, createAgentRuntime } from '@elizaos/core'
import { createAgent } from './agent'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Initialize the agent
let runtime: AgentRuntime | null = null

async function initializeAgent() {
  try {
    elizaLogger.info('Initializing Eliza agent...')
    
    // Import your character configuration
    const { character } = await import('./agent')
    
    // Create the agent runtime with proper configuration
    runtime = await createAgentRuntime({
      character,
      modelProvider: character.settings?.modelProvider,
      token: process.env.OPENAI_API_KEY, // Make sure this is set in your .env
    })
    
    elizaLogger.info('Agent runtime initialized successfully')
  } catch (error) {
    elizaLogger.error('Failed to initialize agent:', error)
    process.exit(1)
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    agent: runtime ? 'ready' : 'not initialized',
    character: runtime?.character?.name || 'unknown'
  })
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!runtime) {
      return res.status(503).json({
        success: false,
        error: 'Agent runtime not initialized'
      })
    }

    const { message, conversationId, userId = 'web_user' } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    const roomId = conversationId || `room_${userId}_${Date.now()}`
    
    elizaLogger.info('Received chat request:', { 
      message: message.substring(0, 50) + '...', 
      conversationId: roomId, 
      userId 
    })

    // Create proper message structure for ElizaOS
    const messageObj = {
      id: uuidv4(),
      userId,
      content: { 
        text: message.trim(),
        source: 'web'
      },
      agentId: runtime.agentId,
      roomId,
      createdAt: Date.now()
    }

    // Process the message through the runtime
    elizaLogger.info('Processing message with agent...')
    
    // Use the proper ElizaOS message processing
    const response = await generateMessageResponse({
      runtime,
      message: messageObj,
      state: await runtime.composeState(messageObj)
    })

    let agentResponse = "I'm here to help with your DeFi questions!"
    
    if (response && Array.isArray(response)) {
      // Handle multiple responses
      agentResponse = response.map(r => r.text || r.content?.text).filter(Boolean).join('\n\n')
    } else if (response && typeof response === 'object') {
      // Handle single response
      agentResponse = response.text || response.content?.text || agentResponse
    }

    elizaLogger.info('Generated response:', { 
      responseLength: agentResponse.length,
      preview: agentResponse.substring(0, 100) + '...' 
    })

    res.json({
      success: true,
      response: agentResponse,
      conversationId: roomId,
      timestamp: new Date().toISOString(),
      messageId: messageObj.id
    })

  } catch (error) {
    elizaLogger.error('Error processing chat message:', error)
    
    // Provide a helpful fallback response
    const fallbackResponse = "I'm experiencing some technical difficulties right now. As your DeFi assistant, I'm here to help with questions about decentralized finance, yield farming, liquidity provision, and DeFi protocols. Please try your question again!"
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      response: fallbackResponse,
      timestamp: new Date().toISOString()
    })
  }
})

// Get agent info endpoint
app.get('/api/agent', (req, res) => {
  if (!runtime) {
    return res.status(503).json({
      success: false,
      error: 'Agent runtime not initialized'
    })
  }

  res.json({
    success: true,
    agent: {
      name: runtime.character.name,
      bio: runtime.character.bio,
      topics: runtime.character.topics,
      modelProvider: runtime.character.settings?.modelProvider,
      model: runtime.character.settings?.model
    }
  })
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  elizaLogger.error('Unhandled error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

// Start the server
async function startServer() {
  try {
    await initializeAgent()
    
    app.listen(PORT, () => {
      elizaLogger.info(`=================================`)
      elizaLogger.info(`🤖 Sage DeFi Agent Server Started`)
      elizaLogger.info(`=================================`)
      elizaLogger.info(`Port: ${PORT}`)
      elizaLogger.info(`Health check: http://localhost:${PORT}/health`)
      elizaLogger.info(`Chat endpoint: http://localhost:${PORT}/api/chat`)
      elizaLogger.info(`Agent info: http://localhost:${PORT}/api/agent`)
      elizaLogger.info(`Agent: ${runtime?.character?.name || 'Unknown'}`)
      elizaLogger.info(`=================================`)
    })
  } catch (error) {
    elizaLogger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  elizaLogger.info(`Received ${signal}. Shutting down gracefully...`)
  
  if (runtime) {
    try {
      // Perform any cleanup needed for the runtime
      elizaLogger.info('Cleaning up agent runtime...')
      // Add any specific cleanup logic here if needed
    } catch (error) {
      elizaLogger.error('Error during runtime cleanup:', error)
    }
  }
  
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  elizaLogger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  elizaLogger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer().catch((error) => {
  elizaLogger.error('Failed to start server:', error)
  process.exit(1)
})