/**
 * koatty_validation 类型定义
 * @author richen
 * @copyright Copyright (c) - <richenlin(at)gmail.com>
 * @license MIT
 */

/**
 * 邮箱验证选项
 */
export interface IsEmailOptions {
  allow_display_name?: boolean;
  require_display_name?: boolean;
  allow_utf8_local_part?: boolean;
  require_tld?: boolean;
}

/**
 * URL验证选项
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
 * 哈希算法类型
 */
export type HashAlgorithm = "md4" | "md5" | "sha1" | "sha256" | "sha384" | "sha512"
  | "ripemd128" | "ripemd160" | "tiger128" | "tiger160" | "tiger192" | "crc32" | "crc32b";

/**
 * 验证选项
 */
export type ValidOtpions = { 
  message: string; 
  value: any; 
}; 