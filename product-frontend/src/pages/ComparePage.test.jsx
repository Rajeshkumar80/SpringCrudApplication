import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparePage from './ComparePage';
import ProductService from '../services/ProductService';

vi.mock('../services/ProductService', () => ({
  default: {
    getAllProducts: vi.fn(),
    compareProducts: vi.fn(),
  },
}));

const products = [
  {
    id: 2, name: 'iPhone 17 Pro', brand: 'Apple', price: 132900,
    processor: 'Apple A19 Pro', ram: '12GB', storage: '256GB',
    battery: '4685mAh', camera: '48MP + 48MP + 48MP', display: '6.3" OLED',
    rating: 4.8, stock: 10, imageUrl: null,
  },
  {
    id: 3, name: 'Galaxy S26 Ultra', brand: 'Samsung', price: 139999,
    processor: 'Snapdragon 8 Elite', ram: '16GB', storage: '512GB',
    battery: '5500mAh', camera: '200MP', display: '6.8" LTPO AMOLED',
    rating: 4.9, stock: 7, imageUrl: null,
  },
];

const comparisonPayload = {
  data: {
    items: [
      {
        product: products[0],
        bestPrice: true, bestRating: false, bestBattery: false, bestOverall: false,
      },
      {
        product: products[1],
        bestPrice: false, bestRating: true, bestBattery: true, bestOverall: true,
      },
    ],
    bestOverallName: 'Galaxy S26 Ultra',
  },
};

describe('ComparePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ProductService.getAllProducts.mockResolvedValue({ data: products });
  });

  it('renders all product selection cards', async () => {
    render(<ComparePage />);

    await waitFor(() => {
      expect(screen.getByText('iPhone 17 Pro')).toBeInTheDocument();
      expect(screen.getByText('Galaxy S26 Ultra')).toBeInTheDocument();
    });
  });

  it('compare button is disabled until 2 products are selected', async () => {
    const user = userEvent.setup();
    render(<ComparePage />);

    const compareBtn = await screen.findByRole('button', { name: /compare/i });
    expect(compareBtn).toBeDisabled();

    await user.click(screen.getByText('iPhone 17 Pro'));
    expect(compareBtn).toBeDisabled();

    await user.click(screen.getByText('Galaxy S26 Ultra'));
    expect(compareBtn).toBeEnabled();
  });

  it('renders comparison table with best overall highlighted', async () => {
    const user = userEvent.setup();
    ProductService.compareProducts.mockResolvedValue(comparisonPayload);
    render(<ComparePage />);

    await user.click(await screen.findByText('iPhone 17 Pro'));
    await user.click(await screen.findByText('Galaxy S26 Ultra'));
    await user.click(screen.getByRole('button', { name: /compare/i }));

    expect(await screen.findByText('Best Overall: Galaxy S26 Ultra')).toBeInTheDocument();
    expect(screen.getByText('Specification')).toBeInTheDocument();
    expect(screen.getAllByText('Best Overall').length).toBeGreaterThan(0);
    expect(ProductService.compareProducts).toHaveBeenCalledWith([2, 3]);
  });

  it('prevents selecting a 4th product', async () => {
    const user = userEvent.setup();
    ProductService.getAllProducts.mockResolvedValue({
      data: [
        ...products,
        {
          id: 4, name: 'Galaxy Z Fold 7', brand: 'Samsung', price: 174999,
          processor: 'Snapdragon 8 Elite', ram: '12GB', storage: '1TB',
          battery: '4500mAh', camera: '50MP', display: '7.6" AMOLED',
          rating: 4.7, stock: 3, imageUrl: null,
        },
        {
          id: 5, name: 'OnePlus 13', brand: 'OnePlus', price: 69999,
          processor: 'Snapdragon 8 Elite', ram: '16GB', storage: '512GB',
          battery: '6000mAh', camera: '50MP + 50MP', display: '6.82" AMOLED',
          rating: 4.7, stock: 12, imageUrl: null,
        },
      ],
    });
    render(<ComparePage />);

    await user.click(await screen.findByText('iPhone 17 Pro'));
    await user.click(screen.getByText('Galaxy S26 Ultra'));
    await user.click(screen.getByText('Galaxy Z Fold 7'));
    await user.click(screen.getByText('OnePlus 13'));

    expect(await screen.findByText(/You can compare up to 3 products/i)).toBeInTheDocument();
  });
});