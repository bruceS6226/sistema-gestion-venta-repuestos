import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { login, loginSuccess, loginFailure } from './login.actions.action';
import { UsuarioService } from '../services/usuario.service';

@Injectable()
export class LoginEffects {
    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType('[Login] User Login'),
            switchMap(({ email, password }) =>
                this._repuestoService.login(email, password).pipe(
                    map(response => loginSuccess({ token: response.token, email: response.email, roles: response.roles })),
                    catchError(error => of(loginFailure({ error })))
                )
            )
        )
    );

    constructor(private actions$: Actions, private _repuestoService: UsuarioService) { }
}
