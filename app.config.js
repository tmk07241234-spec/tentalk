const fs = require('fs');
const path = require('path');

/**
 * Adds native Google sign-in only when its Firebase file is present: the config plugin
 * refuses to run without it. Locally the file sits at the project root; on EAS it comes
 * from the GOOGLE_SERVICES_JSON file variable.
 */
module.exports = ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';
  if (!fs.existsSync(path.resolve(__dirname, googleServicesFile))) return config;
  return {
    ...config,
    android: { ...config.android, googleServicesFile },
    extra: { ...config.extra, googleSignIn: true },
    plugins: [...config.plugins, 'react-native-nitro-google-signin'],
  };
};
