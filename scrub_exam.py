import glob

def clean_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Clean TOC links
    content = content.replace('<a href="#exam-drill"><span class="toc-num">10</span>Exam Drill</a>',
                              '<a href="#knowledge-drill"><span class="toc-num">10</span>Knowledge Drill</a>')
    
    # 2. Clean chapter-5-neural-networks text
    if 'chapter-5-neural-networks.html' in filepath:
        content = content.replace("The exam tests your ability to finish a network architecture.",
                                  "A common task is finishing a network architecture.")

    # 3. Clean chapter-5-training text
    if 'chapter-5-training.html' in filepath:
        content = content.replace('<section class="chapter" id="exam-drill">', '<section class="chapter" id="knowledge-drill">')
        content = content.replace('<h2>Exam Drill</h2>', '<h2>Knowledge Drill</h2>')
        content = content.replace("Same skills as Test Yourself, but in the exam's actual answer format.", 
                                  "Same skills as Test Yourself, but in a more structured format.")
        content = content.replace("Real exams rarely ask you to write a paragraph — they ask you to name a technique in a couple of words", 
                                  "Sometimes you need to name a technique in a couple of words")
        content = content.replace("<strong>Do this before your exam, not while reading for the first time.</strong>",
                                  "<strong>Do this to test your knowledge, not while reading for the first time.</strong>")

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob("chapter-5-*.html"):
    print(f"Cleaning {filepath}")
    clean_file(filepath)
