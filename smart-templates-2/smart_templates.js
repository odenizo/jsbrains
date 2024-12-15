import { SmartSources } from "smart-sources";
/**
 * @class SmartTemplates
 * @extends SmartSources
 * @classdesc Manages a collection of SmartTemplate items. Integrates with `SmartTemplateOutputs` for handling generated outputs.
 *
 * @example
 * // Assuming `env` is an environment object with `smart_template_outputs` collection
 * const templates = env.smart_templates;
 * // list all template keys
 * console.log(templates.keys);
 */
export class SmartTemplates extends SmartSources {
  /**
   * Gets the template outputs collection associated with these templates.
   * @name outputs
   * @type {SmartTemplateOutputs}
   * @readonly
   * @description Returns the collection of outputs generated by these templates.
   *
   * @example
   * const outputs = env.smart_templates.outputs;
   */
  get outputs() {
    return this.env.smart_template_outputs;
  }
}
