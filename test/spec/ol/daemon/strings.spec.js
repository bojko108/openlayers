import { format, formatAttributes, formatObject } from '../../../../src/ol/daemon/helpers';

describe('String Formatters', function() {
  describe('Format string', function() {
    it('can format a string', function() {
      const template = '{0}: {1}';
      const prop = 'Foo';
      const val = 'Bar';
      const result = format(template, prop, val);

      expect(result).to.equal('Foo: Bar');
    });
    it('leftovers are removed', function() {
      const template = '{0}: {1}, {2}';
      const prop = 'Foo';
      const val = 'Bar';
      const result = format(template, prop, val);

      expect(result).to.equal('Foo: Bar, ');
    });
  });

  describe('Format Attributes', function() {
    it('can format attributes array', function() {
      const attributes = [
        { name: 'SJZ_STAN', value: 'STAN SJZ' },
        { name: 'C_DRUH_STAN', value: 'Трафопост' },
        { name: 'SYMBOL_ROTATION', value: 0 }
      ];
      const template = '{SJZ_STAN} - {C_DRUH_STAN} - {A} - {SYMBOL_ROTATION}';
      const result = formatAttributes(template, attributes);

      expect(result).to.equal('STAN SJZ - Трафопост -  - 0');
    });
    it('leftovers are not removed', function() {
      const attributes = [
        { name: 'SJZ_STAN', value: 'STAN SJZ' },
        { name: 'C_DRUH_STAN', value: 'Трафопост' },
        { name: 'SYMBOL_ROTATION', value: 0 }
      ];
      const template = '{SJZ_STAN} - {C_DRUH_STAN} - {A} - {SYMBOL_ROTATION}';
      const result = formatAttributes(template, attributes, false);

      expect(result).to.equal('STAN SJZ - Трафопост - {A} - 0');
    });
  });

  describe('Format Object', function() {
    it('can format object', function() {
      const feature = { test: 'Some Value' };
      const template = '{test} - {nonExistingProperty}';
      const result = formatObject(template, feature);

      expect(result).to.equal('Some Value - ');
    });
    it('leftovers are not removed', function() {
      const feature = { test: 'Some Value' };
      const template = '{test} - {nonExistingProperty}';
      const result = formatObject(template, feature, false);

      expect(result).to.equal('Some Value - {nonExistingProperty}');
    });
  });
});
