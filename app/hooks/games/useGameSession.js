"use client";

import { useQuery } from '@tanstack/react-query';
import { gameSessionService } from '../../../services/client/gameSessionService';

export const useGameTopWinners = ({ gameId, limit = 3 } = {}) => {
    return useQuery({
        queryKey: ['gameTopWinners', gameId, limit],
        queryFn: async () => {
            const response = await gameSessionService.getTopWinners({ gameId, limit });
            return response?.data || [];
        },
        enabled: Boolean(gameId),
        retry: 1,
        staleTime: 1000 * 60,
    });
};
