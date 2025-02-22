
const parseArgs = require('minimist')
const processArgv = process.argv.slice(2)

const argv = parseArgs(processArgv, {
  alias: {
    p: 'profile', // config file
    i: 'icon',
    b: 'background',
    m: 'mode',
    f: 'filter',
    q: 'quality',
    h: 'help'
  },
  boolean: [ 'h', 'skip-trim' ],
  string: [
    'p', 'i', 'b', 'm', 'f', 'q',
    'padding',
    'theme-color',
    'png-color',
    'splashscreen-color',
    'svg-color',
    'splashscreen-icon-ratio'
  ]
})

// if user hasn't explicitly specified this, then
// we shouldn't take it into account
if (processArgv.includes('--skip-trim') === false) {
  delete argv['skip-trim']
}

const { green } = require('kolorist')

if (argv.help) {
  const modes = Object.keys(require('../modes')).join('|')
  const generators = Object.keys(require('../generators')).join('|')
  const defaultParams = require('../utils/default-params')

  console.log(`
  Description
    Generate App icons & splashscreens

  Usage
    $ icongenie generate [options]

    # generate icons for all installed Quasar modes
    $ icongenie generate -i /path/to/icon.png
    $ icongenie g -i /path/to/icon.png

    # generate for (as example) PWA mode only
    $ icongenie generate -m pwa --icon /path/to/icon.png

    # generate for (as example) Cordova & Capacitor mode only
    $ icongenie g -m cordova,capacitor -i
         /path/to/icon.png -b /path/to/background.png

    # generate by using a profile file
    $ icongenie generate -p ./icongenie-profile.json

    # generate by using batch of profile files
    $ icongenie generate -p ./folder-containing-profile-files

  Options
    --icon, -i            ${green('Required')};
                          Path to source file for icon; must be:
                            - a .png file
                            - min resolution: 64x64 px (the higher the better!!)
                            - with transparency
                          Best results are with a square image (height = width)
                          Image will be trimmed automatically
                            (also see "skip-trim" and "padding" param)
                          Path can be absolute, or relative to the root of the
                            Quasar project folder
                          Recommended min size: 1024x1024 px

    --background, -b      Path to optional background source file (for splashscreens);
                          must be:
                            - a .png file
                            - min resolution: 128x128 px (the higher the better!!)
                            - transparency is optional (but recommended if you
                              combine with the splashscreen-color param)
                          Path can be absolute, or relative to the root of the
                            Quasar project folder
                          Recommended min size: 1024x1024 px

    --mode, -m            For which Quasar mode(s) to generate the assets;
                          Default: all
                            [all|${modes}]
                          Multiple can be specified, separated by ",":
                            spa,cordova

    --filter, -f          Filter the available generators; when used, it can
                          generate only one type of asset instead of all
                            [${generators}]

    --quality             Quality of the files [1 - 12] (default: ${defaultParams.quality})
                            - higher quality --> bigger filesize & slower to create
                            - lower quality  --> smaller filesize & faster to create

    --skip-trim           Do not trim the icon source file

    --padding             Apply fixed padding to the icon after trimming it;
                          Syntax: <horiz: number>,<vert: number>
                          Default: 0,0
                          Example: "--padding 10,5" means apply 10px padding to top
                            10px to bottom, 5px to left side and 5px to rightside

    --theme-color         Theme color to use for all generators requiring a color;
                          It gets overridden if any generator color is also specified;
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --svg-color           Color to use for the generated monochrome svgs
                          Default (if no theme-color is specified): ${defaultParams.svgColor.slice(1)}
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --png-color           Background color to use for the png generator, when
                          "background: true" in the asset definition (like for
                          the cordova/capacitor iOS icons);
                          Default (if no theme-color is specified): ${defaultParams.pngColor.slice(1)}
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --splashscreen-color  Background color to use for the splashscreen generator;
                          Default (if no theme-color is specified): ${defaultParams.splashscreenColor.slice(1)}
                          The color must be in hex format (NOT hexa) without the leading
                          '#' character. Transparency not allowed.
                          Examples: 1976D2, eee

    --splashscreen-icon-ratio  Ratio of icon size in respect to the width or height
                               (whichever is smaller) of the resulting splashscreen;
                               Represents percentages; Valid values: 0 - 100
                               If 0 then it doesn't add the icon of top of background
                               Default: ${defaultParams.splashscreenIconRatio}

    --profile, -p         Use JSON profile file(s):
                            - path to folder (absolute or relative to current folder)
                              that contains JSON profile files (icongenie-*.json)
                            - path to a single *.json profile file (absolute or relative
                              to current folder)
                          Structure of a JSON profile file:
                            {
                              "params": {
                                "include": [ ... ], /* optional */
                                ...
                              },
                              "assets": [ /* list of custom assets */ ]
                            }

    --help, -h            Displays this message
  `)
  process.exit(0)
}

const parseArgv = require('../utils/parse-argv')
const generate = require('../runner/generate')
const getProfileFiles = require('../utils/get-profile-files')
const filterArgvParams = require('../utils/filter-argv-params')
const { log } = require('../utils/logger')

async function runProfiles (params, profileFiles) {
  for (let i = 0; i < profileFiles.length; i++) {
    const profile = profileFiles[i]

    console.log(`\n`)
    log(`---------------------`)
    log(`Generating by profile: ${profile}`)
    log(`---------------------`)
    console.log(`\n`)

    await generate({ ...params, profile })
  }
}

const params = filterArgvParams(argv)

if (params.profile) {
  parseArgv(params, [ 'profile' ])
  runProfiles(params, getProfileFiles(params.profile))
}
else {
  generate(params)
}
