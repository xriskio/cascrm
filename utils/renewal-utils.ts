// Function to generate a renewal ID
export function generateRenewalId() {
  const prefix = "RNW"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${timestamp}-${random}`
}
