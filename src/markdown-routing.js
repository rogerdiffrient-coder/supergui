// Route 6.1.2 Markdown/Code blocks into the existing markdown/rich-text bucket.
if (typeof SG607_CATEGORY_OPCODES !== 'undefined' && SG607_CATEGORY_OPCODES['markdown / rich text']) {
  for (const opcode of [
    'setContentModeV612','getContentModeV612','setCodeLanguageV612','getCodeLanguageV612','setMarkdownSourceV612','setCodeSourceV612'
  ]) SG607_CATEGORY_OPCODES['markdown / rich text'].add(opcode);
}
