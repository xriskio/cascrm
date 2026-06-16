import type React from "react"
import Link from "next/link"

export default function RenewalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-[#0A0A0B]">
      <div className="w-64 bg-[#0F0F11] p-4 border-r border-[rgba(255,255,255,0.06)]">
        <h2 className="text-lg font-semibold mb-4 text-[#F0F0F2]">Renewals Options</h2>
        <ul>
          <li className="mb-2">
            <Link href="/renewals" className="text-[#8A8A96] hover:text-[#3B82F6]">
              Renewals List
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/renewals/import" className="text-[#8A8A96] hover:text-[#3B82F6]">
              Import Renewals
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/renewals/bulk-operations" className="text-[#8A8A96] hover:text-[#3B82F6]">
              Bulk Operations
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-4 w-full bg-[#0A0A0B]">{children}</div>
    </div>
  )
}
