local $/ = undef;
open(my $fh1, "<", "chapter-2-exercise.html") or die;
my $content = <$fh1>;
close $fh1;

my $new_ex5 = <<'END_HTML';
<div class="chapter-head"><span class="chapter-num">5</span><h2>Exercise 5: PCA vs t-SNE</h2></div>
    
    <div class="mode-concept">
      <p>Imagine trying to map out a massive 3D city onto a flat 2D piece of paper.</p>
      <ul>
        <li><strong>PCA (The Mapmaker):</strong> Takes a photo from an airplane. It creates a rigid, perfectly mathematical map. If you take the photo twice from the exact same spot, it looks identical every time.</li>
        <li><strong>t-SNE (The Tourist):</strong> Walks around the city and draws a map based on which buildings are next to each other. It's beautiful and colorful, but if they draw it twice, the map might look totally different!</li>
      </ul>
      <p>In Sprint Exercise 5, we explored scRNA-seq (Genomics) data with thousands of features. <strong>Why run PCA before t-SNE?</strong> Because t-SNE gets overwhelmed if you give it too much data. We use PCA to filter out the noise (like stripping away the clouds in the airplane photo), and then we hand that clean, simplified data to t-SNE to draw the final colorful clusters!</p>
    </div>

    <div class="mode-tech">
      <p>In Sprint Exercise 5, we explored scRNA-seq (Genomics) data with thousands of features. We used Dimensionality Reduction to visualize it.</p>
      
      <div class="callout exam-trap">
        <div class="callout-icon">🚨</div>
        <div class="callout-content">
          <strong>Exam Trap: Why PCA before t-SNE?</strong>
          <p>This is a classic question. The official solution notes that PCA is applied first because it: <strong>1. Removes irrelevant variance and noise</strong> (improving t-SNE stability) and <strong>2. Reduces computational cost/runtime</strong>.</p>
        </div>
      </div>
      
      <div class="callout teacher-note">
        <div class="callout-icon">💡</div>
        <div class="callout-content">
          <strong>Interpreting the Plots (Q7 Solution)</strong>
          <p>The PCA plot typically shows a continuous spread without clearly separated groups because it preserves <em>global variance</em>. The t-SNE plot reveals compact clusters because it captures <em>local structure</em>. However, <strong>distances between clusters in t-SNE are NOT meaningful</strong>.</p>
        </div>
      </div>

<pre><code class="language-python">from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler

# 1. ALWAYS scale before dimensionality reduction
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. PCA: Deterministic, linear, preserves global variance
# We reduce thousands of genes down to the top 50 components
pca_50 = PCA(n_components=50)
X_pca_50 = pca_50.fit_transform(X_scaled)

# 3. t-SNE: Stochastic, non-linear, preserves local neighbors
# We feed the PCA output (X_pca_50) into t-SNE
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X_pca_50)
</code></pre>
    </div>
END_HTML

$content =~ s/<div class="chapter-head"><span class="chapter-num">5<\/span><h2>Exercise 5: PCA vs t-SNE<\/h2><\/div>.*?<\/pre>\s*<\/div>/$new_ex5/s;

open(my $fh2, ">", "chapter-2-exercise.html") or die;
print $fh2 $content;
close $fh2;
