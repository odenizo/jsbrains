import { TestSmartCollectionAdapter } from '../../smart-collections/adapters/_test.js';
import { TestSmartFsAdapter } from '../../smart-fs/adapters/_test.js';
import { TestSourceAdapter } from '../adapters/_test.js';
import { MarkdownSourceAdapter } from '../adapters/markdown.js';
import { SmartSource } from '../smart_source.js';
import { SmartSources } from '../smart_sources.js';
import { SmartBlock } from '../smart_block.js';
import { SmartBlocks } from '../smart_blocks.js';
import { SmartEnv } from '../../smart-environment/smart_env.js';
import { SmartChunks } from '../../smart-chunks/smart_chunks.js';
import { SmartEmbedModel } from '../../smart-embed-model/smart_embed_model.js';
import { SmartFs } from '../../smart-fs/smart_fs.js';
const __dirname = new URL('.', import.meta.url).pathname;

// stub SmartSources import (TODO replace with Test Adapter)
SmartSources.prototype.import = async function() {
  return Promise.resolve();
};

class TestMain {
  load_settings() { return {}; }
  save_settings() {}
  get settings() { return {}; }
  get smart_env_opts() {
    return {
      env_path: __dirname,
      env_data_dir: 'test',
      smart_chunks_class: SmartChunks,
      smart_collection_adapter_class: TestSmartCollectionAdapter,
      smart_embed_model_class: SmartEmbedModel,
      smart_fs_class: SmartFs,
      smart_fs_adapter_class: TestSmartFsAdapter,
      collections: {
        smart_sources: SmartSources,
        smart_blocks: SmartBlocks,
      },
      item_types: {
        SmartSource,
        SmartBlock,
      },
      source_adapters: {
        // test: TestSourceAdapter,
        default: MarkdownSourceAdapter,
        test: MarkdownSourceAdapter,
        md: MarkdownSourceAdapter,
        // markdown: MarkdownSourceAdapter,
      },
    };
  }
}

export async function load_test_env(t) {
  const main = new TestMain();
  const env = new SmartEnv(main, main.smart_env_opts);
  await env.init();
  t.context.env = env;
}