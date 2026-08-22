import React from "react";
import { useAuthStore } from "@/lib/auth-store";
import { NutrioLogin } from "./login/nutrio-login";
import { NutrioPersonalization } from "./personalization/personalization";
import { NutrioHome } from "./home/home";

export default function HomeScreen() {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  if (!isAuthenticated) {
    return <NutrioLogin />;
  }

  if (!isOnboarded) {
    return <NutrioPersonalization />;
  }

  return <NutrioHome />;
}
