import type { Metadata } from "next"
import AutoDealersForm from "./auto-dealers-form"

export const metadata: Metadata = {
  title: "Auto Dealers Submission | InsureTrac",
  description: "Submit a new auto dealers insurance application",
}

export default function AutoDealersPage() {
  return <AutoDealersForm />
}
