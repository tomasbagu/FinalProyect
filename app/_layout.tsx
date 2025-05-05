import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext"; // Importación agregada

export default function Layout() {
    return (
        <AuthProvider> 
                <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );

}