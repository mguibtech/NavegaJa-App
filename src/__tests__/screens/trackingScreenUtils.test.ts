import {
  FALLBACK_COORDS,
  TRACKING_POLL_INTERVAL_MS,
  getCityCoords,
  getErrorMessage,
  getTrackingStatusBgColor,
  getTrackingStatusColor,
  getTrackingStatusLabel,
  normalizeCoords,
  parseCoord,
} from '../../screens/app/passenger/TrackingScreen/trackingScreenUtils';

describe('trackingScreenUtils', () => {
  it('keeps the expected polling interval', () => {
    expect(TRACKING_POLL_INTERVAL_MS).toBe(15000);
  });

  it('resolves city coordinates with accent-insensitive matching', () => {
    expect(getCityCoords('Manaus - AM')).toEqual(FALLBACK_COORDS);
    expect(getCityCoords('São Gabriel da Cachoeira')).toEqual({
      latitude: -0.1303,
      longitude: -67.0892,
    });
    expect(getCityCoords('Cidade inexistente')).toEqual(FALLBACK_COORDS);
  });

  it('parses and normalizes coordinate values', () => {
    expect(parseCoord(-3.12, 0)).toBe(-3.12);
    expect(parseCoord('-60,0217', 0)).toBeCloseTo(-60.0217);
    expect(parseCoord('invalid', 10)).toBe(10);

    expect(
      normalizeCoords('1,25', '2.5', {latitude: 0, longitude: 0}),
    ).toEqual({
      latitude: 1.25,
      longitude: 2.5,
    });
  });

  it('maps tracking status labels and tokens', () => {
    expect(getTrackingStatusLabel('scheduled')).toBe('Aguardando Partida');
    expect(getTrackingStatusLabel('in_transit')).toBe('Em Transito');
    expect(getTrackingStatusColor('boarding')).toBe('warning');
    expect(getTrackingStatusColor('cancelled')).toBe('danger');
    expect(getTrackingStatusBgColor('arrived')).toBe('successBg');
  });

  it('returns readable error messages when possible', () => {
    expect(getErrorMessage(new Error('falhou'), 'fallback')).toBe('falhou');
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
