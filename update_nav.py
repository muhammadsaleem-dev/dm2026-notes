import glob
import re

nav_links_html = """<div class="sitenav-links">
      <a href="chapter-1-intro.html">1 · Intro</a>
      <a href="chapter-2-overview.html">2 · Overview</a>
      <a href="chapter-2-pandas.html">2.1 · Pandas/EDA</a>
      <a href="chapter-2-preprocessing.html">2.2 · Preprocessing</a>
      <a href="chapter-2-modelling.html">2.3 · Modelling</a>
      <a href="chapter-2-pca.html">2.4 · PCA</a>
      <a href="chapter-3-classification.html">3 · Classification</a>
      <a href="chapter-4-clustering.html">4 · Clustering</a>
      <a href="chapter-5-overview.html">5 · Regression→NN</a>
      <a href="chapter-5-regression.html">5.1 · Regression</a>
      <a href="chapter-5-neural-networks.html">5.2 · Neural Networks</a>
      <a href="chapter-5-training.html">5.3 · Training</a>
      <a href="chapter-6-llm-rag.html">6 · LLM/RAG</a>
      <a href="chapter-7-explainability.html">7 · Explainability</a>
    </div>"""

sidebar_modules_html = """<span class="sidebar-label">Modules</span>
      <a href="chapter-1-intro.html">1 · Introduction to Data Mining</a>
      <details class="nav-details" id="mod2-details">
        <summary class="nav-summary">
          <a href="chapter-2-overview.html">2 · The Data Mining Pipeline</a>
          <span class="nav-chevron"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </summary>
        <div class="sub-modules">
          <a href="chapter-2-pandas.html">2.1 · Pandas &amp; EDA</a>
          <a href="chapter-2-preprocessing.html">2.2 · Data Preprocessing</a>
          <a href="chapter-2-modelling.html">2.3 · Modelling &amp; Evaluation</a>
          <a href="chapter-2-pca.html">2.4 · PCA &amp; t-SNE</a>
        </div>
      </details>
      <a href="chapter-3-classification.html">3 · Classification</a>
      <a href="chapter-4-clustering.html">4 · Clustering Analysis</a>
      <details class="nav-details" id="mod5-details">
        <summary class="nav-summary">
          <a href="chapter-5-overview.html">5 · From Regression to Neural Networks</a>
          <span class="nav-chevron"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </summary>
        <div class="sub-modules">
          <a href="chapter-5-regression.html">5.1 · Linear &amp; Logistic Regression</a>
          <a href="chapter-5-neural-networks.html">5.2 · Building Neural Networks</a>
          <a href="chapter-5-training.html">5.3 · Training at Scale &amp; Exercises</a>
        </div>
      </details>
      <a href="chapter-6-llm-rag.html">6 · LLM &amp; RAG Pipeline</a>
      <a href="chapter-7-explainability.html">7 · Explainability &amp; Causality</a>"""

nav_panel_modules_html = sidebar_modules_html.replace('sidebar-label', 'nav-panel-label')

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace sitenav-links (this one is safe because it doesn't have nested divs)
    content = re.sub(r'<div class="sitenav-links">.*?</div>', nav_links_html, content, flags=re.DOTALL)
    
    # Replace sidebar modules (anchor to the last module to avoid nested div issues)
    content = re.sub(r'<span class="sidebar-label">Modules</span>.*?chapter-7-explainability\.html">7 · Explainability &amp; Causality</a>', sidebar_modules_html, content, flags=re.DOTALL)
    
    # Replace nav-panel modules (anchor to the last module)
    content = re.sub(r'<span class="nav-panel-label">Modules</span>.*?chapter-7-explainability\.html">7 · Explainability &amp; Causality</a>', nav_panel_modules_html, content, flags=re.DOTALL)
    
    # Apply 'active' class based on filename
    filename = filepath.split('/')[-1]
    
    # Remove existing active classes first to avoid duplicates
    content = content.replace('class="active"', '')
    # The above replace will strip 'active' from everywhere. But it might break if a tag had multiple classes like `class="nav-link active"`.
    # Let's use a safer regex for removing active class from links
    content = re.sub(r'class="active"', '', content) # wait, we just stripped it.
    
    # Then add it back for the correct link
    if filename != "index.html":
        # Make the exact match active
        # Links might be: <a href="filename.html"> or <a href="filename.html" >
        content = content.replace(f'<a href="{filename}">', f'<a href="{filename}" class="active">')
        # Also handle sub-modules which might have formatting diffs, but they are all written exactly as `<a href="file.html">` in the HTML blocks above

    # Open the details accordion if we are on a module 2 or module 5 page
    if "chapter-2-" in filename:
        content = content.replace('<details class="nav-details" id="mod2-details">', '<details class="nav-details" id="mod2-details" open>')
    if "chapter-5-" in filename:
        content = content.replace('<details class="nav-details" id="mod5-details">', '<details class="nav-details" id="mod5-details" open>')

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob("*.html"):
    if filepath not in ["chapter-2-pipeline.html", "chapter-5-regression-nn.html"]: # Ignore the ones we are deleting/deleted
        print(f"Updating {filepath}")
        update_file(filepath)
