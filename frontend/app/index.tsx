import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/auth-store";
import { NutrioLogin } from "./login/nutrio-login";
import { Button } from "@/components/ui/button";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <NutrioLogin />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6 py-8 justify-between">
      <View className="items-center mt-12">
        <View className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 items-center justify-center mb-4 shadow-sm">
          <MaterialCommunityIcons name="leaf" size={44} color="#10B981" />
        </View>

        <Text className="text-3xl font-extrabold text-zinc-900 text-center">
          Nutrio <Text className="text-emerald-600">AI</Text>
        </Text>
        <Text className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mt-1">
          Authenticated Session
        </Text>

        <View className="w-full bg-zinc-50 border border-zinc-200 rounded-3xl p-6 mt-8 shadow-sm">
          <Text className="text-sm font-medium text-zinc-500">Logged in as:</Text>
          <Text className="text-lg font-bold text-zinc-900 mt-1">
            {user?.email || "Guest User"}
          </Text>
          {user?.isGuest && (
            <Text className="text-xs text-amber-600 font-medium mt-1">
              (Guest Preview Mode)
            </Text>
          )}
        </View>
      </View>

      <View className="gap-3 mb-6">
        <Button
          title="Log Out"
          variant="secondary"
          onPress={logout}
          className="border-zinc-300 bg-zinc-100"
          textClassName="text-zinc-800"
        />
      </View>
    </SafeAreaView>
  );
}
