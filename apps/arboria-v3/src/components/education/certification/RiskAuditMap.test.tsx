import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskAuditMap } from './RiskAuditMap';
import type { HazardZone } from './RiskAuditMap';

const MOCK_ZONES: HazardZone[] = [
    { id: 'z1', x: 10, y: 10, radius: 5, description: 'Broken Wire' },
    { id: 'z2', x: 50, y: 50, radius: 5, description: 'Slippery Floor' }
];

describe('RiskAuditMap', () => {
    it('should render the image container', () => {
        render(<RiskAuditMap zones={MOCK_ZONES} imageSrc="test.jpg" onComplete={vi.fn()} />);
        // The image itself might be hard to query if loaded via CSS or img tag, checking container presence
        const container = document.querySelector('.relative');
        expect(container).toBeTruthy();
    });

    it('should track found hazards', () => {
        const onComplete = vi.fn();
        render(<RiskAuditMap zones={MOCK_ZONES} imageSrc="test.jpg" onComplete={onComplete} />);

        const zone1 = screen.getByLabelText('Broken Wire');
        fireEvent.click(zone1);

        expect(screen.getByText(/Risco Encontrado/)).toBeTruthy();
        expect(screen.getByText(/Broken Wire/)).toBeTruthy();
    });

    it('should complete when all hazards are found', () => {
        const onComplete = vi.fn();
        render(<RiskAuditMap zones={MOCK_ZONES} imageSrc="test.jpg" onComplete={onComplete} />);

        fireEvent.click(screen.getByLabelText('Broken Wire'));
        fireEvent.click(screen.getByLabelText('Slippery Floor'));

        // After finding all, user clicks finish/continue
        fireEvent.click(screen.getByText('Concluir Auditoria'));

        expect(onComplete).toHaveBeenCalledWith(true);
    });
});
