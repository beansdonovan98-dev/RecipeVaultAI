const FMT_FIX_MARKER =
  '# RecipeVaultAI: fmt 11.0.2 does not compile with Xcode 26 consteval rules';

const FMT_FIX_BLOCK = `  ${FMT_FIX_MARKER}
  # React Native 0.76.9 pins fmt 11.0.2, which fails under Apple clang 21.
  # Compile only the fmt pod as C++17 so fmt's consteval path is disabled.
  installer.pods_project.targets.each do |target|
    next unless target.name == 'fmt'

    target.build_configurations.each do |config|
      config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
    end
  end

  # Belt and suspenders: fmt 11.0.2 overwrites -D flags in base.h, so patch
  # the header directly as well.
  fmt_base = File.join(installer.sandbox.root.to_s, 'fmt', 'include', 'fmt', 'base.h')
  if File.exist?(fmt_base)
    begin
      fmt_contents = File.read(fmt_base)
      fmt_patched = fmt_contents.gsub(
        /^#\\s+define FMT_USE_CONSTEVAL 1$/,
        '#  define FMT_USE_CONSTEVAL 0'
      )
      if fmt_patched != fmt_contents
        File.chmod(0644, fmt_base)
        File.write(fmt_base, fmt_patched)
      end
    rescue StandardError => error
      puts "RecipeVaultAI: could not patch fmt base.h: #{error.message}"
    end
  end
`;

function findMatchingParen(contents, openIndex) {
  let depth = 0;

  for (let index = openIndex; index < contents.length; index += 1) {
    if (contents[index] === '(') {
      depth += 1;
    } else if (contents[index] === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function applyFmtConstevalFix(contents) {
  if (contents.includes(FMT_FIX_MARKER)) {
    return contents;
  }

  const eol = contents.includes('\r\n') ? '\r\n' : '\n';
  const block = FMT_FIX_BLOCK.replace(/\n/g, eol);
  const trimmed = contents.replace(/\s*$/, '');
  const hookMatch = contents.match(/post_install do \|installer\|/);

  if (!hookMatch) {
    return `${trimmed}${eol}${eol}post_install do |installer|${eol}${block}end${eol}`;
  }

  // CocoaPods 1.17+ rejects multiple post_install hooks, so inject the fix
  // into the existing hook. Inserting after react_native_post_install keeps
  // our C++17 setting from being overwritten.
  const hookStart = hookMatch.index + hookMatch[0].length;
  const remaining = contents.slice(hookStart);
  const rnMatch = /^[ \t]*react_native_post_install\(/m.exec(remaining);

  if (rnMatch) {
    const openParen = hookStart + rnMatch.index + rnMatch[0].indexOf('(');
    const closeParen = findMatchingParen(contents, openParen);

    if (closeParen !== -1) {
      return `${contents.slice(0, closeParen + 1)}${eol}${block}${contents.slice(closeParen + 1)}`;
    }
  }

  return `${contents.slice(0, hookStart)}${eol}${block}${contents.slice(hookStart)}`;
}

module.exports = {
  FMT_FIX_MARKER,
  applyFmtConstevalFix,
};
