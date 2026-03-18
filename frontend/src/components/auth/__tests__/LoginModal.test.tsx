import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../.././../test/utils';
import LoginModal from '../LoginModal';
import { Role } from '../../../types';

vi.mock('../../../services/api', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn().mockRejectedValue(new Error('no session')),
    logout: vi.fn(),
  },
  authEvents: new EventTarget(),
  setCsrfToken: vi.fn(),
  favoritesService: { getAll: vi.fn().mockResolvedValue([]) },
}));

describe('LoginModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen=true', () => {
    renderWithProviders(<LoginModal isOpen onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen=false', () => {
    renderWithProviders(<LoginModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls login and onClose on successful submit', async () => {
    const user = userEvent.setup();
    const { authService } = await import('../../../services/api');
    vi.mocked(authService.login).mockResolvedValue({ user: { id: '1', email: 'a@b.de', role: Role.USER, createdAt: '' } });

    renderWithProviders(<LoginModal isOpen onClose={onClose} />);

    // Labels show i18n keys since i18n isn't loaded in tests
    await user.type(screen.getByLabelText(/loginPage\.email/i), 'a@b.de');
    await user.type(screen.getByLabelText(/loginPage\.password/i), 'secret');
    await user.click(screen.getByRole('button', { name: /auth\.login/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows error on failed login', async () => {
    const user = userEvent.setup();
    const { authService } = await import('../../../services/api');
    vi.mocked(authService.login).mockRejectedValue(new Error('invalid'));

    renderWithProviders(<LoginModal isOpen onClose={onClose} />);

    await user.type(screen.getByLabelText(/loginPage\.email/i), 'a@b.de');
    await user.type(screen.getByLabelText(/loginPage\.password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /auth\.login/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
