import { Text, View, StyleSheet } from 'react-native';

export default function AnalysisDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>소비 분석 상세</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
