import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RepoStatusBadge from '../../components/repo/RepoStatusBadge';

describe('RepoStatusBadge', () => {
  it('renders ready badge', () => {
    render(<RepoStatusBadge status="ready" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders parsed badge', () => {
    render(<RepoStatusBadge status="parsed" />);
    expect(screen.getByText('Parsed')).toBeInTheDocument();
  });

  it('renders error badge', () => {
    render(<RepoStatusBadge status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders cloning badge', () => {
    render(<RepoStatusBadge status="cloning" />);
    expect(screen.getByText('Cloning')).toBeInTheDocument();
  });

  it('renders parsing badge', () => {
    render(<RepoStatusBadge status="parsing" />);
    expect(screen.getByText('Parsing')).toBeInTheDocument();
  });

  it('renders unknown status with fallback', () => {
    render(<RepoStatusBadge status="unknown-status" />);
    expect(screen.getByText('Unknown-status')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<RepoStatusBadge status="ready" />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('bg-green');
  });
});
