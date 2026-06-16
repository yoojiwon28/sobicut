import { Text, View, StyleSheet } from 'react-native';

export default function RegisterProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입 (추가 정보)</Text>
      <Text style={styles.subtitle}>거주 형태 / 소득 구간</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8 },
});
