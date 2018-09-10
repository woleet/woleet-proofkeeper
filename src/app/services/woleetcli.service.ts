import * as path from 'path';
import * as log from 'loglevel'
import * as fs from 'fs';

export class WoleetCli {

  private woleetCli: string;

  public getCliPath() {
    return this.woleetCli;
  }

  public createProcess(parameters: string) {
    let out:string;
    try {
      out = require('child_process').execFileSync(this.woleetCli, [parameters], {stdio: 'pipe', windowsHide: true});
    } catch (error) {
      log.error(error)
      out = error
    }
    return out
  }

  public constructor() {
    let platform: string = process.platform;
    if ( platform == 'win32' ) {
      platform = 'windows'
    }
    this.woleetCli = path.join(__dirname, 'assets/bin/', platform, '/woleet-cli');
    log.info(this.woleetCli)
    if (fs.lstatSync(this.woleetCli).isFile()) {
      if ( platform != 'windows' ) {
        let executable: boolean = true;
        try {
          fs.accessSync(this.woleetCli, fs.constants.X_OK)
        } catch (err) {
          executable = false;
        }
        log.info(`Executable: ${executable}`)
        if (!executable) {
          fs.chmodSync(this.woleetCli, fs.lstatSync(this.woleetCli).mode | fs.constants.S_IXUSR)
        }
      }
    } else {
      log.error(`Unable to find: ${this.woleetCli}`)
    }
  }
}

export class WoleetCliParameters {
  url: string = null;
  token: string = null;


  public getParametersAsString() {
    let globalParameters: string = '';
    if (this.url != null){
      globalParameters = globalParameters.concat(`--url ${this.url} `);
    }
    if (this.token != null){
      globalParameters = globalParameters.concat(`--token ${this.token} `);
    }
    return globalParameters;
  }

  public constructor(token:string, url?:string) {
    this.token = token;
    if (url != undefined) {
      this.url = url;
    }
  }
}