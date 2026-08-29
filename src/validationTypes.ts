/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  advice?: string;
  criticalCorrection?: string;
}
