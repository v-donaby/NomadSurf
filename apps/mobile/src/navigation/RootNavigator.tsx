import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import type { RootStackParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: Platform.select({
            ios: { backgroundColor: "transparent" },
            default: { backgroundColor: colors.bgScreen },
          }),
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: Platform.OS === "ios" ? "dark" : undefined,
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "800",
            fontSize: 17,
            color: colors.text,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bgScreen },
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
          options={{
            title: "Today’s pick",
            // Opaque header so scroll content (hero + map) never sits under the bar.
            headerTransparent: false,
            headerBlurEffect: undefined,
            headerStyle: { backgroundColor: colors.bgScreen },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
