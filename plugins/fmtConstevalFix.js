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

function applyFmtConstevalFix(contents) {
  if (contents.includes(FMT_FIX_MARKER)) {
    return contents;
  }

  // Append a new hook instead of editing the existing one. CocoaPods runs
  // post_install hooks in definition order, so this runs after Expo's
  // react_native_post_install and our C++17 setting cannot be overwritten.
  const trimmed = contents.replace(/\s*$/, '');
  return `${trimmed}\n\npost_install do |installer|\n${FMT_FIX_BLOCK}end\n`;
}

module.exports = {
  FMT_FIX_MARKER,
  applyFmtConstevalFix,
};
