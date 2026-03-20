import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { ResultScreen } from "../screens/ResultScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0c1a24" },
          headerTintColor: "#e8f4ff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#0c1a24" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "NomadSurf", headerShown: false }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: "Today’s pick" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
