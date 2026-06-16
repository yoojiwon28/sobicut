import { Text, View, StyleSheet } from 'react-native';

export default function EditIncomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>소득 구간 변경</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
