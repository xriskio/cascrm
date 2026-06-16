import { LoginForm } from "@/components/auth/simplified-login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div>
          <div className="mx-auto flex h-20 w-auto items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-orange-500 shadow-xl">
            <h1 className="text-3xl font-bold text-white">InsureTrack</h1>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">InsureTrack Portal</h2>
          <p className="mt-2 text-center text-sm text-gray-100">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
