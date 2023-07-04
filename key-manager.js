/**
 * Required library:
 * - https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.js
 */
const KeyManager = (function () {
    const privateData = new WeakMap();

    class Manager {
        constructor() {
            privateData.set(this, { encryptedKey: API_KEY_ENCRYPTED });
        }

        /**
         * @param {string} str
         * @param {string} pass
         * @returns {string}
         */
        static encrypt(str, pass) {
            return CryptoJS.AES.encrypt(str, pass).toString();
        }

        /**
         * @param {string} encrypted
         * @param {string} pass
         * @returns {string}
         */
        static decrypt(encrypted, pass) {
            return CryptoJS.AES.decrypt(encrypted, pass).toString(CryptoJS.enc.Utf8);
        }

        /**
         * @param {string} password
         * @returns {string}
         */
        static getKey(password) {
            const { encryptedKey } = privateData.get(new Manager());

            return this.decrypt(encryptedKey, password);
        }
    }

    return Manager;
})();
