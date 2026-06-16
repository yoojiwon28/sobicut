import { Text, View, StyleSheet } from 'react-native';

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>카테고리별 소비</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
