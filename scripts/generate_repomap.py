import os
import re
import networkx as nx
import tiktoken
from tree_sitter import Parser
import tree_sitter_languages
from pathlib import Path

# Configuration
REPO_ROOT = "/Users/pawelknorps/Downloads/STRONA/fest-dance-company"
SRC_DIR = os.path.join(REPO_ROOT, "src")
OUTPUT_FILE = os.path.join(REPO_ROOT, "repomap.md")
TOKEN_BUDGET = 2000
EXCLUDE_DIRS = {"node_modules", "dist", ".git", "public"}
EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}

def get_symbols(content, file_path):
    ext = Path(file_path).suffix
    lang_name = "tsx" if ext == ".tsx" else ("typescript" if ext == ".ts" else "javascript")
    
    symbols = []
    
    try:
        language = tree_sitter_languages.get_language(lang_name)
        parser = Parser()
        parser.set_language(language)
        tree = parser.parse(bytes(content, "utf8"))
        
        # Comprehensive query for symbols
        query_scm = """
        (class_declaration name: (type_identifier) @name)
        (function_declaration name: (identifier) @name)
        (interface_declaration name: (type_identifier) @name)
        (type_alias_declaration name: (type_identifier) @name)
        (method_definition name: (property_identifier) @name)
        (variable_declarator 
            name: (identifier) @name 
            value: [(arrow_function) (function_expression)])
        (export_statement (declaration (function_declaration name: (identifier) @name)))
        (export_statement (declaration (class_declaration name: (type_identifier) @name)))
        """
        
        query = language.query(query_scm)
        captures = query.captures(tree.root_node)
        
        for node, tag in captures:
            symbol_name = content[node.start_byte:node.end_byte]
            if symbol_name not in symbols and len(symbol_name) > 1:
                symbols.append(symbol_name)
    except Exception as e:
        # Fallback to regex if tree-sitter fails
        regex_symbols = re.findall(r"(?:export\s+)?(?:class|function|interface|type|const|let|var)\s+([a-zA-Z0-9_]+)", content)
        for s in regex_symbols:
            if s not in symbols and s not in {"from", "default", "export", "import", "as"}:
                symbols.append(s)
            
    return symbols

def get_imports(content, file_path):
    imports = []
    # Match relative imports
    matches = re.findall(r"from\s+['\"](\.[^'\"]+)['\"]", content)
    for m in matches:
        imports.append(m)
    return imports

def generate_map():
    files_data = {}
    G = nx.DiGraph()

    for root, dirs, files in os.walk(SRC_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, REPO_ROOT)
                
                try:
                    with open(full_path, "r", encoding="utf-8") as f:
                        content = f.read()
                except Exception:
                    continue
                
                symbols = get_symbols(content, full_path)
                imports = get_imports(content, full_path)
                
                files_data[rel_path] = {
                    "symbols": symbols,
                    "tokens": 0 # placeholder
                }
                
                G.add_node(rel_path)
                # Note: Simple graph for now, actual SOTA would resolve imports
                for imp in imports:
                    pass

    # Simple PageRank based on symbol density if graph is incomplete
    pagerank = {f: len(files_data[f]["symbols"]) + 1 for f in files_data}
    total_symbols = sum(pagerank.values())
    if total_symbols > 0:
        pagerank = {f: v/total_symbols for f, v in pagerank.items()}

    enc = tiktoken.get_encoding("cl100k_base")
    
    output = [
        "# Repository Map (SOTA)",
        f"Project: fest-dance-company",
        f"Token Budget: {TOKEN_BUDGET}",
        f"Generated Symbols: {sum(len(d['symbols']) for d in files_data.values())}",
        "---",
        ""
    ]
    
    current_tokens = len(enc.encode("\n".join(output)))
    sorted_files = sorted(files_data.keys(), key=lambda x: pagerank.get(x, 0), reverse=True)
    
    for rel_path in sorted_files:
        data = files_data[rel_path]
        if not data["symbols"]:
            continue
            
        symbols_str = ", ".join(data["symbols"][:20]) # Cap symbols per file for the map
        if len(data["symbols"]) > 20:
            symbols_str += "..."
            
        section = f"### {rel_path}\n- Symbols: {symbols_str}\n\n"
        
        section_tokens = len(enc.encode(section))
        if current_tokens + section_tokens > TOKEN_BUDGET:
            output.append(f"*(Truncated {len(sorted_files) - sorted_files.index(rel_path)} files)*")
            break
            
        output.append(section)
        current_tokens += section_tokens

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(output))

    print(f"Repomap generated at {OUTPUT_FILE} ({current_tokens} tokens, {len(files_data)} files processed)")

if __name__ == "__main__":
    generate_map()
