import { test } from 'node:test';
import assert from 'node:assert/strict';
import fmtFix from '../plugins/fmtConstevalFix.js';

const { FMT_FIX_MARKER, applyFmtConstevalFix } = fmtFix;

const PODFILE = `require File.join(File.dirname(\`node --print "require.resolve('expo/package.json')"\`), "scripts/autolinking")

platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'

target 'RecipeVaultAI' do
  use_expo_modules!

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
  end
end
`;

test('appends a fmt C++17 post_install hook after Expo post-install hooks', () => {
  const result = applyFmtConstevalFix(PODFILE);

  assert.ok(result.includes(FMT_FIX_MARKER));
  assert.ok(result.includes("config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'"));
  assert.ok(result.includes('FMT_USE_CONSTEVAL 0'));
  assert.ok(result.includes('^#\\s+define FMT_USE_CONSTEVAL 1$'));
  assert.ok(result.includes('react_native_post_install('));
  assert.ok(
    result.indexOf(FMT_FIX_MARKER) > result.indexOf('react_native_post_install('),
    'fmt hook should run after react_native_post_install'
  );
  assert.equal(
    result.match(/post_install do \|installer\|/g).length,
    2,
    'existing hook should be preserved and a new hook appended'
  );
});

test('does not add a duplicate workaround when applied twice', () => {
  const once = applyFmtConstevalFix(PODFILE);
  const twice = applyFmtConstevalFix(once);

  assert.equal(twice, once);
  assert.equal(
    twice.split(FMT_FIX_MARKER).length - 1,
    1,
    'marker should appear exactly once'
  );
});

test('adds a post_install hook when the Podfile does not have one', () => {
  const result = applyFmtConstevalFix("platform :ios, '15.1'\n");

  assert.ok(result.includes('post_install do |installer|'));
  assert.ok(result.includes(FMT_FIX_MARKER));
  assert.ok(result.trimEnd().endsWith('end'));
});

test('handles CRLF Podfiles', () => {
  const crlf = PODFILE.replace(/\n/g, '\r\n');
  const result = applyFmtConstevalFix(crlf);

  assert.ok(result.includes(FMT_FIX_MARKER));
  assert.ok(result.includes("CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'"));
});
