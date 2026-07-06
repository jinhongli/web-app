import { Suspense } from "react"

import { RegisterForm } from "./register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
