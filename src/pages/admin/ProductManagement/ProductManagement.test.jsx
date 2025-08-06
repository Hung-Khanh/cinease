import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductManagement from './ProductManagement';
import axios from '../../../constants/axios';

jest.mock('../../../constants/axios');

const mockProducts = [
  {
    productId: 1,
    productName: 'Popcorn',
    category: 'FOOD',
    price: 50000,
    stockQuantity: 10,
    image: 'popcorn.jpg',
    status: 'ACTIVE',
    description: 'Tasty popcorn',
  },
  {
    productId: 2,
    productName: 'Coke',
    category: 'BEVERAGE',
    price: 30000,
    stockQuantity: 20,
    image: '',
    status: 'INACTIVE',
    description: 'Refreshing drink',
  },
];

describe('ProductManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockProducts });
  });

  it('renders products table', async () => {
    render(<ProductManagement />);
    await waitFor(() => {
      expect(screen.getByText('Popcorn')).toBeInTheDocument();
      expect(screen.getByText('Coke')).toBeInTheDocument();
      expect(screen.getByText('FOOD')).toBeInTheDocument();
      expect(screen.getByText('BEVERAGE')).toBeInTheDocument();
      expect(screen.getAllByText((content) => /ACTIVE/i.test(content)).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText((content) => /INACTIVE/i.test(content)).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens add modal and submits new product', async () => {
    render(<ProductManagement />);
    // Click the header Add button (first occurrence)
    fireEvent.click(screen.getAllByText('Add New Product')[0].closest('button'));
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getAllByText('Add New Product').length).toBeGreaterThan(1);
    });
    // Debug: log all input placeholders in the modal
    const inputs = document.querySelectorAll('input');
    // eslint-disable-next-line no-console
    console.log('Input placeholders:', Array.from(inputs).map(i => i.placeholder));
    // Fill form fields
    fireEvent.change(screen.getByPlaceholderText('Enter product name'), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByPlaceholderText('Enter product price'), { target: { value: '100000' } });
    fireEvent.change(screen.getByPlaceholderText('Enter product stock quantity'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('Enter product description (optional)'), { target: { value: 'Description' } });
    // Select category
    fireEvent.mouseDown(screen.getByText('Select Category'));
    fireEvent.click(screen.getByText('Food'));
    axios.post.mockResolvedValue({ data: 'Added successfully' });
    const form = document.querySelector('.product-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it('opens edit modal and submits update', async () => {
    render(<ProductManagement />);
    await waitFor(() => screen.getByText('Popcorn'));
    const editBtn = document.querySelector('.edit-btn');
    fireEvent.click(editBtn);
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Enter product name'), { target: { value: 'Popcorn Updated' } });
    axios.put.mockResolvedValue({ data: 'Updated successfully' });
    const form = document.querySelector('.product-form');
    fireEvent.submit(form);
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

  it('opens delete confirmation and deletes product', async () => {
    render(<ProductManagement />);
    await waitFor(() => screen.getByText('Popcorn'));
    const deleteBtn = document.querySelector('.delete-btn');
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    axios.delete.mockResolvedValue({ data: 'Deleted successfully' });
    fireEvent.click(screen.getByText('Delete Product'));
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
  });
});
