import { Text, View, StyleSheet } from 'react-native';

export default function MypageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
