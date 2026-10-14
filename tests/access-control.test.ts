import { describe, it, expect } from 'vitest';
import { isTechnicianForbidden } from '../lib/access-control';

describe('isTechnicianForbidden', () => {
  it('permite o tecnico dono da OS/laudo', () => {
    expect(isTechnicianForbidden('tecnico', 'user-1', 'user-1')).toBe(false);
  });

  it('bloqueia o tecnico mexer na OS/laudo de OUTRO tecnico (achado real da auditoria)', () => {
    expect(isTechnicianForbidden('tecnico', 'user-2', 'user-1')).toBe(true);
  });

  it('bloqueia o tecnico numa OS/laudo ainda sem atribuicao', () => {
    expect(isTechnicianForbidden('tecnico', null, 'user-1')).toBe(true);
  });

  it('nunca bloqueia admin, independente do dono', () => {
    expect(isTechnicianForbidden('admin', 'user-2', 'user-1')).toBe(false);
  });

  it('nunca bloqueia gerente, independente do dono', () => {
    expect(isTechnicianForbidden('gerente', 'user-2', 'user-1')).toBe(false);
  });
});
