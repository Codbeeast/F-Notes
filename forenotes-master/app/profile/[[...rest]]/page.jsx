"use client";

import React from "react";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserProfile
} from "@clerk/nextjs";
import { dark } from "@clerk/themes"; // Clerk's dark preset

import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";

export default function Page() {
  return (
    <>
      <SignedIn>
        <div
          style={{
            background: "#000", // full black background
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "2rem",
            paddingTop: "6rem",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 980,
            }}
          >
            <SubscriptionStatus />

            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                background: "#000" // black container background
              }}
            >
              <UserProfile
                appearance={{
                  baseTheme: dark, // use Clerk's built-in dark mode
                  variables: {
                    colorPrimary: "#00ff88", // accent color (change to match your app)
                    colorBackground: "#000000",
                    colorText: "#ffffff",
                    colorInputBackground: "#111111",
                    colorInputText: "#ffffff"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
