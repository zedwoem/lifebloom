import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import { visit } from 'unist-util-visit';

const KEYWORD_LINK_MAP: Record<string, string> = {
  'goldco': '/api/affiliate?network=impact&product_id=goldco-ira&pillar=money-future',
  'lively': '/api/affiliate?network=direct&product_id=lively-alert&pillar=senior',
  'chewy': '/api/affiliate?network=impact&product_id=chewy-autoship&pillar=pet-family',
  'yale assure': '/api/affiliate?network=amazon&product_id=yale-smart-lock&pillar=home-living'
};

export async function autoLinkContent(markdownContent: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(() => (tree) => {
      visit(tree, 'text', (node: any) => {
        let newText = node.value;
        let modified = false;
        
        for (const [keyword, link] of Object.entries(KEYWORD_LINK_MAP)) {
          // Case-insensitive exact word match
          const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
          if (regex.test(newText)) {
            // Replace keyword with anchor tag. Using standard DOM injection styling.
            newText = newText.replace(
              regex, 
              `<a href="${link}" class="text-brand-blue font-semibold underline decoration-brand-blue/30 hover:decoration-brand-blue/80 transition-all" target="_blank" rel="noopener noreferrer" aria-label="Partner Link: $1">$1</a>`
            );
            modified = true;
          }
        }

        if (modified) {
          // Change node type to html so remarkHtml doesn't escape the anchor tags
          node.type = 'html';
          node.value = newText;
        }
      });
    })
    .use(remarkHtml, { sanitize: false });

  const file = await processor.process(markdownContent);
  return String(file);
}
