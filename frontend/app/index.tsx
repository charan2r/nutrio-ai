import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { NutrioSplash } from "./splash/splash";
import { NutrioLogin } from "./login/nutrio-login";
import { NutrioPersonalization } from "./personalization/personalization";
import { NutrioHome } from "./home/home";

export default function HomeScreen() {
  const { isAuthenticated, isOnboarded, isLoading } = useAuthStore();
  const [showLogin, setShowLogin] = useState<boolean>(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#438e3b" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (!showLogin) {
      return (
        <NutrioSplash
          onGetStarted={() => setShowLogin(true)}
          onSignIn={() => setShowLogin(true)}
        />
      );
    }
    return <NutrioLogin onBackToSplash={() => setShowLogin(false)} />;
  }

  if (!isOnboarded) {
    return <NutrioPersonalization />;
  }

  return <NutrioHome />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7faf5',
  },
});
