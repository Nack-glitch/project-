
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
  Picker
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://192.168.8.123:5000/api"; 

const DashboardScreen = ({ navigation }) => {
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

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const endpoint = user.role === "farmer" ? "/transactions/farmer" : "/transactions/client";
      const res = await axios.get(API_URL + endpoint, config);
      setTransactions(res.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      if (error.response?.status === 401) {
        Alert.alert("Unauthorized", "Please login again");
        logout();
        navigation.replace("Auth");
      }
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
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };


  const handleAddProduct = async () => {
    if (!name || !quantity || !price || !category) {
      return Alert.alert("Error", "Please fill all fields and select a category");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("quantity", quantity);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("farmer", user._id);
    if (image) {
      formData.append("imageUrl", {
        uri: image,
        name: "product.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      await axios.post(API_URL + "/products", formData, config);
      Alert.alert("Success", "Product added successfully");

      // Reset form
      setName("");
      setDescription("");
      setQuantity("");
      setPrice("");
      setImage(null);
      setCategory("");
      setShowAddForm(false);

      fetchTransactions();
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert("Error", "Failed to add product");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user?.name}</Text>
          {user.role === "farmer" && user.farmName && <Text>{user.farmName}</Text>}
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            navigation.replace("Auth"); // Navigate back to login
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {user.role === "farmer" && (
        <View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(!showAddForm)}>
            <Text style={styles.addBtnText}>{showAddForm ? "Cancel" : "+ Add Product"}</Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                >
                  <Picker.Item label="Select Category" value="" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Text style={styles.imageBtnText}>{image ? "Change Image" : "Pick Image"}</Text>
              </TouchableOpacity>
              {image && <Text>Image selected </Text>}

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
                <Text style={styles.submitBtnText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <Text style={styles.title}>Transactions:</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : transactions.length === 0 ? (
        <Text>No transactions found.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>Product: {item.productName || item.name}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text>Total: ${item.total}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  welcome: { fontSize: 20, fontWeight: "bold" },
  logoutBtn: { padding: 8 },
  logoutText: { color: "red", fontWeight: "bold" },
  addBtn: { backgroundColor: "green", padding: 12, borderRadius: 8, marginBottom: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  form: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
  imageBtn: { backgroundColor: "orange", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  imageBtnText: { color: "#fff", fontWeight: "bold" },
  submitBtn: { backgroundColor: "blue", padding: 12, borderRadius: 8, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "bold" },
  title: { fontSize: 18, marginBottom: 10 },
  item: { padding: 10, borderWidth: 1, borderColor: "#ccc", marginVertical: 5, borderRadius: 8 },
});

export default DashboardScreen;
