/**
 * TemplateEngine Utility
 * Handles mapping of user profile data and editable fields to template JSON placeholders.
 */

export const templateEngine = {
  /**
   * Resolves the value for a placeholder based on user project state and profile.
   * @param {string} key - The placeholder key (e.g., {{business_name}})
   * @param {object} userData - User business profile data
   * @param {object} fieldValues - Current values of editable fields in the editor
   */
  resolvePlaceholder: (key, userData, fieldValues) => {
    // Check if it's an editable field first
    if (fieldValues && fieldValues[key]) {
      return fieldValues[key];
    }

    // Otherwise check business profile
    const mapping = {
      '{{business_name}}': userData.business_name,
      '{{phone_number}}': userData.phone_number,
      '{{gst_number}}': userData.gst_number,
      '{{logo}}': userData.logo,
      '{{owner_name}}': userData.owner_name,
      '{{website}}': userData.website,
    };

    return mapping[key] || '';
  },

  /**
   * Processes a template layout and returns a list of elements with resolved values.
   */
  processLayout: (layout, userData, fieldValues) => {
    return layout.map(element => {
      const resolvedValue = element.placeholderKey 
        ? templateEngine.resolvePlaceholder(element.placeholderKey, userData, fieldValues)
        : null;

      return {
        ...element,
        resolvedValue
      };
    });
  }
};
