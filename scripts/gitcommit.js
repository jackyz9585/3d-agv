/* eslint-disable @typescript-eslint/no-var-requires */
const inquirer = require('inquirer');
var execSync = require('child_process').execSync;

// - feat[特性]:新增 feature
// - fix[修复]: 修复 bug
// - docs[文档]: 仅仅修改了文档，比如 README, CHANGELOG, CONTRIBUTE 等等
// - style[格式]: 仅仅修改了空格、格式缩进、都好等等，不改变代码逻辑
// - refactor[重构]: 代码重构，没有加新功能或者修复 bug
// - perf[优化]: 优化相关，比如提升性能、体验
// - test[测试]: 测试用例，包括单元测试、集成测试等
// - chore[工具]: 改变构建流程、或者增加依赖库、工具等

const commitTypeMap = {
  特性: 'feat',
  修复: 'fix',
  文档: 'docs',
  格式: 'style',
  重构: 'refactor',
  优化: 'perf',
  测试: 'test',
  工具: 'chore',
};

inquirer
  .prompt([
    {
      type: 'list',
      name: 'commitType',
      message: '请选择commit类型:',
      choices: ['特性', '修复', '文档', '格式', '重构', '优化', '测试', '工具'],
    },
    {
      type: 'input',
      name: 'range',
      message: '请输入变更的影响范围:',
      validate: val => {
        if (val !== '') {
          return true;
        }
        return '请输入影响范围';
      },
    },
    {
      type: 'input',
      name: 'message',
      message: '请输入变更的具体内容',
      validate: val => {
        if (val !== '') {
          return true;
        }
        return '请输入变更的具体内容';
      },
    },
  ])
  .then(p => {
    const type = commitTypeMap[p.commitType];
    const commitCmd = `git commit -m "${type}[${p.range}]: ${p.message}"`;
    const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
    execSync(`git add . && ${commitCmd}`);
    execSync(`git push origin ${branchName}:${branchName}`);
    console.log(`变更已推送到远程分支 ${branchName}`);
  })
  .catch(error => {
    console.log('提交错误');
    console.log(error);
  });
