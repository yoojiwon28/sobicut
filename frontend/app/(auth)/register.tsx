import { Text, View, StyleSheet } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입 (기본 정보)</Text>
      <Text style={styles.subtitle}>아이디 / 비밀번호 / 닉네임 / 약관</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8 },
});
