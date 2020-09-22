import fs from 'fs';
import pathLib from 'path';
import chalk from 'chalk';
import { isDirectory, repoDir, repoFile, repoPath } from './misc';
import { GitRepository } from './models/GitRepository';

export function refResolve(repo: GitRepository, refPath: string): string {
    const file = repoFile(repo, false, refPath);
    if (!file) {
        throw new Error(`Could not resolve ${refPath}`);
    }

    const data = fs.readFileSync(file, 'utf8').slice(0, -1);

    if (data.startsWith('ref: ')) {
        return refResolve(repo, data.slice(5));
    }

    return data;
}

// Value can be a recursive reference of the same shape
type RefsType = Record<string, string | any>;

export function refList(repo: GitRepository, path: string = 'refs'): RefsType {
    const ret: RefsType = {};

    const dirPath = repoDir(repo, false, path);

    // Git shows refs sorted.
    fs.readdirSync(dirPath).forEach((file) => {
        const innerPath = pathLib.join(path, file);

        if (isDirectory(pathLib.join(dirPath, file))) {
            ret[file] = refList(repo, innerPath);
        } else {
            ret[file] = refResolve(repo, innerPath);
        }
    });
    return ret;
}
