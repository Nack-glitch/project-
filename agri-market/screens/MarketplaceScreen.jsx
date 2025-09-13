import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://192.168.8.123:5000/api";

export default function MarketplaceScreen({ onAuthRequired, onNavigate }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [popupMessages, setPopupMessages] = useState({});

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(Array.isArray(res.data) ? res.data.reverse() : []);
    } catch (error) {
      console.error("Failed to fetch products:", error.message);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error.message);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
    fetchProducts();
  };

  const showPopup = (productId, message) => {
    setPopupMessages((prev) => ({ ...prev, [productId]: message }));
    setTimeout(() => setPopupMessages((prev) => ({ ...prev, [productId]: "" })), 5000);
  };

  // Buy product
  const handleBuy = async (productId) => {
    const quantity = Number(quantities[productId] || 1);

    if (!user || user.role !== "client") {
      showPopup(productId, "Only clients can buy products");
      return;
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      showPopup(productId, "Enter a valid quantity");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/transactions/buy`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const boughtQty = res.data?.quantity ?? 0;
      const productUnit = res.data?.product?.unit ?? "Kg";
      showPopup(productId, `You bought ${boughtQty} ${productUnit}, check transaction`);

      setQuantities({ ...quantities, [productId]: "" });
      fetchProducts();
    } catch (error) {
      showPopup(productId, error.response?.data?.message || "Failed to buy product");
    }
  };

  // Render product card
  const renderItem = ({ item }) => {
    const lastTransaction = item.lastTransaction;
    const statusText =
      user?.role === "client"
        ? lastTransaction?.farmerName
          ? `Bought from ${lastTransaction.farmerName}`
          : ""
        : lastTransaction?.clientName
        ? `Sold to ${lastTransaction.clientName}`
        : "";

    const categoryName = categories.find((c) => c._id === item.category)?.name || item.category?.name;

    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {item.imageUrl ? (
            <Image
              source={{
                uri: item.imageUrl.includes("http")
                  ? item.imageUrl
                  : `http://192.168.8.123:5000${item.imageUrl}`,
              }}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Text>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.price}>
            Price: {item.price} ETB / {item.unit || "KG"}
          </Text>
          <Text style={styles.farmer}>Farmer: {item.farmer?.name}</Text>
          {categoryName && <Text style={styles.category}>Category: {categoryName}</Text>}
          <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
          {statusText !== "" && <Text style={styles.status}>{statusText}</Text>}

          {!user && (
            <TouchableOpacity style={styles.buyBtn} onPress={() => onAuthRequired && onAuthRequired()}>
              <Text style={styles.buyText}>Login to Buy</Text>
            </TouchableOpacity>
          )}

          {user?.role === "client" && item.quantity > 0 && (
            <>
              <TextInput
                style={styles.quantityInput}
                placeholder={`Quantity (${item.unit || "KG"})`}
                keyboardType="numeric"
                value={quantities[item._id]?.toString() || ""}
                onChangeText={(text) =>
                  setQuantities({ ...quantities, [item._id]: text.replace(/[^0-9]/g, "") })
                }
              />
              <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuy(item._id)}>
                <Text style={styles.buyText}>Buy</Text>
              </TouchableOpacity>
            </>
          )}

          {popupMessages[item._id] && (
            <View style={styles.popupOverlay}>
              <Text style={styles.popupOverlayText}>{popupMessages[item._id]}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={styles.noData}>No products found.</Text>}
      ListHeaderComponent={<Text style={styles.header}>Marketplace</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12, backgroundColor: "#f0fdf4", paddingHorizontal: 8 },
  header: { fontSize: 22, fontWeight: "700", color: "#16a34a", marginBottom: 12, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, width: "95%", marginBottom: 16, alignSelf: "center", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  imageWrapper: { width: "100%", height: 160, overflow: "hidden" },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  noImage: { backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: "700", color: "#16a34a", marginBottom: 4 },
  description: { fontSize: 12, color: "#555", marginBottom: 6, height: 36 },
  price: { fontWeight: "600", color: "#111", marginBottom: 4 },
  farmer: { fontSize: 11, color: "#777", marginBottom: 4 },
  category: { fontSize: 11, color: "#555", marginBottom: 4, fontStyle: "italic" },
  quantity: { fontSize: 11, color: "#777", marginBottom: 8 },
  quantityInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 8, textAlign: "center" },
  buyBtn: { backgroundColor: "#16a34a", paddingVertical: 8, borderRadius: 12, alignItems: "center", marginBottom: 6 },
  buyText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  noData: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" },
  status: { fontSize: 12, color: "#15803d", marginBottom: 4 },
  popupOverlay: { position: "absolute", top: 50, alignSelf: "center", backgroundColor: "#5acb25ff", borderRadius: 12, width: "80%", height: 100, justifyContent: "center", alignItems: "center", paddingHorizontal: 12, zIndex: 999 },
  popupOverlayText: { color: "#fff", fontSize: 14, textAlign: "center", fontWeight: "600" },
});
