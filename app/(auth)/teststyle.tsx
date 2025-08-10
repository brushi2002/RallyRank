import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default function StyleTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This should be white text on a red background
      </Text>
    </View>
  );
}