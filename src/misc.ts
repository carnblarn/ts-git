import pathLib from 'path';
import fs from 'fs';
import { GitRepository } from './models/GitRepository';

/**
 * Compute path under repo's gitdir
 */
export function repoPath(repo: GitRepository, ...path: string[]) {
    return pathLib.join(repo.gitdir, ...path);
}

/**
 * Same as repoPath, but create dirname(...path) if absent
 * For example, repoFile(r, 'refs', 'remotes', 'origin', 'HEAD')
 * will create .git/refs/remotes/origin
 */
export function repoFile(
    repo: GitRepository,
    mkdir = false,
    ...path: string[]
) {
    const newPath = [...path];
    newPath.pop();
    if (repoDir(repo, mkdir, ...newPath)) {
        return repoPath(repo, ...path);
    }
}

/**
 * Same as repoPath but mkdir ...path if absent if mkdir
 */
export function repoDir(repo: GitRepository, mkdir = false, ...path: string[]) {
    const newPath = repoPath(repo, ...path);

    if (fs.existsSync(newPath)) {
        if (fs.statSync(newPath).isDirectory()) {
            return newPath;
        }
        throw new Error(`Not a directory ${newPath}`);
    }

    if (mkdir) {
        fs.mkdirSync(newPath, { recursive: true });
        return newPath;
    }
    return undefined;
}

/**
 * Look for a repository, starting at current directory and recursing
 */
export function repoFind(
    path = '.',
    required = true
): GitRepository | undefined {
    const newPath = pathLib.resolve('.');
    if (isDirectory(pathLib.join(newPath, '.git'))) {
        return new GitRepository(path);
    }
    const parent = pathLib.resolve(pathLib.join(newPath, '..'));
    if (parent === newPath) {
        if (required) {
            throw new Error('No git directory');
        }
        return undefined;
    }
    return repoFind(parent, required);
}

export function exists(path: string) {
    return fs.existsSync(path);
}

export function isDirectory(path: string) {
    return fs.statSync(path).isDirectory();
}

export function directoryIsEmpty(path: string) {
    const files = fs.readdirSync(path);
    return files.length === 0;
}
