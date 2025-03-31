import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AppNavigation from "./src/navigations/AppNavigation";

const Stack = createBottomTabNavigator();
export default function App(){
    return(
        <AppNavigation/>
    )
}