
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://192.168.8.123:5000/api"; 
export default function AuthScreen({ onNavigate, onClose }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({ phoneNumber: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "client",
    farmName: "",
    location: "",
  });

  const handleLogin = async () => {
    const { phoneNumber, password } = loginData;
    if (!phoneNumber || !password) return Alert.alert("Error", "Please fill all fields");

    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginData);
      const { token, role, ...userData } = res.data;

      await login({ ...userData, role, token });

      if (onNavigate) onNavigate("dashboard");
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      Alert.alert("Login Failed", err.response?.data?.message || "Error");
    }
  };

  const handleRegister = async () => {
    let { name, phoneNumber, password, confirmPassword, role, farmName, location } = registerData;

    name = name?.trim();
    phoneNumber = phoneNumber?.trim();
    password = password?.trim();
    confirmPassword = confirmPassword?.trim();
    farmName = farmName?.trim();
    location = location?.trim();

    if (!name || !phoneNumber || !password) return Alert.alert("Error", "Please fill all required fields");
    if (password !== confirmPassword) return Alert.alert("Error", "Passwords do not match");
    if (role === "farmer" && (!farmName || !location)) return Alert.alert("Error", "Please provide farm details");

    try {
      const res = await axios.post(`${API_URL}/auth/register`, registerData);
      const { token, role: userRole, ...userData } = res.data;

      await login({ ...userData, role: userRole, token });

      if (onNavigate) onNavigate("dashboard");
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      Alert.alert("Register Failed", err.response?.data?.message || "Error");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AgriMarket 🌱</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, isLogin && styles.activeTab]} onPress={() => setIsLogin(true)}>
            <Text style={isLogin ? styles.activeTabText : styles.tabText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, !isLogin && styles.activeTab]} onPress={() => setIsLogin(false)}>
            <Text style={!isLogin ? styles.activeTabText : styles.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {isLogin ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={loginData.phoneNumber}
                onChangeText={(text) => setLoginData({ ...loginData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={loginData.password}
                onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity onPress={() => setIsLogin(true)} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back to Login</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.userTypeButton, registerData.role === "client" && styles.userTypeActive]}
                  onPress={() => setRegisterData({ ...registerData, role: "client" })}
                >
                  <Text style={registerData.role === "client" ? styles.userTypeTextActive : styles.userTypeText}>
                    🛒 Client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.userTypeButton, registerData.role === "farmer" && styles.userTypeActive]}
                  onPress={() => setRegisterData({ ...registerData, role: "farmer" })}
                >
                  <Text style={registerData.role === "farmer" ? styles.userTypeTextActive : styles.userTypeText}>
                    🚜 Farmer
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={registerData.name}
                onChangeText={(v) => setRegisterData({ ...registerData, name: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={registerData.phoneNumber}
                onChangeText={(v) => setRegisterData({ ...registerData, phoneNumber: v })}
                keyboardType="phone-pad"
              />
              {registerData.role === "farmer" && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Farm Name"
                    value={registerData.farmName}
                    onChangeText={(v) => setRegisterData({ ...registerData, farmName: v })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={registerData.location}
                    onChangeText={(v) => setRegisterData({ ...registerData, location: v })}
                  />
                </>
              )}
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={registerData.password}
                onChangeText={(v) => setRegisterData({ ...registerData, password: v })}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChangeText={(v) => setRegisterData({ ...registerData, confirmPassword: v })}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  container: { backgroundColor: "#fff", borderRadius: 10, padding: 16, maxHeight: "90%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "green" },
  tabContainer: { flexDirection: "row", marginBottom: 16, borderRadius: 8, backgroundColor: "#f0f0f0" },
  tab: { flex: 1, padding: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "white" },
  tabText: { color: "gray", fontWeight: "500" },
  activeTabText: { color: "green", fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  button: { backgroundColor: "green", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  userTypeButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ccc", alignItems: "center" },
  userTypeActive: { backgroundColor: "green", borderColor: "green" },
  userTypeText: { color: "gray", fontWeight: "500" },
  userTypeTextActive: { color: "white", fontWeight: "bold" },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "green", fontWeight: "bold" },
});
