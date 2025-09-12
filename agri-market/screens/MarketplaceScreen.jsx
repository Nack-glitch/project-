import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://192.168.8.123:5000/api";


export default function MarketplaceScreen({ navigation }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error.message);
      Alert.alert("Error", "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBuy = async (productId) => {
    const quantity = Number(quantities[productId] || 1);

    if (!user || user.role !== "client") {
      return Alert.alert("Unauthorized", "Only clients can buy products");
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return Alert.alert("Error", "Please enter a valid quantity");
    }

    try {
      const res = await axios.post(
        `${API_URL}/transactions/buy`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert(
        "Purchase Successful",
        `You bought ${res.data.quantity || quantity} of ${res.data.product.name}`,
        [
          { text: "OK", onPress: () => console.log("Alert closed") },
          { text: "View Transactions", onPress: () => navigation.navigate("Transaction") },
        ]
      );

      setQuantities({ ...quantities, [productId]: "" });
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to buy product");
    }
  };

  const renderItem = ({ item }) => (
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
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>Price: {item.price} ETB</Text>
        <Text style={styles.farmer}>Farmer: {item.farmer?.name || "Unknown"}</Text>

        {/* Show quantity input and Buy button only for clients */}
        {user.role === "client" && (
          <>
            <TextInput
              style={styles.quantityInput}
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantities[item._id]?.toString() || ""}
              onChangeText={(text) =>
                setQuantities({ ...quantities, [item._id]: text.replace(/[^0-9]/g, "") })
              }
            />
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => handleBuy(item._id)}
            >
              <Text style={styles.buyText}>Buy</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

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
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={{ justifyContent: "space-between" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#f0fdf4",
    minHeight: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImage: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
    height: 36,
  },
  price: {
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  farmer: {
    fontSize: 11,
    color: "#777",
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  buyBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  buyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
