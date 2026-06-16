import { Text, View, StyleSheet } from 'react-native';

export default function AnalysisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 소비 분석</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
