import pathLib from 'path';
import fs from 'fs';
import ini from 'ini';
import { repoFile } from '../misc';

/**
 * A git repository
 */
export class GitRepository {
    worktree: string;
    gitdir: string;

    /**
     * The data in the config file
     */
    conf: any;

    constructor(path: string, force = false) {
        this.worktree = path;
        this.gitdir = pathLib.join(path, '.git');
        if (!(force || fs.statSync(this.gitdir).isDirectory())) {
            throw new Error(`Not a Git repository ${path}`);
        }

        const configFilePath = repoFile(
            {
                gitdir: this.gitdir,
            },
            false,
            'config'
        );
        if (configFilePath && fs.existsSync(configFilePath)) {
            this.conf = ini.decode(fs.readFileSync(configFilePath, 'utf8'));
        } else if (!force) {
            throw new Error('Configuration file missing');
        }

        if (!force) {
            const version = parseInt(
                this.conf['core']['repositoryformatversion']
            );
            if (version !== 0) {
                throw new Error(
                    `Unsupported repositoryformatversion ${version}`
                );
            }
        }
    }
}
