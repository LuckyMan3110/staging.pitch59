// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // basePath: 'http://localhost:5002/api/',
  // basePath: 'https://api.pitch59.com/api/',
  basePath: 'https://dev-api.pitch59.com/api/',
  maxVideoDuration: 59.4,
  defaultVideoOnCenterSlideForPitchDemosCategory: '103236525869091437',
  defaultBusinessShareLinkAlias: 'pitch59-inc',
  defaultBusinessNameForShare: 'Pitch59 Inc',
  trackPageviews: false,
  title: 'Pitch59',
  mobileVideoCapture: true,
  employerPortalBetaTest: false,

  // UI App base url
  // appBaseUrl: 'https://pitch59.com'
  appBaseUrl: 'https://dev.pitch59.com',
  apiServUrl: 'https://dev-apiserv.pitch59.com/api/'
};
