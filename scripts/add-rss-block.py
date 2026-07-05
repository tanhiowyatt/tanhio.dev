import os
import re

RSS_BLOCK = '''
        <!-- RSS Feed Module -->
        <article class="mt-16 blog-rss-module">
          <div class="rss-info">
            <h2 class="blog-post-title flex items-center gap-2" style="margin-bottom: 0.5rem; cursor: default;">
              <i class="bi bi-rss-fill text-orange-500"></i>
              <span>RSS Feeds</span>
            </h2>
            <p class="blog-post-excerpt" style="cursor: default;">Get the latest articles directly in your favorite feed reader.</p>
          </div>
          <div class="rss-btn-group flex-shrink-0">
            <button class="rss-copy-btn" data-feed="/blog/feed.xml">
              <i class="bi bi-rss"></i> <span class="rss-btn-text">RU</span>
            </button>
            <button class="rss-copy-btn" data-feed="/blog/feed.en.xml">
              <i class="bi bi-rss"></i> <span class="rss-btn-text">EN</span>
            </button>
            <button class="rss-copy-btn" data-feed="/blog/feed.pl.xml">
              <i class="bi bi-rss"></i> <span class="rss-btn-text">PL</span>
            </button>
          </div>
        </article>'''

blog_dir = '/Users/tanhiowyatt/projects/tanhio.dev/sites/blog'
langs = ['en', 'ru', 'pl']
modified = []

for lang in langs:
    lang_dir = os.path.join(blog_dir, lang)
    for fname in os.listdir(lang_dir):
        if fname.endswith('.html') and fname != 'index.html':
            fpath = os.path.join(lang_dir, fname)
            with open(fpath, 'r') as f:
                content = f.read()
            
            # Skip if RSS block already present
            if 'blog-rss-module' in content:
                print(f"SKIP (already has RSS): {fpath}")
                continue
            
            # Insert RSS block after </article> and before the closing </div> of blog-container
            new_content = content.replace(
                '        </article>\n      </div>',
                '        </article>\n' + RSS_BLOCK + '\n      </div>'
            )
            
            if new_content != content:
                with open(fpath, 'w') as f:
                    f.write(new_content)
                modified.append(fpath)
                print(f"MODIFIED: {fpath}")
            else:
                print(f"NO MATCH: {fpath}")

# Also update post-template.html
template_path = os.path.join(blog_dir, 'post-template.html')
with open(template_path, 'r') as f:
    content = f.read()

if 'blog-rss-module' not in content:
    new_content = content.replace(
        '        </article>\n      </div>',
        '        </article>\n' + RSS_BLOCK + '\n      </div>'
    )
    if new_content != content:
        with open(template_path, 'w') as f:
            f.write(new_content)
        modified.append(template_path)
        print(f"MODIFIED: {template_path}")

print(f"\nTotal files modified: {len(modified)}")
