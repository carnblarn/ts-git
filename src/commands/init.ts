#!/usr/bin/env node

import fs from 'fs';
import ini from 'ini';

import { GitRepository } from '../models/GitRepository';
import {
    isDirectory,
    exists,
    directoryIsEmpty,
    repoDir,
    repoFile,
} from '../misc';

/**
 * Create a new repository at path
 */
export function repoCreate(path: string) {
    const repo = new GitRepository(path, true);
    console.log(repo.worktree);

    // First we make sure the path either doesn't exist or is an empty dir
    if (exists(repo.worktree)) {
        if (!isDirectory(repo.worktree)) {
            throw new Error(`${path} is not a directory!`);
        }
        if (!directoryIsEmpty(repo.worktree)) {
            throw new Error(`${path} is not empty!`);
        }
    } else {
        fs.mkdirSync(repo.worktree);
    }

    repoDir(repo, true, 'branches');
    repoDir(repo, true, 'objects');
    repoDir(repo, true, 'refs', 'tags');
    repoDir(repo, true, 'refs', 'heads');

    const descriptionFile = repoFile(repo, false, 'description');
    if (descriptionFile) {
        fs.writeFileSync(
            descriptionFile,
            'Unnamed repository; edit this file `description` to name the repository \n'
        );
    }

    const headFile = repoFile(repo, false, 'HEAD');
    if (headFile) {
        fs.writeFileSync(headFile, 'ref: refs/heads/master\n');
    }

    const configFile = repoFile(repo, false, 'config');
    if (configFile) {
        const defaultConfig = repoDefaultConfig();
        fs.writeFileSync(configFile, defaultConfig);
    }
    return repo;
}

export function repoDefaultConfig() {
    return ini.encode({
        core: {
            repositoryformatversion: 0,
            filemode: false,
            bare: false,
        },
    });
}
