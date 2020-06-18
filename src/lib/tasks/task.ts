import { TaskConfigurationError } from '../errors/task-configuration-error';

export const EMPTY_COMMANDS: [] = [];

export interface SimpleGitTaskConfiguration<RESPONSE, FORMAT, INPUT> {

   commands: string[]
   format: FORMAT;
   parser(text: INPUT): RESPONSE;

   concatStdErr?: boolean;
   onError?: (
      exitCode: number,
      error: string,
      done: (result: INPUT) => void,
      fail: (error: string) => void,
   ) => void;

}

export type EmptyTask = SimpleGitTaskConfiguration<undefined, 'utf-8', string> & {
   commands: typeof EMPTY_COMMANDS;
};

export type StringTask<R> = SimpleGitTaskConfiguration<R, 'utf-8', string>;

export type BufferTask<R> = SimpleGitTaskConfiguration<R, 'buffer', Buffer>;

export type SimpleGitTask<R> = StringTask<R> | BufferTask<R> | EmptyTask;

export function configurationErrorTask(error: Error | string): EmptyTask {
   return {
      commands: EMPTY_COMMANDS,
      format: 'utf-8',
      parser() {
         throw typeof error === 'string' ? new TaskConfigurationError(error) : error;
      },
   }
}

export function execTask<R>(callback: () => R): StringTask<R> {
   return {
      commands: EMPTY_COMMANDS,
      format: 'utf-8',
      parser () {
         return callback();
      },
   }
}

export function straightThroughStringTask(commands: string[]): StringTask<string> {
   return {
      commands,
      format: 'utf-8',
      parser(text) {
         return text;
      },
   }
}

export function isBufferTask<R>(task: SimpleGitTask<R>): task is BufferTask<R> {
   return task.format === 'buffer';
}

export function isEmptyTask<R>(task: SimpleGitTask<R>): task is EmptyTask {
   return !task.commands.length;
}
