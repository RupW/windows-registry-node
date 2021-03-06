/* global describe, it, before */
'use strict';
require('./test_helper');
var assert = require('assert'),
    windef = require('../index').windef,
    Key = require('../index').Key;

describe('Key Open Tests', () => {
    it('Should create a key given a subkey', () => {
        var key = new Key(windef.HKEY.HKEY_CLASSES_ROOT, '.txt', windef.KEY_ACCESS.KEY_READ);
        assert(key.handle !== null && key.handle !== undefined);
        key.close();
    });

    it('Should open a subkey provided a previously opened key', () => {
        var key = new Key(windef.HKEY.HKEY_CLASSES_ROOT, '', windef.KEY_ACCESS.KEY_READ);
        var key2 = key.openSubKey('.txt', windef.KEY_ACCESS.KEY_READ);
        assert(key2.handle !== null && key2.handle !== undefined);
        key.close();
        key2.close();
    });

    it('Should properly close', () => {
        var key = new Key(windef.HKEY.HKEY_CLASSES_ROOT, '.txt', windef.KEY_ACCESS.KEY_READ);
        key.close();

        // ensure that the key is actually closed by trying to open a subkey
        // which should fail
        assert.throws(() => {
            key.openSubKey('OpenWithList', windef.KEY_ACCESS.KEY_READ);
        });
    });
});

describe('Create Key Tests', function () {
    before(() => {
        // We perform all testing that modifies the registry under HKCU\Software\windows-registry-node.
        // Ensure this exists.
        var key = new Key(windef.HKEY.HKEY_CURRENT_USER, 'Software', windef.KEY_ACCESS.KEY_READ);
        try {
            key.createSubKey('windows-registry-node', windef.KEY_ACCESS.KEY_ALL_ACCESS);
        }
        catch (error) {
            console.log('Error creating test environment root key');
            throw error;
        }
    });

    it('Should create a new key and Delete it', () => {
        var key = new Key(windef.HKEY.HKEY_CURRENT_USER, 'Software\\windows-registry-node', windef.KEY_ACCESS.KEY_ALL_ACCESS);

        assert(key.handle !== undefined);
        assert(key.handle !== null);

        var createdKey = key.createSubKey('\test_key_name', windef.KEY_ACCESS.KEY_ALL_ACCESS);

        assert(createdKey.handle !== undefined);
        assert(createdKey.handle !== null);
        assert(createdKey.path === '\test_key_name');

        createdKey.deleteKey();

        assert.throws(() => {
            key.openSubKey('\test_key_name', windef.KEY_ACCESS.KEY_READ);
        }, (err) => {
            assert(err.indexOf('ERROR_FILE_NOT_FOUND') > -1);
            return true;
        });

        key.close();
    });
});

describe('Set / Query Value Tests', function () {
    before(() => {
        // We perform all testing that modifies the registry under HKCU\Software\windows-registry-node.
        // Ensure this exists.
        var key = new Key(windef.HKEY.HKEY_CURRENT_USER, 'Software', windef.KEY_ACCESS.KEY_READ);
        try {
            key.createSubKey('windows-registry-node', windef.KEY_ACCESS.KEY_ALL_ACCESS);
        }
        catch (error) {
            console.log('Error creating test environment root key');
            throw error;
        }
    });

    it('Should set and read REG_SZ Value', () => {
        var key = new Key(windef.HKEY.HKEY_CURRENT_USER, 'Software\\windows-registry-node', windef.KEY_ACCESS.KEY_ALL_ACCESS);

        assert(key.handle !== null && key.handle !== undefined);

        key.setValue('test_value_name', windef.REG_VALUE_TYPE.REG_SZ, 'test_value');

        var value = key.getValue('test_value_name');

        assert.equal(value, 'test_value');

        key.deleteValue('test_value_name');
        key.close();
    });
});
