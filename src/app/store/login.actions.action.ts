import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Login] User Login',
  props<{ email: string, password: string }>()
);

export const loginSuccess = createAction(
  '[Login] Login Success',
  props<{ token: string, email: string, roles: string[] }>()
);

export const loginFailure = createAction(
  '[Login] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');
