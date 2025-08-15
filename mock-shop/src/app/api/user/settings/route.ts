import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Simple in-memory store for user settings (temporary solution)
// In production, this would be stored in the database
const userSettingsStore = new Map<string, any>()

// GET /api/user/settings - Get user settings
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get settings from our temporary store or use defaults
    const defaultSettings = {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      orderUpdates: true,
      twoFactorAuth: false,
      publicProfile: false
    }

    const userSettings = userSettingsStore.get(session.user.id) || defaultSettings

    return NextResponse.json({ 
      user,
      settings: userSettings 
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/user/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { settings, profile } = await request.json()

    // Update profile information if provided
    if (profile) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          // Note: email updates would require verification in a real app
        }
      })
    }

    // Store settings in our temporary store
    if (settings) {
      userSettingsStore.set(session.user.id, settings)
      console.log("Settings persisted for user:", session.user.id, settings)
    }

    return NextResponse.json({ 
      message: "Settings updated successfully",
      settings 
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}