/**
 * Outline-style action button variants for table action columns.
 * Semantic color follows intent: crimson = primary action,
 * neutral = read-only view, danger = destructive / reversal.
 *
 * Components that need min-w (solicitudes, supervisor, ordenador) define
 * their own full literal to avoid runtime string concatenation.
 */

export const OUTLINE_CRIMSON_BTN =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-[#731514] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

export const OUTLINE_NEUTRAL_BTN =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-900 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 transition-colors duration-150 hover:bg-gray-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

export const OUTLINE_DANGER_BTN =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-[#930E10] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#930E10] transition-colors duration-150 hover:bg-[#930E10]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#930E10]';
