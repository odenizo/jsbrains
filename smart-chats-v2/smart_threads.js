import { SmartSources, SmartSource } from "smart-sources";
import { template } from "./components/_component.js";
import { SmartThreadDataJsonAdapter } from "./adapters/json.js";

export class SmartThreads extends SmartSources {
  get container() { return this.opts.container; }
  set container(container) { this.opts.container = container; }
  async render(container=this.container, thread=null) {
    const frag = await template.call(this.env.smart_view, this, thread);
    container.empty().appendChild(frag);
  }
}

import {template as thread_template} from "./components/thread.js";
export class SmartThread extends SmartSource {
  static get defaults() {
    return {
      data: {
        created_at: Date.now(),
        responses: {},
        turns: {},
        messages: {},
      }
    }
  }
  get_key() { return this.data.created_at; }
  get chat_data_adapter() {
    if(!this._chat_data_adapter) {
      this._chat_data_adapter = new SmartThreadDataJsonAdapter(this);
    }
    return this._chat_data_adapter;
  }
  async render(container=null) {
    const thread_frag = await thread_template.call(this.env.smart_view, this);
    if(container) container.appendChild(thread_frag);
    else return thread_frag;
  }
  async new_response(response) {
    const {turns, messages} = await this.parse_response(response);
    await Promise.all(turns.map(turn => this.env.smart_turns.create_or_update(turn)));
    await Promise.all(messages.map(message => this.env.smart_messages.create_or_update(message)));
  }
  // "from chatml" (openai chat completion object) to DataAdapter format and Turn/Message instances
  // should always be converted to openai compatible format in Smart Chat Model (for now)
  async parse_response(response) { return await this.chat_data_adapter.parse_response(response); }
  async to_request() { return await this.chat_data_adapter.to_request(); }
}

import { SmartBlocks, SmartBlock } from "smart-sources";

/**
 * SmartTurns
 * Mostly a placeholder for now since ChatML doesn't allow for
 * multiple same-role messages in a row.
 */
export class SmartTurns extends SmartBlocks {
}
import {template as turn_template} from "./components/turn.js";
export class SmartTurn extends SmartBlock {
  static get defaults() {
    return {
      data: {
        choice_index: 0,
        turn_index: 0,
        role: null,
        messages: {},
      }
    }
  }
  get_key() { return `${this.thread.key}#${this.data.turn_index}{${this.data.choice_index}}`; }
  get thread() { return this.source; }
  get role() { return this.data.role; }
  async init() {
    this.thread.data.turns[this.key] = true;
    if(this.data.tool_calls){
      // TODO handle tool calls
    }
  }
  async render(container=null) {
    const turn_frag = await turn_template.call(this.env.smart_view, this);
    if(container) container.appendChild(turn_frag);
    else return turn_frag;
  }
}

export class SmartMessages extends SmartBlocks {
}

import {template as message_template} from "./components/message.js";
export class SmartMessage extends SmartBlock {
  static get defaults() {
    return {
      data: {
        choice_index: 0,
        turn_index: 0,
        content: null,
        tool_calls: null,
        tool_call_id: null,
        image_url: null,
      }
    }
  }
  get_key() { return `${this.thread.key}#${this.data.turn_index}{${this.data.choice_index}}`; }
  get turn() { return this.source; }
  get thread() { return this.turn.thread; }
  get role() { return this.turn.role; }
  init() {
    this.thread.data.messages[this.key] = true;
    this.turn.data.messages[this.key] = true;
  }
  async render(container=null) {
    const message_frag = await message_template.call(this.env.smart_view, this);
    if(container) container.appendChild(message_frag);
    else return message_frag;
  }
}