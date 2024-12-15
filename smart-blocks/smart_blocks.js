import { SmartEntities } from "smart-entities";
import { get_markdown_links } from "smart-sources/utils/get_markdown_links.js";
import { get_line_range } from "smart-sources/utils/get_line_range.js";
import { markdown_to_blocks } from "smart-sources/blocks/markdown_to_blocks.js";

/**
 * @class SmartBlocks
 * @extends SmartEntities
 * @classdesc Manages a collection of SmartBlock entities, providing embedding and utility functions specific to blocks.
 */
export class SmartBlocks extends SmartEntities {
  /**
   * Initializes the SmartBlocks instance. Currently muted as processing is handled by SmartSources.
   * @returns {void}
   */
  init() { /* mute */ }

  /**
   * @method import_source
   * @description Imports blocks for a given source by parsing the content. Delegates parsing to a parser
   * depending on the source.file_type (e.g., markdown_to_blocks for .md).
   * @async
   * @param {SmartSource} source The source whose blocks are to be imported.
   * @param {string} content The raw content of the source file.
   * @returns {Promise<void>}
   */
  async import_source(source, content) {
    let blocks_obj = markdown_to_blocks(content);
    
    const blocks = [];
    for (const [sub_key, line_range] of Object.entries(blocks_obj)) {
      // if (sub_key === '#' || sub_key.startsWith('#---frontmatter')) continue;
      const block_key = source.key + sub_key;
      const block_content = get_line_range(content, line_range[0], line_range[1]);
      const block_outlinks = get_markdown_links(block_content);
      const block_data = {
        key: block_key,
        lines: line_range,
        size: block_content.length,
        outlinks: block_outlinks,
      };
      blocks.push(this.create_or_update(block_data));
    }
    await Promise.all(blocks);
    this.clean_and_update_source_blocks(source, blocks_obj);
  }

  /**
   * Remove blocks that are no longer present in the parsed block data.
   * This ensures that after re-importing a source, stale blocks are cleaned up.
   * 
   * @param {SmartSource} source - The source that was re-imported.
   * @param {Object} blocks_obj - The newly parsed blocks object.
   */
  clean_and_update_source_blocks(source, blocks_obj) {
    const current_block_keys = new Set(Object.keys(blocks_obj).map(sk => source.key + sk));
    // for (const key of Object.keys(this.items)) {
    //   if (key.startsWith(source.key) && !current_block_keys.has(key)) {
    //     // This block no longer exists, mark it deleted
    //     const block = this.get(key);
    //     if (block) {
    //       block.deleted = true;
    //       block.queue_save(); 
    //       // Will remove embeddings & data on next save (AJSON updated by SmartSources)
    //     }
    //   }
    // }
    const blocks = source.blocks;
    for(let i = 0; i < blocks.length; i++){
      if(!current_block_keys.has(blocks[i].key)){
        blocks[i].deleted = true;
        blocks[i].queue_save(); 
      }
    }
    // Update source data with new blocks
    source.data.blocks = blocks_obj;
  }




  /**
   * Retrieves the embedding model associated with the SmartSources collection.
   * @readonly
   * @returns {Object|undefined} The embedding model instance or `undefined` if not set.
   */
  get embed_model() { return this.source_collection?.embed_model; }

  /**
   * Retrieves the embedding model key from the SmartSources collection.
   * @readonly
   * @returns {string|undefined} The embedding model key or `undefined` if not set.
   */
  get embed_model_key() { return this.source_collection?.embed_model_key; }

  /**
   * Calculates the expected number of blocks based on the SmartSources collection.
   * @readonly
   * @returns {number} The expected count of blocks.
   */
  get expected_blocks_ct() { return Object.values(this.source_collection.items).reduce((acc, item) => acc += Object.keys(item.data.blocks || {}).length, 0); }

  /**
   * Retrieves the notices system from the environment.
   * @readonly
   * @returns {Object} The notices object.
   */
  get notices() { return this.env.smart_connections_plugin?.notices || this.env.main?.notices; }

  /**
   * Retrieves the settings configuration for SmartBlocks.
   * @readonly
   * @returns {Object} The settings configuration object.
   */
  get settings_config() {
    return this.process_settings_config({
      "embed_blocks": {
        name: 'Embed Blocks',
        type: "toggle",
        description: "Embed blocks using the embedding model.",
        default: true,
      },
      ...super.settings_config,
    });
  }
  render_settings(container, opts = {}) {
    return this.render_collection_settings(container, opts);
  }

  /**
   * Retrieves the SmartChange instance from SmartSources.
   * @readonly
   * @returns {SmartChange|undefined} The SmartChange instance or `undefined` if not enabled.
   */
  get smart_change() { return this.env.smart_sources.smart_change; }

  /**
   * Retrieves the SmartSources collection instance.
   * @readonly
   * @returns {SmartSources} The SmartSources collection.
   */
  get source_collection() { return this.env.smart_sources; }

  /**
   * Processes the save queue by delegating to the SmartSources collection.
   * @async
   * @returns {Promise<void>}
   */
  async process_save_queue() {
    await this.source_collection.process_save_queue();
  }

  /**
   * Processes the embed queue. Currently handled by SmartSources, so this method is muted.
   * @async
   * @returns {Promise<void>}
   */
  async process_embed_queue() {
    // await this.source_collection.process_embed_queue();
  }

  /**
   * Processes the load queue. Currently muted as processing is handled by SmartSources.
   * @async
   * @returns {Promise<void>}
   */
  async process_load_queue() { /* mute */ }

  // TEMP: Methods in sources not implemented in blocks

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async prune() { throw "Not implemented: prune"; }

  /**
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {void}
   */
  build_links_map() { throw "Not implemented: build_links_map"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async refresh() { throw "Not implemented: refresh"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async search() { throw "Not implemented: search"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async import_file() { throw "Not implemented: import_file"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async run_data_load() { throw "Not implemented: run_data_load"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async run_import() { throw "Not implemented: run_import"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async run_refresh() { throw "Not implemented: run_refresh"; }

  /**
   * @async
   * @throws {Error} Throws an error indicating the method is not implemented.
   * @returns {Promise<void>}
   */
  async run_force_refresh() { throw "Not implemented: run_force_refresh"; }
}