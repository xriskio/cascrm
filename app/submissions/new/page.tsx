import Link from "next/link"
import {
  Car,
  Ambulance,
  ShieldCheck,
  HardHat,
  Umbrella,
  CreditCard,
  Building,
  Wrench,
  Truck,
  Briefcase,
  Home,
  ShoppingBag,
  Utensils,
  Factory,
  Building2,
  Landmark,
} from "lucide-react"

export default function NewSubmissionPage() {
  const insuranceTypes = [
    // Personal Insurance Types (Restored)
    {
      id: "personal-auto",
      name: "Personal Auto",
      description: "Coverage for personal vehicles and drivers",
      icon: Car,
      category: "personal",
    },
    {
      id: "home-owners",
      name: "Home Owners",
      description: "Protection for residential properties",
      icon: Home,
      category: "personal",
    },

    // Commercial Insurance Types
    {
      id: "public-auto",
      name: "Public Auto",
      description: "For taxis, limousines, and other public transportation",
      icon: Car,
      category: "commercial",
    },
    {
      id: "nemt",
      name: "NEMT",
      description: "Non-Emergency Medical Transportation",
      icon: Ambulance,
      category: "commercial",
    },
    {
      id: "general-liability",
      name: "General Liability",
      description: "Commercial general liability coverage",
      icon: ShieldCheck,
      category: "commercial",
    },
    {
      id: "workers-comp",
      name: "Workers Comp",
      description: "Workers compensation insurance",
      icon: HardHat,
      category: "commercial",
    },
    {
      id: "excess-liability",
      name: "Excess Liability",
      description: "Additional liability coverage",
      icon: Umbrella,
      category: "commercial",
    },
    {
      id: "cyber-liability",
      name: "Cyber Liability",
      description: "Protection against cyber risks",
      icon: CreditCard,
      category: "commercial",
    },
    {
      id: "commercial-property",
      name: "Commercial Property",
      description: "Coverage for business property",
      icon: Building,
      category: "commercial",
    },
    {
      id: "garage-keepers",
      name: "Garage Keepers",
      description: "For auto service businesses",
      icon: Wrench,
      category: "commercial",
    },
    {
      id: "auto-dealers",
      name: "Auto Dealers",
      description: "For new and used auto dealerships",
      icon: Car,
      category: "commercial",
    },
    {
      id: "transportation",
      name: "Transportation",
      description: "For limo, taxi, NEMT, bus, and motorcoach",
      icon: Truck,
      category: "commercial",
    },
    {
      id: "business-owners-policy",
      name: "Business Owners Policy",
      description: "Combined property and liability for small businesses",
      icon: Briefcase,
      category: "commercial",
    },
    {
      id: "contractors",
      name: "Contractors",
      description: "Construction, renovation, and trade services",
      icon: HardHat,
      category: "commercial",
    },
    {
      id: "lessors-risk-only",
      name: "Lessors Risk Only",
      description: "Owners or landlords of leased commercial properties",
      icon: Home,
      category: "commercial",
    },
    {
      id: "retail-services",
      name: "Retail & Services",
      description: "Shops and professional services, including food trucks",
      icon: ShoppingBag,
      category: "commercial",
    },
    {
      id: "restaurants",
      name: "Restaurants",
      description: "Food and beverage establishments including bars",
      icon: Utensils,
      category: "commercial",
    },
    {
      id: "manufacturing",
      name: "Manufacturing",
      description: "Manufacturing, relabeling, repackaging, and importing",
      icon: Factory,
      category: "commercial",
    },
    {
      id: "vacant-buildings",
      name: "Vacant Buildings",
      description: "Unoccupied buildings or properties awaiting use",
      icon: Building2,
      category: "commercial",
    },
    {
      id: "vacant-land",
      name: "Vacant Land",
      description: "Unoccupied commercial land",
      icon: Landmark,
      category: "commercial",
    },
  ]

  // Group insurance types by category
  const personalTypes = insuranceTypes.filter((type) => type.category === "personal")
  const commercialTypes = insuranceTypes.filter((type) => type.category === "commercial")

  return (
    <div className="p-6">
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Create New Submission</h1>
        <p className="text-muted-foreground mb-6">
          Fill out the form below to create a new submission. All fields marked with an asterisk (*) are required.
        </p>

        {/* Personal Insurance Types */}
        <h2 className="text-xl font-semibold mb-4">Personal Insurance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {personalTypes.map((type) => (
            <Link
              key={type.id}
              href={`/submissions/new/${type.id}`}
              className="border border-border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all bg-card"
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Commercial Insurance Types */}
        <h2 className="text-xl font-semibold mb-4">Commercial Insurance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commercialTypes.map((type) => (
            <Link
              key={type.id}
              href={`/submissions/new/${type.id}`}
              className="border border-border rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <type.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
