import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://192.168.8.123:5000/api";

export default function TransactionScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const url =
        user?.role === "client"
          ? `${API_URL}/transactions/client`
          : `${API_URL}/transactions/farmer`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setTransactions(res.data ?? []);
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const renderItem = ({ item }) => {
    const createdDate = new Date(item?.createdAt).toLocaleString();

    return (
      <View style={styles.card}>
        <Text style={styles.product}>{item?.product?.name ?? "Unknown Product"}</Text>
        <Text>Quantity: {item?.quantity ?? 0}</Text>
        <Text>Total: {item?.totalAmount ?? 0} ETB</Text>
        {user?.role === "client" ? (
          <Text>Farmer: {item?.farmer?.name ?? "Unknown"}</Text>
        ) : (
          <Text>Client: {item?.client?.name ?? "Unknown"}</Text>
        )}
        <Text style={styles.status}>Status: {item?.status ?? "Pending"}</Text>
        <Text style={styles.date}>{createdDate}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 8 }}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item?._id ?? Math.random().toString()}
      renderItem={renderItem}
      contentContainerStyle={transactions.length ? styles.listContainer : styles.emptyContainer}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No transactions found.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: "#f0fdf4",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0fdf4",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  product: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 4,
  },
  status: {
    marginTop: 6,
    fontWeight: "600",
    color: "#15803d",
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#555",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
});
