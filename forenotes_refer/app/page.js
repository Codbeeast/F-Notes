import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default async function SignInPage() {
  const { userId } = await auth();

  // If the user is already signed in, redirect them to the dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // Otherwise, show the premium styled sign-in page
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Layer with glow effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-blue-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] bg-purple-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo / Branding */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src="/forenotes.png"
            alt="ForeNotes Logo"
            className="h-10 w-auto object-contain mb-4"
          />
          <p className="text-slate-400 text-sm text-center">
            Sign in to access your dashboard and Referral network.
          </p>
        </div>

        {/* Clerk SignIn Component with customized appearance */}
        <SignIn
          routing="hash"
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-2xl backdrop-blur-xl rounded-2xl border border-white/10",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all rounded-xl",
              socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border border-white/10 transition-all",
              formFieldInput: "bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl transition-colors",
              footerAction: "hidden", // Completely hides the "No account? Sign up" section
            },
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "rgba(15, 23, 42, 0.7)", // Deep slate background to blend well with the blur
            }
          }}
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/auth/sign-up"
        />
      </div>
    </div>
  );
}
