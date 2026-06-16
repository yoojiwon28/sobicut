import { Text, View, StyleSheet } from 'react-native';

export default function EditProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필 편집</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
