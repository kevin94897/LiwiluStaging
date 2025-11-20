const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'tienda', '[id].tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Move hooks before conditional return and add proper types
const oldHooksPattern = /(\tif \(error \|\| !product\) \{[\s\S]*?\t\}\r?\n\r?\n)\t(const \[quantity[\s\S]*?const \[selectedSize, setSelectedSize\] = useState\(null\);)/;
const newHooks = `\t// All hooks must be called at the top level, before any conditional returns
\tconst [quantity, setQuantity] = useState(1);
\tconst [selectedColor, setSelectedColor] = useState<string | null>(null);
\tconst [selectedSize, setSelectedSize] = useState<string | null>(null);
\t
\t// Define tab keys type
\ttype TabKey = 'Descripción del producto' | 'Especificaciones' | 'Guía de tallas';
\tconst [activeTab, setActiveTab] = useState<TabKey>('Descripción del producto');

$1`;

content = content.replace(oldHooksPattern, newHooks);

// Fix 2: Remove product?.colors and product?.sizes references
content = content.replace(/const colors = product\?\.colors \|\| \[/, 'const colors = [');
content = content.replace(/const sizes = product\?\.sizes \|\| \[/, 'const sizes = [');

// Fix 3: Add comment before colors
content = content.replace(/(\t\}\r?\n\r?\n)\t(const colors = \[)/, '$1\t// Fallback colors and sizes (Product type doesn't include these properties) \r\n\t$2');

// Fix 4: Type the tabs object
content = content.replace(/\tconst tabs = \{/, '\tconst tabs: Record<TabKey, JSX.Element> = {');

// Fix 5: Remove duplicate activeTab declaration
content = content.replace(/\t\};\r?\n\r?\n\tconst \[activeTab, setActiveTab\] = useState\(Object\.keys\(tabs\)\[0\]\);[^\r\n]*\r?\n/, '\t};\r\n');

// Fix 6: Cast Object.keys(tabs) to TabKey[]
content = content.replace(/Object\.keys\(tabs\)\.map\(\(tab\) =>/g, '(Object.keys(tabs) as TabKey[]).map((tab) =>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ TypeScript fixes applied successfully!');
