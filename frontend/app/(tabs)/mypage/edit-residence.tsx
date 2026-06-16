import { Text, View, StyleSheet } from 'react-native';

export default function EditResidenceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>거주 형태 변경</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
