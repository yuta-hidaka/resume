import { describe, it, expect } from 'bun:test';
import { downloadStatus, stripThinking } from '../format';

describe('stripThinking', () => {
  it('removes a full <think>…</think> block', () => {
    expect(stripThinking('<think>let me reason</think>Yuta is an engineer.')).toBe('Yuta is an engineer.');
  });
  it('removes generated reasoning that ends with </think> (opener eaten by the template)', () => {
    expect(stripThinking('reasoning about the question </think>\n\nHe uses Go and Kafka.')).toBe(
      'He uses Go and Kafka.',
    );
  });
  it('drops an unclosed / truncated <think> tail', () => {
    expect(stripThinking('日髙さんはGoエンジニアです。<think>then rambling forever')).toBe('日髙さんはGoエンジニアです。');
  });
  it('leaves normal text untouched', () => {
    expect(stripThinking('日髙さんはGoエンジニアです。')).toBe('日髙さんはGoエンジニアです。');
  });
});

describe('downloadStatus', () => {
  it('shows pct, size, and rate (1 decimal below 10 MB/s)', () => {
    expect(downloadStatus('読み込み中', 45, 230e6, 500e6, 8.3e6)).toBe(
      '読み込み中 45% · 230/500 MB · 8.3 MB/s',
    );
  });
  it('rounds MB/s to whole numbers at ≥10', () => {
    expect(downloadStatus('Loading', 50, 250e6, 500e6, 24.6e6)).toBe('Loading 50% · 250/500 MB · 25 MB/s');
  });
  it('omits size when total is unknown, and rate when zero/absent', () => {
    expect(downloadStatus('Loading', 10, 5e6, 0, 0)).toBe('Loading 10%');
    expect(downloadStatus('Loading', 10)).toBe('Loading 10%');
  });
  it('clamps the percentage to 0–100', () => {
    expect(downloadStatus('L', 130)).toBe('L 100%');
    expect(downloadStatus('L', -5)).toBe('L 0%');
  });
});
