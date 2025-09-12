
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://192.168.8.123:5000/api";
const { width } = Dimensions.get("window");

export default function MarketplaceScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      if (!user || user.role !== "client") {
        return Alert.alert("Unauthorized", "Only clients can buy products");
      }

      const res = await axios.post(
        `${API_URL}/transactions/buy`,
        { productId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert(
        "Success",
        `You bought ${res.data.quantity || 1} of ${res.data.product.name}`
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to buy product"
      );
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
        <Text style={styles.farmer}>
          Farmer: {item.farmer?.name || "Unknown"}
        </Text>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => handleBuy(item._id)}
        >
          <Text style={styles.buyText}>Buy</Text>
        </TouchableOpacity>
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
      contentContainerStyle={styles.container}
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
    height: 200,
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
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
    height: 40,
  },
  price: {
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  farmer: {
    fontSize: 12,
    color: "#777",
    marginBottom: 12,
  },
  buyBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  buyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
