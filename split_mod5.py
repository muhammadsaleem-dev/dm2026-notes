import re

with open('chapter-5-regression-nn.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract the shell (everything before <div class="page"> and after the last section)
# We need the nav and sidebar. We'll update the nav later globally.
head_match = re.search(r'^(.*?<div class="page">)', content, re.DOTALL)
head = head_match.group(1)

tail_match = re.search(r'(</div>\s*</body>\s*</html>)', content, re.DOTALL)
tail = tail_match.group(1) if tail_match else "\n</div>\n</body>\n</html>"

# 2. Extract sections
# 0. Visual Storyboard (starts after <div class="page"> until <!-- ============ 1 ============ --> or <section)
# Wait, the visual storyboard has a masthead, dek, outcomes-box, toc-card, and then the comic reader.
# Let's just find everything from <div class="masthead"> to the end of <!-- END COMIC READER -->
overview_match = re.search(r'(<div class="masthead">.*?<!-- END COMIC READER -->)', content, re.DOTALL)
overview_content = overview_match.group(1)

# Extract all <section class="chapter" id="...">...</section>
sections = list(re.finditer(r'<section class="chapter" id="([^"]+)">(.*?)</section>', content, re.DOTALL))

sec_dict = {}
for s in sections:
    sec_dict[s.group(1)] = '<section class="chapter" id="' + s.group(1) + '">' + s.group(2) + '</section>'

# 3. Create the new files
def write_file(filename, body_content, title_num):
    # we need to fix the title in the head if we want, but for now just use the existing head
    # we'll do global nav replacement later.
    new_html = head + '\n' + body_content + '\n' + tail
    with open(filename, 'w', encoding='utf-8') as out:
        out.write(new_html)

# chapter-5-overview.html
write_file('chapter-5-overview.html', overview_content, "5")

# chapter-5-regression.html
reg_body = "\n\n".join([sec_dict['framing'], sec_dict['linear-regression'], sec_dict['gradient-descent'], sec_dict['logistic-regression']])
write_file('chapter-5-regression.html', reg_body, "5.1")

# chapter-5-neural-networks.html
nn_body = "\n\n".join([sec_dict['building-the-network'], sec_dict['hyperparameters']])
write_file('chapter-5-neural-networks.html', nn_body, "5.2")

# chapter-5-training.html
train_body = "\n\n".join([sec_dict['gd-at-scale'], sec_dict['exercises'], sec_dict['test-yourself'], sec_dict['exam-drill']])
write_file('chapter-5-training.html', train_body, "5.3")

print("Files created successfully.")
