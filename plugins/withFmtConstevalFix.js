const { withPodfile } = require('@expo/config-plugins');
const { applyFmtConstevalFix } = require('./fmtConstevalFix');

module.exports = function withFmtConstevalFix(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = applyFmtConstevalFix(config.modResults.contents);
    return config;
  });
};
