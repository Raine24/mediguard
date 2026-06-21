import sys

with open('public/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = [line for line in lines if 'href="#faq"' not in line]

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('FAQ links removed.')
