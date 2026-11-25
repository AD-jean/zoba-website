import { describe, it, expect } from 'vitest';
import {
  normalizePath, referrerHost, deviceFromUserAgent, isBot, visitorHash, countryFrom
} from '../src/services/analytics.service';

describe('analytics.service', () => {
  it('normalise les chemins et masque les segments secrets', () => {
    expect(normalizePath('/galerie?x=1#top')).toBe('/galerie');
    expect(normalizePath('/billet/ABC123SECRET')).toBe('/billet');
    expect(normalizePath('/dons/retour/665f0c0c0c0c0c0c0c0c0c0c')).toBe('/dons/retour');
    expect(normalizePath('/contact/')).toBe('/contact');
    expect(normalizePath('/admin')).toBeNull();
    expect(normalizePath('https://ailleurs.test/')).toBeNull();
  });

  it('reduit le referrer a son domaine et ignore le site lui-meme', () => {
    expect(referrerHost('https://www.facebook.com/post/1?fbclid=x', ['zoba.test'])).toBe('facebook.com');
    expect(referrerHost('https://zoba.test/activites', ['zoba.test'])).toBeUndefined();
    expect(referrerHost('pas une url', [])).toBeUndefined();
  });

  it('classe les appareils et ecarte les robots', () => {
    expect(deviceFromUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile')).toBe('mobile');
    expect(deviceFromUserAgent('Mozilla/5.0 (iPad; CPU OS 17_0)')).toBe('tablet');
    expect(deviceFromUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('desktop');
    expect(isBot('Googlebot/2.1')).toBe(true);
    expect(isBot('')).toBe(true);
  });

  it("produit une empreinte qui change chaque jour et ne contient pas l'IP", () => {
    const a = visitorHash('203.0.113.7', 'UA', '2026-11-24');
    expect(a).toHaveLength(32);
    expect(a).not.toContain('203.0');
    expect(visitorHash('203.0.113.7', 'UA', '2026-11-24')).toBe(a);
    expect(visitorHash('203.0.113.7', 'UA', '2026-11-25')).not.toBe(a);
  });

  it("deduit le pays de l'en-tete ou du fuseau horaire", () => {
    expect(countryFrom('FR', 'Africa/Lome')).toBe('FR');
    expect(countryFrom(undefined, 'Africa/Lome')).toBe('TG');
    expect(countryFrom('XX', 'Inconnu/Zone')).toBeUndefined();
  });
});
