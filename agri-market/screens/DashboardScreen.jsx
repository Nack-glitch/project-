import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

const API_URL = "http://192.168.8.123:5000/api";

const DashboardScreen = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");

  const [messages, setMessages] = useState([]);

  const showMessage = (text, type = "info") => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setMessages((prev) => prev.filter((msg) => msg.id !== id)), 5000);
  };

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const endpoint = user.role === "farmer" ? "/transactions/farmer" : "/transactions/client";
      const res = await axios.get(API_URL + endpoint, config);
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(sorted);
    } catch (error) {
      console.error(error.response?.data || error.message);
      showMessage("Failed to fetch transactions", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(API_URL + "/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error.response?.data || error.message);
      showMessage("Failed to fetch categories", "error");
    }
  }, []);

  useEffect(() => {
    if (user) fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories, user]);

  const onRefresh = () => {
    setRefreshing(true);
    if (user) fetchTransactions();
    fetchCategories();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleAddProduct = async () => {
    if (!user || user.role !== "farmer") return;

    if (!name || !quantity || !price || !category) {
      return showMessage("Please fill all fields and select a category", "error");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("quantity", quantity);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("farmer", user._id);

    if (image) {
      const localUri = image.startsWith("file://") ? image : "file://" + image;
      formData.append("imageUrl", {
        uri: localUri,
        name: "product.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" },
      };
      await axios.post(API_URL + "/products", formData, config);
      showMessage("Product added successfully", "success");

      setName(""); setDescription(""); setQuantity(""); setPrice(""); setImage(null); setCategory(""); setShowAddForm(false);
      fetchTransactions();
    } catch (error) {
      console.error(error.response?.data || error.message);
      showMessage("Failed to add product", "error");
    }
  };

  const renderTransaction = ({ item }) => {
    const farmerName = item.farmer?.name || "Unknown Farmer";
    const clientName = item.client?.name || "Unknown Client";
    const statusText = user?.role === "client"
      ? `Bought from ${farmerName}`
      : `Sold to ${clientName}`;

    // Display image from backend correctly
    const imageUri = item.product?.imageUrl
      ? item.product.imageUrl.startsWith("http") 
        ? item.product.imageUrl
        : `http://192.168.8.123:5000${item.product.imageUrl}`
      : null;

    return (
      <View style={styles.item}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        ) : (
          <Text style={{ marginBottom: 5 }}>No image</Text>
        )}
        <Text style={styles.productText}>Product: {item.product?.name || "N/A"}</Text>
        <Text>Quantity: {item.quantity} {item.product?.unit || ""}</Text>
        <Text>Price: {item.product?.price || 0} ETB</Text>
        <Text>Total: {item.totalAmount || 0} ETB</Text>
        <Text style={styles.status}>{statusText}</Text>
      </View>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#16a34a" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.messageContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.message, { backgroundColor: msg.type === "error" ? "#f87171" : "#34d399" }]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderTransaction}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={<Text style={styles.noData}>No transactions found.</Text>}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.welcome}>Welcome, {user?.name || "Guest"}</Text>
              {user && (
                <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); onNavigate?.("auth"); }}>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>

            {user?.role === "farmer" && (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(!showAddForm)}>
                <Text style={styles.addBtnText}>{showAddForm ? "Cancel" : "+ Add Product"}</Text>
              </TouchableOpacity>
            )}

            {showAddForm && user?.role === "farmer" && (
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
                <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                <TextInput style={styles.input} placeholder="Price (ETB)" value={price} onChangeText={setPrice} keyboardType="numeric" />

                <View style={styles.pickerContainer}>
                  <Picker selectedValue={category} onValueChange={setCategory}>
                    <Picker.Item label="Select Category" value="" />
                    {categories.map((cat) => <Picker.Item key={cat._id} label={cat.name} value={cat._id} />)}
                  </Picker>
                </View>

                <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                  <Text style={styles.imageBtnText}>{image ? "Change Image" : "Pick Image"}</Text>
                </TouchableOpacity>

                {image && <Text>Image selected</Text>}

                <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                  <Text style={styles.submitBtnText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.title}>Transactions:</Text>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 20 },
  welcome: { fontSize: 20, fontWeight: "bold", color: "#16a34a" },
  logoutBtn: { padding: 8 },
  logoutText: { color: "red", fontWeight: "bold" },
  addBtn: { backgroundColor: "green", padding: 12, borderRadius: 8, marginBottom: 12, alignItems: "center", marginHorizontal: 20 },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  form: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginHorizontal: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
  imageBtn: { backgroundColor: "orange", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  imageBtnText: { color: "#fff", fontWeight: "bold" },
  submitBtn: { backgroundColor: "blue", padding: 12, borderRadius: 8, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#16a34a", marginHorizontal: 20 },
  noData: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" },
  item: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10, backgroundColor: "#fff", marginHorizontal: 20 },
  productText: { fontWeight: "bold", color: "#16a34a", marginBottom: 4 },
  status: { marginTop: 4, fontWeight: "600", color: "#15803d" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageContainer: { paddingHorizontal: 20, marginBottom: 10 },
  message: { padding: 10, borderRadius: 8, marginBottom: 5 },
  messageText: { color: "#fff", fontWeight: "bold" },
  productImage: { width: 100, height: 100, borderRadius: 8, marginBottom: 5 },
});

export default DashboardScreen;
