import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-4">
          <View className="flex-1 items-center justify-center bg-white">
              <Text className="text-xl font-bold text-blue-500">
                Welcome to Nativewind!
              </Text>
          </View>
          <Text className="text-4xl font-bold text-white text-center">
            Nutrio AI
          </Text>         
        </View>       
      </ScrollView>
    </SafeAreaView>
  );
}
