import sys
import os
import re

filepath = "/Users/kevingomezlazaro/Local Sites/liwilu/app/public/wp-content/themes/liwilu-theme/pages/carrito.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_line = 'import GuestDataForm from "@/components/cart/GuestDataForm";'
if import_line not in content:
    content = content.replace(
        'import GuestDataSummary from "@/components/cart/GuestDataSummary";',
        'import GuestDataSummary from "@/components/cart/GuestDataSummary";\nimport GuestDataForm from "@/components/cart/GuestDataForm";'
    )

# Use regex to find and replace the guest tab block
replacement_block = """              <GuestDataForm
                activeTab={activeTab}
                guestData={guestData}
                guestErrors={guestErrors}
                onGuestChange={handleGuestChange}
                onGuestSubmit={handleGuestSubmit}
                guestLocations={guestLocations}
                onSetActiveTab={setActiveTab}
                onSetGuestData={setGuestData}
              />"""

# Pattern to match: {/* TAB DE INVITADO */} ... up to the closing )} of the activeTab === "guest" block
pattern = r'\{\/\* TAB DE INVITADO \*\/\}\s*\{activeTab === "guest" && \(.*?\n\s*\)\s*\}\s*'
new_content = re.sub(pattern, replacement_block + "\n", content, flags=re.DOTALL)

if new_content != content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully integrated GuestDataForm")
else:
    print("Could not find the target block with regex")
