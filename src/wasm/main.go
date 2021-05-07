// +build js
// +build wasm

package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"os"
	"syscall/js"
)

var (
	errInvalidRsaKey = errors.New("invalid RSA key")
)

func isUint8Array(value js.Value) bool {
	if value.IsNull() || value.IsUndefined() || value.Type() != js.TypeObject {
		return false
	}
	cont := value.Get("constructor")
	if cont.IsNull() || cont.IsUndefined() || cont.Type() != js.TypeFunction {
		return false
	}
	name := cont.Get("name").String()
	return name == "Uint8Array" || name == "Uint8ClampedArray"
}

func JsClassRsaWasm(this js.Value, args []js.Value) interface{} {
	// When JS caller calls this function without "new", "this"
	// will be undefined, then we do nothing and simply return nil.
	if this.IsUndefined() {
		return nil
	}

	// "console.log" wrapper
	console := js.Global().Get("console")
	logging := func(msg string) {
		console.Call("log", "[RsaWasm] " + msg)
	}
	// Uint8Array class
	classU8Array := js.Global().Get("Uint8Array")

	// Private fields
	var privKey *rsa.PrivateKey
	var pubKey *rsa.PublicKey

	// Method functions
	funcLoadKey := func(this js.Value, args []js.Value) interface{} {
		// Reset private key and public key
		privKey, pubKey = nil, nil
		// Do nothing
		if len(args) == 0 {
			return false
		}
		pemDate := []byte(args[0].String())
		if block, _ := pem.Decode(pemDate); block != nil {
			err := error(nil)
			key, ok := interface{}(nil), false
			switch block.Type {
			case "RSA PRIVATE KEY":
				privKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
			case "RSA PUBLIC KEY":
				pubKey, err = x509.ParsePKCS1PublicKey(block.Bytes)
			case "PRIVATE KEY":
				key, err = x509.ParsePKCS8PrivateKey(block.Bytes)
				if privKey, ok = key.(*rsa.PrivateKey); !ok {
					err = errInvalidRsaKey
				}
			case "PUBLIC KEY":
				key, err = x509.ParsePKIXPublicKey(block.Bytes)
				if pubKey, ok = key.(*rsa.PublicKey); !ok {
					err = errInvalidRsaKey
				}
			}
			if err != nil {
				logging("Parse DER error: " + err.Error())
			}
			return err == nil
		} else {
			logging("Illegal pem data!")
			return false
		}
	}
	funcHasPrivate := func(this js.Value, args []js.Value) interface{} {
		return privKey != nil
	}
	funcEncrypt := func(this js.Value, args []js.Value) interface{} {
		if (privKey == nil && pubKey == nil) || len(args) == 0 {
			return nil
		}
		// Read plaintext
		src := args[0]
		if !isUint8Array(src) {
			return nil
		}
		// Select public key
		encryptKey := pubKey
		if pubKey == nil {
			encryptKey = (privKey.Public()).(*rsa.PublicKey)
		}
		// Copy plaintext from JS
		plainSize := src.Length()
		plaintext := make([]byte, plainSize)
		js.CopyBytesToGo(plaintext, src)
		// Encrypt
		blockSize, ciphertext := encryptKey.Size() - 11, make([]byte, 0)
		for offset := 0; offset < plainSize; offset += blockSize {
			sliceSize := blockSize
			if offset + sliceSize > plainSize {
				sliceSize = plainSize - offset
			}
			block, err := rsa.EncryptPKCS1v15(
				rand.Reader, encryptKey, plaintext[offset:offset+sliceSize])
			if err != nil {
				logging("Encrypt error: " + err.Error())
				return nil
			} else {
				ciphertext = append(ciphertext, block...)
			}
		}
		// Copy ciphertext to JS
		result := classU8Array.New(len(ciphertext))
		js.CopyBytesToJS(result, ciphertext)
		return result
	}
	funcDecrypt := func(this js.Value, args []js.Value) interface{} {
		if privKey == nil || len(args) == 0 {
			logging("No private key or args!")
			return nil
		}
		src := args[0]
		if !isUint8Array(src) {
			logging("Source is not Uint8Array!")
			return nil
		}
		// Copy ciphertext from JS
		cipherSize := src.Length()
		ciphertext := make([]byte, cipherSize)
		js.CopyBytesToGo(ciphertext, src)
		// Decrypt block by block
		blockSize, plaintext := privKey.Size(), make([]byte, 0)
		for offset := 0; offset < cipherSize; offset += blockSize {
			sliceSize := blockSize
			if offset + sliceSize > cipherSize {
				sliceSize = cipherSize - offset
			}
			block, err := rsa.DecryptPKCS1v15(
				rand.Reader, privKey, ciphertext[offset:offset+sliceSize])
			if err != nil{
				logging("Decrypt error: " + err.Error())
				return nil
			} else {
				plaintext = append(plaintext, block...)
			}
		}
		// Copy plain to JS
		result := classU8Array.New(len(plaintext))
		js.CopyBytesToJS(result, plaintext)
		return result
	}

	// Export methods
	this.Set("loadKey", js.FuncOf(funcLoadKey))
	this.Set("hasPrivate", js.FuncOf(funcHasPrivate))
	this.Set("encrypt", js.FuncOf(funcEncrypt))
	this.Set("decrypt", js.FuncOf(funcDecrypt))

	return nil
}

func main() {
	ch := make(chan struct{}, 1)

	global := js.Global()
	// Register class
	global.Set("RsaWasm", js.FuncOf(JsClassRsaWasm))
	// Call callback function
	if argc := len(os.Args); argc > 1 {
		callback := global.Get(os.Args[1])
		if callback.Type() == js.TypeFunction {
			callback.Invoke()
		}
	}

	<-ch
}