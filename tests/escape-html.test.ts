import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../lib/escape-html';

describe('escapeHtml', () => {
  it('neutraliza tags HTML', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('neutraliza atributos/aspas que poderiam escapar de um atributo HTML', () => {
    expect(escapeHtml('" onmouseover="alert(1)')).toBe(
      '&quot; onmouseover=&quot;alert(1)'
    );
  });

  it('não altera texto comum sem caracteres especiais', () => {
    expect(escapeHtml('Dra. Marina Souza - (24) 99999-9999')).toBe(
      'Dra. Marina Souza - (24) 99999-9999'
    );
  });

  it('escapa & corretamente (sem dupla-escapar entidades já existentes)', () => {
    expect(escapeHtml('Clínica A & B')).toBe('Clínica A &amp; B');
  });
});
