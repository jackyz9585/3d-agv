/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const Client = require('ssh2-sftp-client');
const inquirer = require('inquirer');

let client = new Client();

const config = require('../.deployment.server.json');
const srcDir = path.join(__dirname, '../dist');

inquirer
  .prompt([
    {
      type: 'list',
      name: 'codeType',
      message: '请选择要部署的环境:',
      choices: Object.keys(config).concat('all')
    }
  ])
  .then(async p => {
    if (p.codeType === 'all') {
      for (let env in config) {
        client = new Client();
        await client.connect(config[env]).then(() => {
          return client.uploadDir(srcDir, config[env].targetDir, /^((?!config).)+$/);
        });
        client.end();
      }
    } else {
      const env = p.codeType;
      return client.connect(config[env]).then(() => {
        return client.uploadDir(srcDir, config[env].targetDir, /^((?!config).)+$/);
      });
    }
  })
  .then(result => {
    console.log('文件部署成功');
    console.log(result);
  })
  .finally(() => {
    return client.end();
  })
  .catch(err => {
    console.log('文件部署失败', err);
  });
