import { ScullyConfig } from '@scullyio/scully';
import '@scullyio/scully-plugin-playwright';

/** this loads the default render plugin, remove when switching to something else. */


export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'pitch59',
  // spsModulePath: 'YOUR OWN MODULE PATH HERE',
  outDir: './dist/static',
  routes: {
  }
};
