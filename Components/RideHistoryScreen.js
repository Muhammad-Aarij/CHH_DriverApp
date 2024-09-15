import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const RideHistoryScreen = () => {
  const [rideHistory, setRideHistory] = useState([
    // Example history, replace with Firebase ride data
    { id: '1', date: '2024-09-01', distance: '5 km', status: 'Completed' },
    { id: '2', date: '2024-09-02', distance: '8 km', status: 'Cancelled' },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.text}>Date: {item.date}</Text>
      <Text style={styles.text}>Distance: {item.distance}</Text>
      <Text style={styles.text}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rideHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  item: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default RideHistoryScreen;
