import { createReducer, on } from '@ngrx/store';
import { login, loginSuccess, loginFailure, logout } from './login.actions.action';

export interface State {
  token: string;
  email: string;
  roles: string[];
  error: string;
  isLoading: boolean;
}

const initialState: State = {
  token: '',
  email: '',
  roles: [],
  error: '',
  isLoading: false
};

export const loginReducer = createReducer(initialState,
  on(login, state => ({ ...state, isLoading: true })),
  on(loginSuccess, (state, { token, email, roles }) => ({ ...state, token, email, roles, isLoading: false })),
  on(loginFailure, (state, { error }) => ({ ...state, error, isLoading: false })),
  on(logout, () => initialState),
);
