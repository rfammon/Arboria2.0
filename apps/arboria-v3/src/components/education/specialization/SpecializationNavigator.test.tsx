import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers as any);

import { SpecializationNavigator } from './SpecializationNavigator';

const MOCK_MODULES_UNLOCKED = {
    'ops': { id: 'ops', status: 'available', score: 0 },
    'risk': { id: 'risk', status: 'available', score: 0 },
    'pruning': { id: 'pruning', status: 'available', score: 0 },
};

import { MemoryRouter } from 'react-router-dom';

describe('SpecializationNavigator', () => {
    it('should show tracks when available', () => {
        render(
            <MemoryRouter>
                <SpecializationNavigator
                    modules={MOCK_MODULES_UNLOCKED as any}
                    onSelectTrack={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.queryByText('Especializações Bloqueadas')).toBeNull();
        expect(screen.getByText('Poda Especializada')).toBeTruthy();
        expect(screen.getByText('Operações de Risco')).toBeTruthy();
    });

    it('should trigger onSelectTrack when clicking a track', () => {
        const onSelect = vi.fn();
        render(
            <MemoryRouter>
                <SpecializationNavigator
                    modules={MOCK_MODULES_UNLOCKED as any}
                    onSelectTrack={onSelect}
                />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Poda Especializada'));
        expect(onSelect).toHaveBeenCalledWith('pruning');
    });
});
