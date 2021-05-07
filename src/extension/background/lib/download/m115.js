;(function (factory){
    window.M115 = factory();
})(function (){

    const _XOR_KEY_DATA = new Uint8Array([
        0xf0, 0xe5, 0x69, 0xae, 0xbf, 0xdc, 0xbf, 0x5a, 0x1a, 0x45, 0xe8, 0xbe, 0x7d, 0xa6, 0x73, 0x88,
        0xde, 0x8f, 0xe7, 0xc4, 0x45, 0xda, 0x86, 0x94, 0x9b, 0x69, 0x92, 0x0b, 0x6a, 0xb8, 0xf1, 0x7a,
        0x38, 0x06, 0x3c, 0x95, 0x26, 0x6d, 0x2c, 0x56, 0x00, 0x70, 0x56, 0x9c, 0x36, 0x38, 0x62, 0x76,
        0x2f, 0x9b, 0x5f, 0x0f, 0xf2, 0xfe, 0xfd, 0x2d, 0x70, 0x9c, 0x86, 0x44, 0x8f, 0x3d, 0x14, 0x27,
        0x71, 0x93, 0x8a, 0xe4, 0x0e, 0xc1, 0x48, 0xae, 0xdc, 0x34, 0x7f, 0xcf, 0xfe, 0xb2, 0x7f, 0xf6,
        0x55, 0x9a, 0x46, 0xc8, 0xeb, 0x37, 0x77, 0xa4, 0xe0, 0x6b, 0x72, 0x93, 0x7e, 0x51, 0xcb, 0xf1,
        0x37, 0xef, 0xad, 0x2a, 0xde, 0xee, 0xf9, 0xc9, 0x39, 0x6b, 0x32, 0xa1, 0xba, 0x35, 0xb1, 0xb8,
        0xbe, 0xda, 0x78, 0x73, 0xf8, 0x20, 0xd5, 0x27, 0x04, 0x5a, 0x6f, 0xfd, 0x5e, 0x72, 0x39, 0xcf,
        0x3b, 0x9c, 0x2b, 0x57, 0x5c, 0xf9, 0x7c, 0x4b, 0x7b, 0xd2, 0x12, 0x66, 0xcc, 0x77, 0x09, 0xa6,
    ]);

    const _XOR_KEY = new Uint8Array([
        0x42, 0xda, 0x13, 0xba, 0x78, 0x76, 0x8d, 0x37, 0xe8, 0xee, 0x04, 0x91
    ]);

    /** PKCS#1 Server public key
     * @private
     * @type {string}
     */
    const _SERVER_PUBLIC_KEY = `-----BEGIN RSA PUBLIC KEY-----
MIGJAoGBANHetaZ5idEKXAsEHRGrR2Wbwys+ZakvkjbdLMIUCg2klfoOfvh19vrL
TZgfXl47peZ4Ed1zt6QQUlQiL6zCBqdOiREhVFGv/PXr/eiHvJrbZ1wCqDX3XL53
pgOvggaD9DnnztQokyPfnJBVdp4VeYuUU+iQWLPi4/GGsHsEapltAgMBAAE=
-----END RSA PUBLIC KEY-----`;

    /**
     * PKCS#1 Client private key
     * @private
     * @type {string}
     */
    const _CLIENT_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCMgUJLwWb0kYdW6feyLvqgNHmwgeYYlocst8UckQ1+waTOKHFC
TVyRSb1eCKJZWaGa08mB5lEu/asruNo/HjFcKUvRF6n7nYzo5jO0li4IfGKdxso6
FJIUtAke8rA2PLOubH7nAjd/BV7TzZP2w0IlanZVS76n8gNDe75l8tonQQIDAQAB
AoGANwTasA2Awl5GT/t4WhbZX2iNClgjgRdYwWMI1aHbVfqADZZ6m0rt55qng63/
3NsjVByAuNQ2kB8XKxzMoZCyJNvnd78YuW3Zowqs6HgDUHk6T5CmRad0fvaVYi6t
viOkxtiPIuh4QrQ7NUhsLRtbH6d9s1KLCRDKhO23pGr9vtECQQDpjKYssF+kq9iy
A9WvXRjbY9+ca27YfarD9WVzWS2rFg8MsCbvCo9ebXcmju44QhCghQFIVXuebQ7Q
pydvqF0lAkEAmgLnib1XonYOxjVJM2jqy5zEGe6vzg8aSwKCYec14iiJKmEYcP4z
DSRms43hnQsp8M2ynjnsYCjyiegg+AZ87QJANuwwmAnSNDOFfjeQpPDLy6wtBeft
5VOIORUYiovKRZWmbGFwhn6BQL+VaafrNaezqUweBRi1PYiAF2l3yLZbUQJAf/nN
4Hz/pzYmzLlWnGugP5WCtnHKkJWoKZBqO2RfOBCq+hY4sxvn3BHVbXqGcXLnZPvo
YuaK7tTXxZSoYLEzeQJBAL8Mt3AkF1Gci5HOug6jT4s4Z+qDDrUXo9BlTwSWP90v
wlHF+mkTJpKd5Wacef0vV+xumqNorvLpIXWKwxNaoHM=
-----END RSA PRIVATE KEY-----`;

    const _encoder = new TextEncoder();
    const _decoder = new TextDecoder();

    /**
     * Generate a key with given |seed| in length of |length|.
     *
     * @private
     * @param seed {ArrayBufferLike|ArrayBufferView}
     * @param length {number}
     * @returns {Uint8Array}
     */
    function _xorGetKey(seed, length) {
        const result = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            result[i] = ((seed[i] + _XOR_KEY_DATA[length * i]) & 0xff)
                ^ _XOR_KEY_DATA[length * (length - i - 1)];
        }
        return result;
    }

    /**
     * Do XOR Encoding on the |data| array.
     *
     * @private
     * @param data {Uint8Array}
     * @param key {ArrayBuffer|Uint8Array}
     */
    function _xorEncode(data, key) {
        const dataSize = data.length;
        const keySize = key.byteLength;

        const mod = dataSize % 4;
        if (mod !== 0) {
            for (let i = 0; i < mod; ++i) {
                data[i] ^= key[i % keySize];
            }
        }
        for (let i = mod; i < dataSize; ++i) {
            data[i] ^= key[(i - mod) % keySize];
        }
    }

    class _M115 {

        constructor() {
            this.encryptor = new RsaWasm();
            if( !this.encryptor.loadKey(_SERVER_PUBLIC_KEY) ) {
                console.warn('Load public key failed!');
            }

            this.decryptor = new RsaWasm();
            if( !this.decryptor.loadKey(_CLIENT_PRIVATE_KEY) ) {
                console.warn('Load private key failed!');
            }
        }

        /**
         * Generate key
         * @returns {Uint8Array}
         */
        generateKey() {
            const key = new Uint8Array(16);
            window.crypto.getRandomValues(key);
            return key;
        }

        /**
         * Encode data
         * @param input {string}
         * @param key {Uint8Array}
         * @returns {String}
         */
        encode(input, key) {
            // Convert string to bytes
            const data = _encoder.encode(input)

            // Encrypt round 1
            _xorEncode(data, _xorGetKey(key, 4));
            data.reverse();
            _xorEncode(data, _XOR_KEY)

            // Assembly key and data
            const buf = new Uint8Array(data.length + 16);
            buf.set(key.slice(0, 16), 0);
            buf.set(data, 16);

            // Encrypt round 2
            return Base64.stdEncode(
                this.encryptor.encrypt(buf)
            );
        }


        /**
         * Decode data
         * @param input {string}
         * @param key {Uint8Array}
         */
        decode(input, key) {
            // Decrypt round 2
            const buf = this.decryptor.decrypt(
                Base64.stdDecode(input)
            );

            // Separate key and data
            const serverKey = buf.slice(0, 16);
            const data = buf.slice(16);

            // Decrypt round 1
            _xorEncode(data, _xorGetKey(serverKey, 12));
            data.reverse();
            _xorEncode(data, _xorGetKey(key, 4));

            return _decoder.decode(data);
        }
    }

    return _M115;

});
