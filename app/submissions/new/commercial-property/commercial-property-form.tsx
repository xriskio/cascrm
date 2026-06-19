"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitApplication } from "@/app/actions/submit-application"
import { US_STATES as states } from "@/lib/states"

export default function CommercialPropertyForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useMailingAddress, setUseMailingAddress] = useState(false)
  const [sameAsInspection, setSameAsInspection] = useState({
    accounting: false,
    claims: false,
  })
  const [defaultNoAnswers, setDefaultNoAnswers] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("insuranceType", "commercial-property")

      const result = await submitApplication(formData)

      if (result?.submissionNumber) {
        router.push(`/submissions/success?submissionNumber=${result.submissionNumber}`)
      } else {
        throw new Error("Submission failed without a submission number")
      }
    } catch (err) {
      console.error("Error submitting commercial property form:", err)
      alert("There was a problem submitting the form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDefaultNoAnswers = () => {
    setDefaultNoAnswers(!defaultNoAnswers)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Commercial Property Submission</h1>

      {/* General Information */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">General Information</legend>

        <div className="space-y-4">
          <h3 className="font-medium">Insured Mailing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="street1" className="block text-sm font-medium">
                Street 1 *
              </label>
              <input id="street1" name="street1" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="street2" className="block text-sm font-medium">
                Street 2
              </label>
              <input id="street2" name="street2" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium">
                Zip Code *
              </label>
              <input id="zipCode" name="zipCode" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium">
                City *
              </label>
              <input id="city" name="city" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="county" className="block text-sm font-medium">
                County *
              </label>
              <input id="county" name="county" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium">
                State *
              </label>
              <select id="state" name="state" required className="w-full p-2 border rounded">
                <option value="">Please choose</option>
                {states.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="officePhone" className="block text-sm font-medium">
              Office Phone
            </label>
            <input id="officePhone" name="officePhone" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="mobilePhone" className="block text-sm font-medium">
              Mobile Phone
            </label>
            <input id="mobilePhone" name="mobilePhone" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              E-mail Address
            </label>
            <input id="email" name="email" type="email" className="w-full p-2 border rounded" />
          </div>
        </div>
      </fieldset>

      {/* Insured Information */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Insured Information</legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="yearsInBusiness" className="block text-sm font-medium">
              Yrs in Bus.
            </label>
            <input id="yearsInBusiness" name="yearsInBusiness" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="sicCode" className="block text-sm font-medium">
              SIC Code
            </label>
            <input id="sicCode" name="sicCode" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="naicsCode" className="block text-sm font-medium">
              NAICS Code
            </label>
            <input id="naicsCode" name="naicsCode" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="legalEntity" className="block text-sm font-medium">
              Legal Entity
            </label>
            <select id="legalEntity" name="legalEntity" className="w-full p-2 border rounded">
              <option value="">Please choose</option>
              <option value="Corporation">Corporation</option>
              <option value="Individual">Individual</option>
              <option value="Joint Venture">Joint Venture</option>
              <option value="LLC">LLC</option>
              <option value="LLP">LLP</option>
              <option value="Partnership">Partnership</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="fein" className="block text-sm font-medium">
              FEIN
            </label>
            <input id="fein" name="fein" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="bureauId" className="block text-sm font-medium">
              Bureau ID
            </label>
            <input id="bureauId" name="bureauId" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="website" className="block text-sm font-medium">
              Website
            </label>
            <input id="website" name="website" className="w-full p-2 border rounded" />
          </div>
          <div className="flex items-center space-x-4 mt-6">
            <span className="text-sm font-medium">Wholesale Carrier?</span>
            <div className="flex items-center space-x-2">
              <input type="radio" id="wholesaleCarrierYes" name="wholesaleCarrier" value="Yes" />
              <label htmlFor="wholesaleCarrierYes">Yes</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" id="wholesaleCarrierNo" name="wholesaleCarrier" value="No" />
              <label htmlFor="wholesaleCarrierNo">No</label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium">
            Nature of Business / Description of Operations (Please be as detailed as possible)
          </label>
          <textarea
            id="businessDescription"
            name="businessDescription"
            rows={4}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div>
          <label htmlFor="dba" className="block text-sm font-medium">
            DBA
          </label>
          <input id="dba" name="dba" className="w-full p-2 border rounded" />
        </div>
      </fieldset>

      {/* Contact Information */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Contact Information</legend>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Inspection:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="inspectionName" className="block text-sm font-medium">
                  Name
                </label>
                <input id="inspectionName" name="inspectionName" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="inspectionPhone" className="block text-sm font-medium">
                  Phone
                </label>
                <input id="inspectionPhone" name="inspectionPhone" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="inspectionExt" className="block text-sm font-medium">
                  Ext.
                </label>
                <input id="inspectionExt" name="inspectionExt" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="inspectionMobile" className="block text-sm font-medium">
                  Mobile Phone
                </label>
                <input id="inspectionMobile" name="inspectionMobile" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label htmlFor="inspectionEmail" className="block text-sm font-medium">
                  E-mail
                </label>
                <input id="inspectionEmail" name="inspectionEmail" type="email" className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium">Accounting:</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sameAsInspectionAccounting"
                  checked={sameAsInspection.accounting}
                  onChange={() =>
                    setSameAsInspection({ ...sameAsInspection, accounting: !sameAsInspection.accounting })
                  }
                />
                <label htmlFor="sameAsInspectionAccounting" className="text-sm">
                  Same as Inspection
                </label>
              </div>
            </div>
            {!sameAsInspection.accounting && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="accountingName" className="block text-sm font-medium">
                    Name
                  </label>
                  <input id="accountingName" name="accountingName" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="accountingPhone" className="block text-sm font-medium">
                    Phone
                  </label>
                  <input id="accountingPhone" name="accountingPhone" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="accountingExt" className="block text-sm font-medium">
                    Ext.
                  </label>
                  <input id="accountingExt" name="accountingExt" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="accountingMobile" className="block text-sm font-medium">
                    Mobile Phone
                  </label>
                  <input id="accountingMobile" name="accountingMobile" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="accountingEmail" className="block text-sm font-medium">
                    E-mail
                  </label>
                  <input
                    id="accountingEmail"
                    name="accountingEmail"
                    type="email"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium">Claims:</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sameAsInspectionClaims"
                  checked={sameAsInspection.claims}
                  onChange={() => setSameAsInspection({ ...sameAsInspection, claims: !sameAsInspection.claims })}
                />
                <label htmlFor="sameAsInspectionClaims" className="text-sm">
                  Same as Inspection
                </label>
              </div>
            </div>
            {!sameAsInspection.claims && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="claimsName" className="block text-sm font-medium">
                    Name
                  </label>
                  <input id="claimsName" name="claimsName" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="claimsPhone" className="block text-sm font-medium">
                    Phone
                  </label>
                  <input id="claimsPhone" name="claimsPhone" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="claimsExt" className="block text-sm font-medium">
                    Ext.
                  </label>
                  <input id="claimsExt" name="claimsExt" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="claimsMobile" className="block text-sm font-medium">
                    Mobile Phone
                  </label>
                  <input id="claimsMobile" name="claimsMobile" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label htmlFor="claimsEmail" className="block text-sm font-medium">
                    E-mail
                  </label>
                  <input id="claimsEmail" name="claimsEmail" type="email" className="w-full p-2 border rounded" />
                </div>
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Nature of Business */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Nature of Business</legend>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessApartments" name="businessType" value="Apartments" />
            <label htmlFor="businessApartments">Apartments</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessCondominiums" name="businessType" value="Condominiums" />
            <label htmlFor="businessCondominiums">Condominiums</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessContractor" name="businessType" value="Contractor" />
            <label htmlFor="businessContractor">Contractor</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessInstitutional" name="businessType" value="Institutional" />
            <label htmlFor="businessInstitutional">Institutional</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessManufacturing" name="businessType" value="Manufacturing" />
            <label htmlFor="businessManufacturing">Manufacturing</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessOffice" name="businessType" value="Office" />
            <label htmlFor="businessOffice">Office</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessRestaurant" name="businessType" value="Restaurant" />
            <label htmlFor="businessRestaurant">Restaurant</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessRetail" name="businessType" value="Retail" />
            <label htmlFor="businessRetail">Retail</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessService" name="businessType" value="Service" />
            <label htmlFor="businessService">Service</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessWholesale" name="businessType" value="Wholesale" />
            <label htmlFor="businessWholesale">Wholesale</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="businessOther" name="businessType" value="Other" />
            <label htmlFor="businessOther">Other</label>
          </div>
        </div>

        <div>
          <label htmlFor="otherNamedInsuredsOperations" className="block text-sm font-medium">
            Description of Operations of Other Named Insureds
          </label>
          <textarea
            id="otherNamedInsuredsOperations"
            name="otherNamedInsuredsOperations"
            rows={3}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium">
            Remarks / Process Instructions
          </label>
          <textarea
            id="remarks"
            name="remarks"
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="ACORD 101, Additional Remarks Schedule may be attached is more space is required"
          ></textarea>
        </div>
      </fieldset>

      {/* Premises Information */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Premises Information</legend>

        <h3 className="font-medium">Premise 1</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="locNumber" className="block text-sm font-medium">
              Loc # *
            </label>
            <input id="locNumber" name="locNumber" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="bldgNumber" className="block text-sm font-medium">
              Bldg # *
            </label>
            <input id="bldgNumber" name="bldgNumber" required className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="useMailingAddressForPremise"
            checked={useMailingAddress}
            onChange={() => setUseMailingAddress(!useMailingAddress)}
          />
          <label htmlFor="useMailingAddressForPremise" className="text-sm">
            Set this premise to Insured's mailing address
          </label>
        </div>

        {!useMailingAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="premiseStreet1" className="block text-sm font-medium">
                Street 1 *
              </label>
              <input id="premiseStreet1" name="premiseStreet1" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="premiseStreet2" className="block text-sm font-medium">
                Street 2
              </label>
              <input id="premiseStreet2" name="premiseStreet2" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="premiseZipCode" className="block text-sm font-medium">
                Zip Code *
              </label>
              <input id="premiseZipCode" name="premiseZipCode" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="premiseCity" className="block text-sm font-medium">
                City *
              </label>
              <input id="premiseCity" name="premiseCity" required className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="premiseCounty" className="block text-sm font-medium">
                County
              </label>
              <input id="premiseCounty" name="premiseCounty" className="w-full p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="premiseState" className="block text-sm font-medium">
                State *
              </label>
              <select id="premiseState" name="premiseState" required className="w-full p-2 border rounded">
                <option value="">Please choose</option>
                {states.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cityLimits" className="block text-sm font-medium">
              City Limits
            </label>
            <select id="cityLimits" name="cityLimits" className="w-full p-2 border rounded">
              <option value="">Please choose</option>
              <option value="Inside">Inside</option>
              <option value="Outside">Outside</option>
            </select>
          </div>
          <div>
            <label htmlFor="interest" className="block text-sm font-medium">
              Interest
            </label>
            <select id="interest" name="interest" className="w-full p-2 border rounded">
              <option value="">Please choose</option>
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fullTimeEmployees" className="block text-sm font-medium">
              # Full Time Employees
            </label>
            <input
              id="fullTimeEmployees"
              name="fullTimeEmployees"
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="partTimeEmployees" className="block text-sm font-medium">
              # Part Time Employees
            </label>
            <input
              id="partTimeEmployees"
              name="partTimeEmployees"
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="annualRevenues" className="block text-sm font-medium">
              Annual Revenues
            </label>
            <input id="annualRevenues" name="annualRevenues" type="number" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="occupiedArea" className="block text-sm font-medium">
              Occupied Area (Sq Ft)
            </label>
            <input id="occupiedArea" name="occupiedArea" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="openToPublicArea" className="block text-sm font-medium">
              Open to Public Area (Sq Ft)
            </label>
            <input id="openToPublicArea" name="openToPublicArea" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="totalBuildingArea" className="block text-sm font-medium">
              Total Building Area (Sq Ft)
            </label>
            <input
              id="totalBuildingArea"
              name="totalBuildingArea"
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label htmlFor="premiseOperationsDescription" className="block text-sm font-medium">
            Description of Operations
          </label>
          <textarea
            id="premiseOperationsDescription"
            name="premiseOperationsDescription"
            rows={3}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Any area leased to others?</span>
          <div className="flex items-center space-x-2">
            <input type="radio" id="leasedToOthersYes" name="leasedToOthers" value="Yes" />
            <label htmlFor="leasedToOthersYes">Yes</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="radio" id="leasedToOthersNo" name="leasedToOthers" value="No" />
            <label htmlFor="leasedToOthersNo">No</label>
          </div>
        </div>
      </fieldset>

      {/* Common ACORD Questions */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Common ACORD Questions</legend>

        <h3 className="font-medium">General Information</h3>
        <p className="text-sm mb-4">Explain all 'Yes' Responses</p>

        <div className="flex items-center space-x-2 mb-4">
          <input type="checkbox" id="defaultNoAnswers" checked={defaultNoAnswers} onChange={handleDefaultNoAnswers} />
          <label htmlFor="defaultNoAnswers" className="text-sm">
            Please check here to default all answers to 'no'. You may then edit each response to a 'yes' if applicable.
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q1a" className="text-sm">
              1a. Is the applicant a subsidiary of another entity?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q1aYes" name="q1a" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q1aYes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q1aNo" name="q1a" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q1aNo">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q1b" className="text-sm">
              1b. Does the applicant have any subsidiaries?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q1bYes" name="q1b" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q1bYes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q1bNo" name="q1b" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q1bNo">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q2" className="text-sm">
              2. Is a formal safety program in operation?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q2Yes" name="q2" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q2Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q2No" name="q2" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q2No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q3" className="text-sm">
              3. Any exposure to flammables, explosives, chemicals?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q3Yes" name="q3" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q3Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q3No" name="q3" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q3No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q4" className="text-sm">
              4. Any other insurance with this company? (List policy numbers)
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q4Yes" name="q4" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q4Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q4No" name="q4" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q4No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q5" className="text-sm">
              5. Any policy or coverage declined, cancelled or non-renewed during the prior three (3) years for any
              premises or operations? (Missouri Applicants - Do not answer this question)
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q5Yes" name="q5" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q5Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q5No" name="q5" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q5No">No</label>
              </div>
            </div>
          </div>

          {/* Questions 6-13 follow the same pattern */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q6" className="text-sm">
              6. Any past losses or claims relating to sexual abuse or molestation allegations, discrimination or
              negligent hiring?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q6Yes" name="q6" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q6Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q6No" name="q6" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q6No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q7" className="text-sm">
              7. During the last five years (ten in RI) has any applicant been indicted for or convicted of any degree
              of the crime of fraud, bribery, arson or any other arson-related crime in connection with this or any
              other property?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q7Yes" name="q7" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q7Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q7No" name="q7" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q7No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q8" className="text-sm">
              8. Any uncorrected fire and/or safety code violations?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q8Yes" name="q8" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q8Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q8No" name="q8" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q8No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q9" className="text-sm">
              9. Has applicant had a foreclosure, repossession, bankruptcy or filed for bankruptcy during the last five
              (5) years?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q9Yes" name="q9" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q9Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q9No" name="q9" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q9No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q10" className="text-sm">
              10. Has applicant had a judgement or lien during the last five (5) years?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q10Yes" name="q10" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q10Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q10No" name="q10" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q10No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q11" className="text-sm">
              11. Has business been placed in a trust?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q11Yes" name="q11" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q11Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q11No" name="q11" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q11No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q12" className="text-sm">
              12. Any foreign operations, foreign products distributed in USA, or US products sold/distributed in
              foreign countries?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q12Yes" name="q12" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q12Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q12No" name="q12" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q12No">No</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2">
            <label htmlFor="q13" className="text-sm">
              13. Does applicant have other business ventures for which coverage is not requested?
            </label>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-2">
                <input type="radio" id="q13Yes" name="q13" value="Yes" defaultChecked={!defaultNoAnswers} />
                <label htmlFor="q13Yes">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="q13No" name="q13" value="No" defaultChecked={defaultNoAnswers} />
                <label htmlFor="q13No">No</label>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Prior Carrier and Loss History */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Prior Carrier and Loss History</legend>

        <h3 className="font-medium">Prior Carrier Information</h3>
        <select name="priorCarrier" className="w-full p-2 border rounded mb-4">
          <option value="">Please choose</option>
          <option value="Carrier 1">Carrier 1</option>
          <option value="Carrier 2">Carrier 2</option>
          <option value="Carrier 3">Carrier 3</option>
        </select>

        <h3 className="font-medium">Loss History</h3>
        <div className="flex items-center space-x-2 mb-4">
          <input type="checkbox" id="noLosses" name="noLosses" />
          <label htmlFor="noLosses">Check if none</label>
        </div>

        <p className="text-sm mb-4">
          Enter all claims or losses (regardless of fault and whether or not insured) or occurrences that may give rise
          to claims for the last 5 years.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Amount Paid</th>
                <th className="border p-2 text-left">Amount Reserved</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">
                  <input type="date" name="loss1Date" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <input name="loss1Description" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <input type="number" name="loss1AmountPaid" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <input type="number" name="loss1AmountReserved" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <select name="loss1Status" className="w-full p-1 border rounded">
                    <option value="">Select</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="border p-2">
                  <input type="date" name="loss2Date" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <input name="loss2Description" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <input type="number" name="loss2AmountPaid" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <input type="number" name="loss2AmountReserved" className="w-full p-1 border rounded" />
                </td>
                <td className="border p-2">
                  <select name="loss2Status" className="w-full p-1 border rounded">
                    <option value="">Select</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
              </tr>
              <tr className="bg-muted">
                <td colSpan={2} className="border p-2 text-right font-medium">
                  Totals:
                </td>
                <td className="border p-2">$0</td>
                <td className="border p-2">$0</td>
                <td className="border p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* Property: Locations and Buildings */}
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="font-semibold text-lg">Property: Locations and Buildings</legend>

        <h3 className="font-medium">CP Location and Building # 1</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpPremisesNumber" className="block text-sm font-medium">
              Premises# *
            </label>
            <input id="cpPremisesNumber" name="cpPremisesNumber" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="cpBuildingNumber" className="block text-sm font-medium">
              Building# *
            </label>
            <input id="cpBuildingNumber" name="cpBuildingNumber" required className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpStreet" className="block text-sm font-medium">
              Street *
            </label>
            <input id="cpStreet" name="cpStreet" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="cpStreet2" className="block text-sm font-medium">
              Street 2
            </label>
            <input id="cpStreet2" name="cpStreet2" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label htmlFor="buildingDescription" className="block text-sm font-medium">
            Building Description
          </label>
          <input id="buildingDescription" name="buildingDescription" className="w-full p-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="classCode" className="block text-sm font-medium">
              Class Code:
            </label>
            <input id="classCode" name="classCode" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="subjectOfInsurance" className="block text-sm font-medium">
              Subject Of Insurance
            </label>
            <select id="subjectOfInsurance" name="subjectOfInsurance" className="w-full p-2 border rounded">
              <option value="">Please choose</option>
              <option value="Building">Building</option>
              <option value="Business Personal Property">Business Personal Property</option>
              <option value="Business Income">Business Income</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="coinsurance" className="block text-sm font-medium">
              Coinsurance
            </label>
            <input id="coinsurance" name="coinsurance" defaultValue="90%" className="w-full p-2 border rounded" />
          </div>
          <div className="flex items-center space-x-4 mt-6">
            <span className="text-sm font-medium">Agreed Value</span>
            <div className="flex items-center space-x-2">
              <input type="radio" id="agreedValueYes" name="agreedValue" value="Yes" />
              <label htmlFor="agreedValueYes">Yes</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" id="agreedValueNo" name="agreedValue" value="No" />
              <label htmlFor="agreedValueNo">No</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="valuationMethod" className="block text-sm font-medium">
              Valuation Method
            </label>
            <input
              id="valuationMethod"
              name="valuationMethod"
              defaultValue="Replacement Cost"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="causeOfLoss" className="block text-sm font-medium">
              Cause of Loss
            </label>
            <input
              id="causeOfLoss"
              name="causeOfLoss"
              defaultValue="Special-Incl Theft"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="inflationGuard" className="block text-sm font-medium">
              Inflation Guard %
            </label>
            <input id="inflationGuard" name="inflationGuard" defaultValue="0%" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label htmlFor="deductible" className="block text-sm font-medium">
            Deductible
          </label>
          <input id="deductible" name="deductible" defaultValue="$1,000" className="w-full p-2 border rounded" />
        </div>

        <h3 className="font-medium mt-6">Additional Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="constructionType" className="block text-sm font-medium">
              Construction Type
            </label>
            <select id="constructionType" name="constructionType" className="w-full p-2 border rounded">
              <option value="">Please choose</option>
              <option value="Frame">Frame</option>
              <option value="Joisted Masonry">Joisted Masonry</option>
              <option value="Non-Combustible">Non-Combustible</option>
              <option value="Masonry Non-Combustible">Masonry Non-Combustible</option>
              <option value="Modified Fire Resistive">Modified Fire Resistive</option>
              <option value="Fire Resistive">Fire Resistive</option>
            </select>
          </div>
          <div>
            <label htmlFor="distanceToHydrant" className="block text-sm font-medium">
              Distance to Hydrant (FT)
            </label>
            <input
              id="distanceToHydrant"
              name="distanceToHydrant"
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="distanceToFireStation" className="block text-sm font-medium">
              Distance to Fire Station (MI)
            </label>
            <input
              id="distanceToFireStation"
              name="distanceToFireStation"
              type="number"
              step="0.1"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="fireDistrict" className="block text-sm font-medium">
              Fire District
            </label>
            <input id="fireDistrict" name="fireDistrict" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="codeNumber" className="block text-sm font-medium">
              Code Number
            </label>
            <input id="codeNumber" name="codeNumber" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="protectionClass" className="block text-sm font-medium">
              Protection Class
            </label>
            <input id="protectionClass" name="protectionClass" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="numberOfStories" className="block text-sm font-medium">
              # of Stories
            </label>
            <input id="numberOfStories" name="numberOfStories" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="numberOfBasements" className="block text-sm font-medium">
              # of Basm'ts
            </label>
            <input
              id="numberOfBasements"
              name="numberOfBasements"
              type="number"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="yearBuilt" className="block text-sm font-medium">
              Year Built
            </label>
            <input id="yearBuilt" name="yearBuilt" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="totalArea" className="block text-sm font-medium">
              Total Area (Sq FT)
            </label>
            <input id="totalArea" name="totalArea" type="number" className="w-full p-2 border rounded" />
          </div>
        </div>

        <h3 className="font-medium mt-4">Building Improvements</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="wiringYear" className="block text-sm font-medium">
              Wiring Year
            </label>
            <input id="wiringYear" name="wiringYear" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="plumbingYear" className="block text-sm font-medium">
              Plumbing Year
            </label>
            <input id="plumbingYear" name="plumbingYear" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="roofingYear" className="block text-sm font-medium">
              Roofing Year
            </label>
            <input id="roofingYear" name="roofingYear" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="heatingYear" className="block text-sm font-medium">
              Heating Year
            </label>
            <input id="heatingYear" name="heatingYear" type="number" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="buildingCodeGrade" className="block text-sm font-medium">
              Bldg Code Grade
            </label>
            <input id="buildingCodeGrade" name="buildingCodeGrade" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="taxCode" className="block text-sm font-medium">
              Tax Code
            </label>
            <input id="taxCode" name="taxCode" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="roofType" className="block text-sm font-medium">
              Roof Type
            </label>
            <input id="roofType" name="roofType" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label htmlFor="otherOccupancies" className="block text-sm font-medium">
            Other Occupancies
          </label>
          <textarea
            id="otherOccupancies"
            name="otherOccupancies"
            rows={2}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="windClass" className="block text-sm font-medium">
              Wind Class
            </label>
            <select id="windClass" name="windClass" className="w-full p-2 border rounded">
              <option value="">Please choose</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="heatingSource" className="block text-sm font-medium">
              Heating Source incl. Woodburning Stove or Fireplace Insert
            </label>
            <input id="heatingSource" name="heatingSource" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="dateInstalled" className="block text-sm font-medium">
              Date Installed
            </label>
            <input id="dateInstalled" name="dateInstalled" type="date" className="w-full p-2 border rounded" />
          </div>
        </div>

        <div>
          <label htmlFor="heatingSourceManufacturer" className="block text-sm font-medium">
            Heating Source Manufacturer
          </label>
          <input
            id="heatingSourceManufacturer"
            name="heatingSourceManufacturer"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input type="checkbox" id="historicLandmark" name="historicLandmark" />
          <label htmlFor="historicLandmark">Property has been designated an Historic Landmark</label>
        </div>

        <div>
          <label htmlFor="openSides" className="block text-sm font-medium">
            # of open sides on structure:
          </label>
          <input id="openSides" name="openSides" type="number" className="w-full p-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rightExposure" className="block text-sm font-medium">
              Right Exposure & Distance
            </label>
            <input id="rightExposure" name="rightExposure" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="leftExposure" className="block text-sm font-medium">
              Left Exposure & Distance
            </label>
            <input id="leftExposure" name="leftExposure" className="w-full p-2 border rounded" />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-border rounded shadow-sm text-sm font-medium text-muted-foreground bg-card hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  )
}
