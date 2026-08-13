import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from './ProductsPage';
import ProductService from '../services/ProductService';

vi.mock('../services/ProductService', () => ({
  default: {
    getProductsPaged: vi.fn(),
    searchProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, isAdmin: true }),
}));

const pageData = {
  data: {
    content: [
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
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
  },
};

function renderPage() {
  return render(
    <ProductsPage openAdd={false} setOpenAdd={() => {}} showToast={() => {}} />
  );
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ProductService.getProductsPaged.mockResolvedValue(pageData);
  });

  it('renders products from the API', async () => {
    renderPage();

    expect(await screen.findByText('iPhone 17 Pro')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S26 Ultra')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(ProductService.getProductsPaged).toHaveBeenCalledWith(0, 5, 'id', 'asc');
  });

  it('shows empty state when no products match', async () => {
    ProductService.getProductsPaged.mockResolvedValue({
      data: { content: [], totalElements: 0, totalPages: 0, number: 0 },
    });
    renderPage();

    expect(await screen.findByText('No products found')).toBeInTheDocument();
  });

  it('searches via the API when the keyword is typed', async () => {
    const user = userEvent.setup();
    ProductService.searchProducts.mockResolvedValue({
      data: { content: [pageData.data.content[0]], totalElements: 1, totalPages: 1, number: 0 },
    });
    renderPage();

    await user.type(screen.getByPlaceholderText(/Search by name/i), 'iPhone');

    await waitFor(() => {
      expect(ProductService.searchProducts).toHaveBeenCalledWith('iPhone', 0, 5, 'id', 'asc');
    });
  });
});