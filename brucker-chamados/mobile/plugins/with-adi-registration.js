const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAdiRegistration(config, props) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const snippet = props && props.snippet;
      if (!snippet) {
        throw new Error('with-adi-registration: missing "snippet" prop');
      }
      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets'
      );
      fs.mkdirSync(assetsDir, { recursive: true });
      fs.writeFileSync(
        path.join(assetsDir, 'adi-registration.properties'),
        snippet,
        'utf8'
      );
      return config;
    },
  ]);
};
