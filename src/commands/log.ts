import chalk from 'chalk';
import { GitRepository } from '../models/GitRepository';
import { decode, encode } from '../buffer';
import { objectRead } from '../object';
import { GitCommit } from '../models/GitCommit';

export function log(repo: GitRepository, sha: string, seen: string[]) {
    if (seen.includes(sha)) {
        return;
    }

    seen.push(sha);
    const commit = objectRead(repo, sha);

    if (!(commit instanceof GitCommit)) {
        throw new Error('Incorrect format');
    }

    console.log(chalk.yellow(`commit ${sha}`));
    console.log(`Author: ${commit.kvlm.author}`);
    console.log(`Date: TBD`);

    console.log();
    console.log('  ' + decode(commit.kvlm['']));

    if (!Object.keys(commit.kvlm).includes('parent')) {
        return;
    }

    let parent = decode(commit.kvlm['parent']);
    log(repo, parent, seen);
}
