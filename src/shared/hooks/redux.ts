/**
 * Типизированные Redux хуки
 * Используются вместо обычных useDispatch и useSelector для type safety
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';

// Типизированный useDispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// Типизированный useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
