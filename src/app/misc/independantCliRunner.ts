import { ApplicationRef } from '@angular/core';
import { FolderParam } from './folderParam';
import { concat, interval, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Log } from './logs';
import { WoleetCliParametersService } from '../services/woleetcliParameters.service';
import { LogMessageService } from '../services/logMessage.service';
import { ExitTickService } from '../services/exitTick.service';
import { FolderDoneService } from '../services/folderDone.service';
import * as log from 'loglevel';

export class IndependantCliRunnerService {

  private timerSubscription: Subscription;

  constructor(private appRef: ApplicationRef,
    public folderParam: FolderParam,
    private cli: WoleetCliParametersService,
    private logMessageService: LogMessageService,
    private exitCodeMessageService: ExitTickService,
    private folderDoneService: FolderDoneService) {
    this.timerSubscribe();
  }

  private execCli(folder: FolderParam) {
    return new Promise((resolve) => {
      log.info(this.cli.getActionParametersArray(folder).join(' '));
      if (folder.logContext.logsAccumulator === undefined) {
        folder.logContext.logsAccumulator = '';
      }
      folder.logContext.logs = [];
      folder.logContext.exitCode = -1;
      folder.logContext.launched = true;
      const newExecutionCalled = [false]; // Used to pass boolean as reference
      const exec = this.cli.woleetCli.createProcess(this.cli.getActionParametersArray(folder));
      exec.stdout.on('data', (data) => {
        folder.logContext.logsAccumulator += data.toString('utf8');
        if (!newExecutionCalled[0]) {
          this.parseLogs(folder, newExecutionCalled);
        } else {
          newExecutionCalled[0] = true;
        }
      });
      exec.on('close', (code) => {
        folder.logContext.exitCode = code;
        folder.logContext.launched = false;
        this.printLogs(folder);
        log.info(`woleet-cli exited with code ${code}`);
        this.exitCodeMessageService.sendTick();
        this.folderDoneService.sendFolderParam(folder);
        resolve(code);
      });
    });
  }

  private printLogs(folder: FolderParam) {
    folder.logContext.logs.forEach(logLine => {
      log.info(`${logLine.level} - ${logLine.msg}`);
    });
  }

  private parseLogs(folder: FolderParam, newExecutionCalled: boolean[]) {
    const tempLogAccumulator = folder.logContext.logsAccumulator;
    const logAccumulatorSplitted = tempLogAccumulator.split('\n');
    if (logAccumulatorSplitted.length >= 2) {
      for (let index = 0; index < logAccumulatorSplitted.length; index++) {
        if (index === logAccumulatorSplitted.length - 1) {
          const lenghtToDelete = tempLogAccumulator.length - logAccumulatorSplitted[index].length;
          folder.logContext.logsAccumulator = folder.logContext.logsAccumulator.slice(lenghtToDelete);
        } else if (logAccumulatorSplitted[index]) {
          const jsonLogLine: Log = {
            level: '',
            msg: ''
          };
          try {
            const parsedLogLine = JSON.parse(logAccumulatorSplitted[index]);
            jsonLogLine.level = parsedLogLine.level;
            jsonLogLine.msg = parsedLogLine.msg;
            if (parsedLogLine.file !== undefined) {
              jsonLogLine.msg += `: ${parsedLogLine.file}`;
            }
            if (parsedLogLine.originalFile !== undefined) {
              jsonLogLine.msg += `: ${parsedLogLine.originalFile}`;
            }
          } catch (error) {
            jsonLogLine.level = 'error';
            jsonLogLine.msg = logAccumulatorSplitted[index];
          }
          folder.logContext.logs.unshift(jsonLogLine);
        }
      }
      this.logMessageService.sendMessage(folder.path);
    }
    if (newExecutionCalled[0]) {
      newExecutionCalled[0] = false;
      this.parseLogs(folder, newExecutionCalled);
    }
  }

  public forceRefresh() {
    this.timerSubscription.unsubscribe();
    this.timerSubscribe();
  }

  private timerSubscribe() {
    const appIsStable = this.appRef.isStable.pipe(first(isStable => isStable === true));
    const every15Mins = interval(15 * 60 * 1000);
    const every15MinsOnceAppIsStable = concat(appIsStable, every15Mins);
    this.timerSubscription = every15MinsOnceAppIsStable.subscribe(() => {
      if (!this.folderParam.logContext.launched) {
        this.folderParam.logContext.launched = true;
        this.execCli(this.folderParam);
      }
    });
  }
}
