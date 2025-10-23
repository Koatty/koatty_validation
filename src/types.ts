/**
 * koatty_validation type definitions
 * @author richen
 * @copyright Copyright (c) - <richenlin(at)gmail.com>
 * @license MIT
 */

/**
 * Email validation options
 */
export interface IsEmailOptions {
  allow_display_name?: boolean;
  require_display_name?: boolean;
  allow_utf8_local_part?: boolean;
  require_tld?: boolean;
}

/**
 * URL validation options
 */
export interface IsURLOptions {
  protocols?: string[];
  require_tld?: boolean;
  require_protocol?: boolean;
  require_host?: boolean;
  require_valid_protocol?: boolean;
  allow_underscores?: boolean;
  host_whitelist?: (string | RegExp)[];
  host_blacklist?: (string | RegExp)[];
  allow_trailing_dot?: boolean;
  allow_protocol_relative_urls?: boolean;
  disallow_auth?: boolean;
}

/**
 * Hash algorithm type
 */
export type HashAlgorithm = "md4" | "md5" | "sha1" | "sha256" | "sha384" | "sha512"
  | "ripemd128" | "ripemd160" | "tiger128" | "tiger160" | "tiger192" | "crc32" | "crc32b";

  /**
   * Validation options
 */
export type ValidOtpions = { 
  message: string; 
  value: any; 
}; 

/**
 * Parameter type key constant
 */
export const PARAM_TYPE_KEY = 'PARAM_TYPE_KEY';