import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminHeader from './Header';
import { useAuth } from '../../../constants/AuthContext';

jest.mock('../../../constants/AuthContext');

const mockLogout = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('AdminHeader', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            user: { username: 'admin' },
            logout: mockLogout,
        });
        jest.clearAllMocks();
    });

    test('renders page title and avatar', () => {
        render(
            <BrowserRouter>
                <AdminHeader pageTitle="DASHBOARD" />
            </BrowserRouter>
        );
        expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
        expect(screen.getByLabelText('user')).toBeInTheDocument();
    });

    test('shows dropdown and logout when avatar clicked', () => {
        render(
            <BrowserRouter>
                <AdminHeader pageTitle="DASHBOARD" />
            </BrowserRouter>
        );
        const avatar = screen.getByLabelText('user');
        fireEvent.click(avatar);
        expect(screen.getByText('Logout')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Logout'));
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('shows Sign In link when no user', () => {
        useAuth.mockReturnValue({ user: null, logout: mockLogout });
        render(
            <BrowserRouter>
                <AdminHeader pageTitle="DASHBOARD" />
            </BrowserRouter>
        );
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
});
