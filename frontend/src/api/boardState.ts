import type { BoardState } from '../types';

// ── fetchBoardState ──
// Fetches a single board state document by id from the backend.
// Called lazily by Board.tsx when a step with a boardStateId is entered.

export async function fetchBoardState(id: string): Promise<BoardState> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const res = await fetch(`${apiUrl}/board-states/${id}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch board state: ${id}`);
    }
    return res.json();
}