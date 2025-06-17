import { isString, isObject, isArrayOfType } from "../utils/typeChecks"

/**
 * @typedef {Object} LanguageId
 * @property {string} code - Language code (e.g., "en", "es")
 * @property {string} name - Language display name (e.g., "English", "Spanish")
 */

/**
 * @typedef {Object} LanguageConfig
 * @property {LanguageId} id - Language identifier object
 * @property {Object.<string, string>} translations - Key-value pairs of translations
 */

/**
 * Internationalization (i18n) class for managing multiple languages and translations
 * @example
 * const languages = [
 *   {
 *     id: { code: "en", name: "English" },
 *     translations: { hello: "Hello", goodbye: "Goodbye" }
 *   }
 * ];
 * const i18n = new i18n(languages);
 */
export default class i18n {
  /** @type {Object.<string, LanguageConfig>} Private languages storage */
  #languages = {}

  /**
   * Creates an i18n instance with the provided languages
   * @param {LanguageConfig[]} languages - Array of language configuration objects
   * @throws {Error} When languages array is invalid or no valid languages are provided
   */
  constructor(languages) {
    if(isArrayOfType(languages, "object")) {
      languages.forEach(language => {
        try {
          this.languagesAdd(language)
        } 
        catch (error) {
          // Silently ignore invalid language configs
        }
      });
      if (!Object.keys(this.#languages).length)
        throw new Error("Class i18n has no valid languages")
    }
    else
      throw new Error("Class i18n requires an array of language objects")
  }

  /**
   * Gets a copy of all registered languages
   * @returns {Object.<string, LanguageConfig>} Copy of languages object
   */
  get languages() { 
    return {...this.#languages} 
  }

  /**
   * Checks if a language is registered
   * @param {string} language - Language code to check
   * @returns {boolean} True if language exists, false otherwise
   */
  has(language) {
    // BUG: Parameter is 'language' but code uses 'id'
    return Object.keys(this.#languages).includes(language)
  }

  /**
   * Gets a specific language configuration
   * @param {string} id - Language code
   * @returns {LanguageConfig} Copy of the language configuration
   * @throws {Error} When language is not found
   */
  language(id) {
    if (!this.has(id))
      throw new Error(`Class i18n does not provide language ${String(id)}`)
    return {...this.#languages[id]}
  }

  /**
   * Translates a string key for a specific language
   * @param {string} lang - Language code
   * @param {string} str - Translation key
   * @returns {string|undefined} Translated string or undefined if not found
   */
  translate(lang, str) {
    return this.#languages[lang]?.translations?.[str]
  }

  /**
   * Adds a new language configuration
   * @param {LanguageConfig} config - Language configuration object
   * @throws {Error} When config is invalid
   */
  languagesAdd(config) {
    if (!isObject(config))       
      throw new Error("Class i18n expects a config object")
    if (!isObject(config?.id) || (!isString(config.id?.code)) || (!isString(config.id?.name)))
      throw new Error("Class i18n no valid config id {code, name}")
    if (!i18n.validateTranslations(config?.translations))
      throw new Error("Class i18n config translations are invalid")
    this.#languages[config.id.code] = config
  }

  /**
   * Validates translation object structure
   * @param {Object.<string, string>} trans - Translations object to validate
   * @returns {boolean} True if translations are valid
   * @throws {Error} When translations object is invalid
   * @static
   */
  static validateTranslations(trans) {
    if (!isObject(trans) || !Object.keys(trans).length)
      throw new Error("Class i18n no valid config translations object")
    return Object.values(trans).every((t) => isString(t))
  }
}
