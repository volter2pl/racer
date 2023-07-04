/**
 * Required library:
 * - https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.js
 */
const AblyKeyManager = (function () {
    const privateData = new WeakMap();

    class Manager {
        constructor() {
            privateData.set(this, {
                encryptedKey:
                    'U2FsdGVkX1/aPE9V/GpjBzY55JU' +
                    'nSwgl9XyO9pKqne5ILoGnm7Wt72' +
                    'x82ODC+Bit4mNbqMKbqc8aiQoIE' +
                    'cDxfaoPBEpv59sJUjYSIav0lt0='
            });
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
