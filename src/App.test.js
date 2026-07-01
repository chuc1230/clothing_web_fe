import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Clothing store title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Clothing store/i);
  expect(titleElement).toBeInTheDocument();
});
