#!/usr/bin/env zx

const semverInc = require('semver/functions/inc')
const packageJson = require('./package.json');

// let {version} = await fs.readJson('./package.json')

console.log(
  chalk.yellow.bold(`Current verion: ${packageJson.version}`)
)

let types = ['major', 'minor', 'patch']
let type = await question(
  chalk.cyan(
    'Release type? Press Tab twice for suggestion \n'
  ),
  {
    choices: types,
  }
)
let version = ''
if (type !== '' || types.includes(type)) {
  version = semverInc(packageJson.version, type)
  console.log(
    chalk.green.bold(`Release verion? ${version}`)
  )
  // 使用 sed 命令修改 version，用 node fs 修改也行
  $`sed -i '' s/${packageJson.version}/${version}/g package.json`
} else {
  await $`exit 1`
}

// 构建
await $`tsc && vite build`

// git
// await $`git add .`
// await $`git commit -m 'Update version to ${version}'`
// await $`git tag v${version}`
// await $`git push origin refs/tags/v${version}`
// await $`git push origin HEAD:refs/for/master`

// 压缩
await $`zip -q -r bundle.zip ./dist`