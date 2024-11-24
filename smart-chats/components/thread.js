/**
 * @module components/thread
 * @description Renders a single chat thread with its messages
 */

/**
 * Builds the HTML string for the thread component
 * @param {SmartThread} thread - Thread instance to render
 * @param {Object} [opts={}] - Optional parameters for customizing the build
 * @returns {string} HTML string for the thread
 */
export function build_html(thread, opts = {}) {
  return `
    <div class="sc-thread" data-thread-key="${thread.key}">
      <div class="sc-message-container">
        ${opts.show_welcome && !thread.messages.length ? `
          <div class="sc-message assistant">
            <div class="sc-message-content">
              <span>Hi there, welcome to the Smart Chat. Ask me a question about your notes and I'll try to answer it.</span>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="sc-chat-form">
        <textarea class="sc-chat-input" placeholder="Try &quot;Based on my notes&quot; or &quot;Summarize [[this note]]&quot; or &quot;Important tasks in /folder/&quot;"></textarea>
        <div class="sc-btn-container">
          <span id="sc-abort-button" style="display: none;">${this.get_icon_html('square')}</span>
          <button class="send-button" id="sc-send-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill="currentColor" />
              <path fill="currentColor" fill-rule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" clip-rule="evenodd" fill="#727272"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders a chat thread
 * @async
 * @param {SmartThread} thread - Thread instance to render
 * @param {Object} [opts={}] - Rendering options
 * @param {boolean} [opts.show_welcome=true] - Whether to show welcome message for empty threads
 * @returns {Promise<DocumentFragment>} Rendered thread interface
 */
export async function render(thread, opts = {}) {
  const html = build_html.call(this, thread, {
    show_welcome: opts.show_welcome !== false
  });
  const frag = this.create_doc_fragment(html);
  return await post_process.call(this, thread, frag, opts);
}

/**
 * Post-processes the rendered thread
 * @async
 * @param {SmartThread} thread - Thread instance
 * @param {DocumentFragment} frag - Rendered fragment
 * @param {Object} opts - Processing options
 * @returns {Promise<DocumentFragment>} Post-processed fragment
 */
export async function post_process(thread, frag, opts) {
  const container = frag.querySelector('.sc-message-container');
  // If we have messages, render them
  if (thread.messages.length) {
    // append empty elms for each message
    thread.messages.forEach(msg => {
      const msg_elm = document.createElement('div');
      msg_elm.id = msg.data.id;
      container.appendChild(msg_elm);
    });
    await Promise.all(
      thread.messages.map(msg => msg.render(container))
    );
  }
  
  // Setup chat input handlers
  const chat_input = frag.querySelector('.sc-chat-form textarea');
  console.log('chat_input', chat_input);
  if (chat_input) {
    chat_input.addEventListener('keydown', (e) => handle_chat_input_keydown.call(this, e, thread, chat_input, opts));
    chat_input.addEventListener('keyup', (e) => handle_chat_input_keyup.call(this, e, chat_input));
  }
  
  // Scroll to bottom of container if needed
  if (container.scrollHeight > container.clientHeight) {
    container.scrollTop = container.scrollHeight;
  }

  // Send button
  const send_button = frag.querySelector('#sc-send-button');
  send_button.addEventListener('click', () => {
    thread.handle_message_from_user(chat_input.value);
    chat_input.value = '';
  });
  // Abort button
  const abort_button = frag.querySelector('#sc-abort-button');
  abort_button.addEventListener('click', () => {
    thread.chat_model.abort_current_response();
    thread.clear_streaming_ux();
  });
  
  return frag;
}

/**
 * Handles chat input keydown events
 * @private
 */
function handle_chat_input_keydown(e, thread, chat_input, opts) {
  const mod = this.adapter.is_mod_event(e);
  if (e.key === "Enter" && mod) {
    e.preventDefault();
    thread.handle_message_from_user(chat_input.value);
    chat_input.value = '';
    return;
  }

  if (!["/", "@", "[", "!"].includes(e.key)) return;
  
  const pos = chat_input.selectionStart;
  if (e.key === "[" && chat_input.value[pos - 1] === "[" && opts.open_file_suggestion_modal) {
    setTimeout(() => opts.open_file_suggestion_modal(), 10);
    return;
  }
  
  if (e.key === "/" && (!pos || [" ", "\n"].includes(chat_input.value[pos - 1])) && opts.open_folder_suggestion_modal) {
    setTimeout(() => opts.open_folder_suggestion_modal(), 10);
    return;
  }
  
  if (e.key === "@" && (!pos || [" ", "\n"].includes(chat_input.value[pos - 1])) && opts.open_system_prompt_modal) {
    setTimeout(() => opts.open_system_prompt_modal(), 10);
  }

  if (e.key === "!" && (!pos || [" ", "\n"].includes(chat_input.value[pos - 1])) && opts.open_image_suggestion_modal) {
    setTimeout(() => opts.open_image_suggestion_modal(), 10);
  }
}

/**
 * Handles chat input keyup events
 * @private
 */
function handle_chat_input_keyup(e, chat_input) {
  clearTimeout(this.resize_debounce);
  this.resize_debounce = setTimeout(() => {
    chat_input.style.height = 'auto';
    chat_input.style.height = `${chat_input.scrollHeight}px`;
  }, 200);
}
