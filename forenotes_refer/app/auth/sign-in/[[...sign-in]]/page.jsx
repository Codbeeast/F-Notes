import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Layer with glow effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-blue-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] bg-purple-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <img
            src="/forenotes.png"
            alt="ForeNotes Logo"
            className="h-10 w-auto object-contain mb-4 mx-auto"
          />
          <h2 className="text-3xl font-bold text-white mb-2">
            Sign in to your account
          </h2>
          <p className="text-slate-400">
            Welcome back! Please sign in to access your referral dashboard.
          </p>
        </div>
        <div className="flex justify-center w-full">
          <SignIn 
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
                colorBackground: "rgba(15, 23, 42, 0.7)",
              }
            }}
            path="/auth/sign-in"
            routing="path"
          />
        </div>
      </div>
    </div>
  );
}
