import React from 'react';
import { render } from '@testing-library/react-native';
import HelloWave from '../HelloWave';
console.log('HelloWave:', HelloWave);

test('renders correctly', () => {
  const { getByText } = render(<HelloWave />);
  expect(getByText('Hello, Wave!')).toBeTruthy();
});