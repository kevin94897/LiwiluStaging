import sys
import os

filepath = "/Users/kevingomezlazaro/Local Sites/liwilu/app/public/wp-content/themes/liwilu-theme/pages/carrito.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Based on Step 1818 and 1807:
# Line 1817 (index 1816) is where the rogue junk starts: "</div>"
# Line 2147 (index 2146) is "                </div>"
# Line 2148 (index 2147) is "              )}"

# We want to keep lines up to 1816 (index 1815)
# And lines from 2148 (index 2147) onwards

new_lines = lines[:1816] + lines[2147:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Removed {2147 - 1816} lines of corrupted JSX.")
