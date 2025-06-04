import React from 'react';
import { View, Text } from 'react-native';
import { render } from '@testing-library/react-native';

const Dummy = () => (
  <View>
    <Text>Hello, Wave!</Text>
  </View>
);

test('renders correctly', () => {
  const { getByText } = render(<Dummy />);
  expect(getByText('Hello, Wave!')).toBeTruthy();
});