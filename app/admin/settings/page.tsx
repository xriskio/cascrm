export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Company Name</label>
              <input
                type="text"
                defaultValue="InsureTrac by Casurance"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Contact Email</label>
              <input
                type="email"
                defaultValue="contact@insuretrac.com"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">Phone Number</label>
              <input
                type="text"
                defaultValue="(555) 123-4567"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">Session Timeout (minutes)</label>
              <input
                type="number"
                defaultValue="30"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="mfa"
                defaultChecked
                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="mfa" className="ml-2 block text-sm text-muted-foreground">
                Require Multi-Factor Authentication
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="passwordPolicy"
                defaultChecked
                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="passwordPolicy" className="ml-2 block text-sm text-muted-foreground">
                Enforce Strong Password Policy
              </label>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Email Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">SMTP Server</label>
              <input
                type="text"
                defaultValue="smtp.example.com"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">SMTP Port</label>
              <input
                type="number"
                defaultValue="587"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">From Email</label>
              <input
                type="email"
                defaultValue="noreply@insuretrac.com"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                defaultChecked
                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-muted-foreground">
                Email Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="smsNotifications" className="ml-2 block text-sm text-muted-foreground">
                SMS Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inAppNotifications"
                defaultChecked
                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="inAppNotifications" className="ml-2 block text-sm text-muted-foreground">
                In-App Notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
          Save Settings
        </button>
      </div>
    </div>
  )
}
