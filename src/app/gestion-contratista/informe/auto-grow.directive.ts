import { afterNextRender, Directive, effect, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: 'textarea[appAutoGrow]',
  standalone: true,
})
export class AutoGrowDirective {
  // Receives the currently bound value so effect() tracks signal-driven changes
  // (e.g. ↑/↓ reordering updates the textarea value without a DOM input event).
  readonly appAutoGrow = input<string>('');

  private readonly el: HTMLTextAreaElement;

  constructor(ref: ElementRef<HTMLTextAreaElement>) {
    this.el = ref.nativeElement;

    // Initial resize after the first render, so pre-loaded content starts at the
    // correct height without waiting for the user to type.
    afterNextRender(() => this.resize());

    // Reactive resize on every signal-driven value change (reordering, external
    // updates) — covers any cause that doesn't fire a DOM input event.
    effect(() => {
      this.appAutoGrow(); // read to register tracking dependency
      this.resize();
    });
  }

  // Immediate resize while the user types — avoids waiting for the signal
  // round-trip through the parent component before the height updates.
  @HostListener('input')
  onInput(): void {
    this.resize();
  }

  private resize(): void {
    const el = this.el;
    el.style.height = 'auto';
    // scrollHeight excludes borders; (offsetHeight - clientHeight) = border-top +
    // border-bottom. With Tailwind's box-sizing: border-box reset, adding this
    // difference prevents the phantom scrollbar caused by setting height to
    // scrollHeight alone (which leaves the content area 2 px short of the border).
    el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
  }
}
