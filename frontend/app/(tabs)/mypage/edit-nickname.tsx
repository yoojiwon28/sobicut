import { Text, View, StyleSheet } from 'react-native';

export default function EditNicknameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>닉네임 변경</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
