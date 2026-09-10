import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'info';
  requireObservation?: boolean;
  observationPlaceholder?: string;
}

export interface ConfirmResult {
  confirmed: boolean;
  observation?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _visible = signal(false);
  private readonly _options = signal<ConfirmDialogOptions | null>(null);
  private _resolve: ((result: ConfirmResult) => void) | null = null;

  readonly visible = this._visible.asReadonly();
  readonly options = this._options.asReadonly();

  confirm(options: ConfirmDialogOptions): Promise<ConfirmResult> {
    this._options.set(options);
    this._visible.set(true);
    return new Promise<ConfirmResult>((resolve) => {
      this._resolve = resolve;
    });
  }

  _complete(result: ConfirmResult): void {
    this._visible.set(false);
    this._options.set(null);
    this._resolve?.(result);
    this._resolve = null;
  }
}
