import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { RootTabParamList } from "./types";
import { HomeScreen } from "../screens/buyer/HomeScreen";
import { SellerNavigator } from "./SellerNavigator";
import { colors } from "../theme";

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 2 },
          tabBarStyle: {
            height: 64,
            paddingTop: 7,
            paddingBottom: 7,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Discover",
            tabBarIcon: ({ color, size }) => <Feather name="compass" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Sell"
          component={SellerNavigator}
          options={{
            title: "Sell",
            tabBarIcon: ({ color, size }) => <Feather name="shopping-bag" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
