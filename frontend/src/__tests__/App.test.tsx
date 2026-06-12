import { describe, test, expect } from '@jest/globals';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App component', () => {
  test('renders navigation logo', () => {
    render(<App />);
    const navLogo = screen.getByRole('link', { name: /antonela art/i });
    expect(navLogo).toBeInTheDocument();
  });

  test('renders footer brand', () => {
    render(<App />);
    const footerBrand = screen.getAllByText(/Antonela Art/);
    expect(footerBrand.length).toBeGreaterThanOrEqual(1);
  });
});
