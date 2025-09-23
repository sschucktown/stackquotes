import { type NextRequest, NextResponse } from "next/server"

// Mock proposal data - in production this would come from your database
const mockProposals = {
  prop_123: {
    id: "prop_123",
    title: "Kitchen Remodel Project",
    contractor: {
      name: "Smith Construction LLC",
      email: "john@smithconstruction.com",
      phone: "(555) 123-4567",
      logo: null,
    },
    client: {
      name: "Johnson Residence",
      email: "client@example.com",
      address: "123 Oak Street, Springfield, IL 62701",
    },
    projectDescription: "Complete kitchen renovation including cabinets, countertops, flooring, and appliances.",
    validUntil: "2024-02-15",
    depositPercentage: 25,
    taxRate: 8.5,
    status: "pending",
    tiers: [
      {
        name: "Good",
        description: "Essential features with quality materials",
        lineItems: [
          { description: "Cabinet installation (standard grade)", quantity: 1, unitPrice: 8500, total: 8500 },
          { description: "Quartz countertops", quantity: 25, unitPrice: 65, total: 1625 },
          { description: "Vinyl plank flooring", quantity: 200, unitPrice: 4.5, total: 900 },
          { description: "Standard appliance package", quantity: 1, unitPrice: 3200, total: 3200 },
        ],
        subtotal: 14225,
        tax: 1209.13,
        total: 15434.13,
      },
      {
        name: "Better",
        description: "Enhanced features with premium materials",
        lineItems: [
          { description: "Cabinet installation (premium grade)", quantity: 1, unitPrice: 12000, total: 12000 },
          { description: "Granite countertops", quantity: 25, unitPrice: 85, total: 2125 },
          { description: "Hardwood flooring", quantity: 200, unitPrice: 8, total: 1600 },
          { description: "Mid-range appliance package", quantity: 1, unitPrice: 5500, total: 5500 },
          { description: "Under-cabinet lighting", quantity: 1, unitPrice: 800, total: 800 },
        ],
        subtotal: 22025,
        tax: 1872.13,
        total: 23897.13,
      },
      {
        name: "Best",
        description: "Top-tier features with luxury materials",
        lineItems: [
          { description: "Custom cabinet installation (luxury grade)", quantity: 1, unitPrice: 18000, total: 18000 },
          { description: "Marble countertops", quantity: 25, unitPrice: 120, total: 3000 },
          { description: "Premium hardwood flooring", quantity: 200, unitPrice: 12, total: 2400 },
          { description: "High-end appliance package", quantity: 1, unitPrice: 8500, total: 8500 },
          { description: "Smart home integration", quantity: 1, unitPrice: 1500, total: 1500 },
          { description: "Premium lighting package", quantity: 1, unitPrice: 1200, total: 1200 },
        ],
        subtotal: 34600,
        tax: 2941,
        total: 37541,
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const proposal = mockProposals[params.id as keyof typeof mockProposals]

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const proposal = mockProposals[params.id as keyof typeof mockProposals]

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Mock update - in production you'd update your database
    const updatedProposal = { ...proposal, ...updates }

    console.log("Proposal updated:", updatedProposal)

    return NextResponse.json(updatedProposal)
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 })
  }
}
