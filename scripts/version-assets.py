"""Update content-based asset URLs so browsers do not mix frontend releases."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[1]
def revision(path):
    return hashlib.sha256((root / path).read_bytes()).hexdigest()[:12]

app = root / 'src/app.js'
source = app.read_text()
for filename in ('states.js', 'planner.js', 'spotlight.js'):
    source = re.sub(r"(?<=from )(['\"])\./" + re.escape(filename) + r"(?:\?v=[a-zA-Z0-9-]+)?\1", lambda m: m[1] + './' + filename + '?v=' + revision('src/' + filename) + m[1], source)
app.write_text(source)
html = root / 'index.html'
source = html.read_text()
for path in ('style.css', 'src/app.js'):
    source = re.sub(r'((?:src|href)=\")' + re.escape(path) + r'(?:\?v=[a-zA-Z0-9-]+)?\"', lambda m: m[1] + path + '?v=' + revision(path) + '"', source)
source = re.sub(r'(<span id="build-version">).*?(</span>)', lambda m: m[1] + 'Versi ' + revision('src/app.js')[:8] + m[2], source)
html.write_text(source)
print('Asset revisions updated: ' + revision('src/app.js')[:8])
