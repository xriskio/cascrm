import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock, Mail, VoicemailIcon as Fax, AlertTriangle, Globe, ExternalLink } from "lucide-react"
import Link from "next/link"

interface CompanyInformationProps {
  showHoursOnly?: boolean
  showWebsitesOnly?: boolean
}

export function CompanyInformation({ showHoursOnly = false, showWebsitesOnly = false }: CompanyInformationProps) {
  const companyInfo = {
    name: "Casurance Inc.",
    address: {
      street: "714 W. Olympic Boulevard",
      suite: "Ste 906",
      city: "Los Angeles",
      state: "CA",
      zip: "90015",
    },
    contact: {
      tollFree: "323-546-3030",
      phone: "1-888-254-0089",
      text: "3235463030",
      fax: "310-464-0633",
      email: "ops@casurance.net",
    },
    websites: [
      { name: "www.casurance.net", url: "https://www.casurance.net", description: "Main company website" },
      { name: "www.casurance.com", url: "https://www.casurance.com", description: "Alternative company domain" },
      { name: "www.insurelimos.net", url: "https://www.insurelimos.net", description: "Limousine insurance services" },
      { name: "insurelimos.com", url: "https://insurelimos.com", description: "Public auto specialists" },
      { name: "truxsurance.com", url: "https://truxsurance.com", description: "Commercial truck insurance" },
    ],
    hours: {
      monday: "8:30 am - 5:00 pm",
      tuesday: "8:30 am - 5:00 pm",
      wednesday: "8:30 am - 5:00 pm",
      thursday: "8:30 am - 5:00 pm",
      friday: "8:30 am - 5:00 pm",
      saturday: "Closed",
      sunday: "Closed",
    },
    policies: {
      walkins: "No Walkins Allowed without appointment",
    },
  }

  if (showWebsitesOnly) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-500" />
            Company Websites
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {companyInfo.websites.map((website, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{website.name}</p>
                  <p className="text-sm text-muted-foreground">{website.description}</p>
                </div>
                <Link
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-300"
                >
                  Visit <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showHoursOnly) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Business Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Monday:</span>
                <span>{companyInfo.hours.monday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tuesday:</span>
                <span>{companyInfo.hours.tuesday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Wednesday:</span>
                <span>{companyInfo.hours.wednesday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Thursday:</span>
                <span>{companyInfo.hours.thursday}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Friday:</span>
                <span>{companyInfo.hours.friday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Saturday:</span>
                <span className="text-muted-foreground">{companyInfo.hours.saturday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sunday:</span>
                <span className="text-muted-foreground">{companyInfo.hours.sunday}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 p-3 bg-amber-500/10 border border-border rounded-md">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-300">{companyInfo.policies.walkins}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-orange-600 mb-1">{companyInfo.name}</h2>
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p>{companyInfo.address.street}</p>
            <p>{companyInfo.address.suite}</p>
            <p>
              {companyInfo.address.city}, {companyInfo.address.state} {companyInfo.address.zip}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-500" />
              Contact Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Toll Free:</span>
                <p>{companyInfo.contact.tollFree}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Phone:</span>
                <p>{companyInfo.contact.phone}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Text:</span>
                <p>{companyInfo.contact.text}</p>
              </div>
              <div className="flex items-center gap-2">
                <Fax className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Fax:</span>
                <p>{companyInfo.contact.fax}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <p>{companyInfo.contact.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Business Hours
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Monday:</span>
                <span>{companyInfo.hours.monday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tuesday:</span>
                <span>{companyInfo.hours.tuesday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Wednesday:</span>
                <span>{companyInfo.hours.wednesday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Thursday:</span>
                <span>{companyInfo.hours.thursday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Friday:</span>
                <span>{companyInfo.hours.friday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Saturday:</span>
                <span className="text-muted-foreground">{companyInfo.hours.saturday}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sunday:</span>
                <span className="text-muted-foreground">{companyInfo.hours.sunday}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-5 w-5 text-orange-500" />
            Company Websites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyInfo.websites.map((website, index) => (
              <div key={index} className="flex flex-col">
                <Link
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-300 flex items-center gap-1"
                >
                  {website.name} <ExternalLink className="h-3 w-3" />
                </Link>
                <span className="text-sm text-muted-foreground">{website.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-2 p-3 bg-amber-500/10 border border-border rounded-md">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-300">{companyInfo.policies.walkins}</p>
      </div>
    </div>
  )
}
