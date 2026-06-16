import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CalendarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>지출 상세</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8 },
});
