;(function(factory){
    window.Base64 = factory();
})(function() {

    const _encode_table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const _decode_table = _initDecodeTable();

    function _initDecodeTable() {
        const table = {};
        for (let i = 0; i < _encode_table.length; i++) {
            table[_encode_table[i]] = i;
        }
        return table;
    }

    /**
     * Encode input data to Base64 string.
     * The input can be ArrayBuffer or TypedArray.
     *
     * @param input {ArrayBuffer|ArrayBufferView}
     * @returns {string|null}
     */
    function _standardEncode(input) {
        let source = null;
        if (input instanceof ArrayBuffer) {
            source = new Uint8Array(input);
        } else if (ArrayBuffer.isView(input)) {
            source = input instanceof Uint8Array ?
                input : new Uint8Array(input.buffer);
        }
        if (source === null) {
            return null;
        }
        // encoding
        const buffer = [];
        for (let i = 0; i < source.length; i += 3) {
            // source bytes
            let b1 = source[i];
            let b2 = (i + 1) < source.length ? source[i + 1] : -1;
            let b3 = (i + 2) < source.length ? source[i + 2] : -1;
            // encoded bytes
            let e1 = b1 >> 2;
            let e2 = (b1 & 0x03) << 4;
            let e3 = 64, e4 = 64;
            if (b2 >= 0) {
                e2 += b2 >> 4;
                e3 = (b2 & 0x0f) << 2;
            }
            if (b3 >= 0) {
                e3 += b3 >> 6;
                e4 = b3 & 0x3f;
            }
            buffer.push(
                _encode_table[e1], _encode_table[e2],
                _encode_table[e3], _encode_table[e4]
            )
        }
        return buffer.join('');
    }

    /**
     * Decode Base64 string into byte array.
     * @param input {string}
     * @returns {Uint8Array|null}
     */
    function _standardDecode(input) {
        const input_length = input.length;
        // Check input length
        if (input_length % 4 !== 0) {
            return null;
        }
        // Calculate output length
        let output_length = input_length / 4 * 3;
        if (input.charAt(input_length - 1) === '=') {
            output_length -= 1;
            if (input.charAt(input_length - 2) === '=') {
                output_length -= 1;
            }
        }
        // Decoding
        const buffer = new Uint8Array(output_length);
        for (let i = 0; i < input_length / 4; ++i) {
            let e1 = _decode_table[input.charAt(i * 4)];
            let e2 = _decode_table[input.charAt(i * 4 + 1)];
            let e3 = _decode_table[input.charAt(i * 4 + 2)];
            let e4 = _decode_table[input.charAt(i * 4 + 3)];

            buffer[i * 3] = (e1 << 2) + (e2 >> 4)
            if (e3 < 64) {
                buffer[i * 3 + 1] = (e2 << 4) + (e3 >> 2);
            }
            if (e4 < 64) {
                buffer[i * 3 + 2] = (e3 << 6) + e4;
            }
        }
        return buffer;
    }

    return {
        stdEncode: _standardEncode,
        stdDecode: _standardDecode
    }

});
