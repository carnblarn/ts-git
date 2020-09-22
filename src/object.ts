import fs from 'fs';
import zlib from 'zlib';
import chalk from 'chalk';

import { repoDir, repoFile } from './misc';
import { GitCommit } from './models/GitCommit';
import { GitBlob, GitObject } from './models/GitObject';
import { GitRepository } from './models/GitRepository';
import { GitTree } from './models/GitTree';
import { refResolve } from './refs';
import { encode, decode } from './buffer';
import { GitTag } from './models/GitTag';

/**
 * Resolve name to an object hash in repo
 *
 * This function is aware of:
 * - the HEAD Literal
 * - short and long hashes
 * - tags
 * - branches
 * - remote branches
 */
function objectResolve(repo: GitRepository, name: string) {
    const candidates: string[] = [];
    const hashRE = new RegExp(/^[0-9A-Fa-f]{1,16}$/);

    // End on empty string
    if (!name.length) {
        return;
    }

    // Head is nonambiguous
    if (name === 'HEAD') {
        return [refResolve(repo, 'HEAD')];
    }

    if (name.match(hashRE)) {
        if (name.length === 40) {
            // This is ac omplete hash
            return [name.toLowerCase()];
        } else if (name.length >= 4) {
            // This is a small hash
            const lowerName = name.toLowerCase();
            const prefix = lowerName.slice(0, 2);
            const path = repoDir(repo, false, 'objects', prefix);
            if (path) {
                const rem = lowerName.slice(2);
                const files = fs.readdirSync(path);
                files.forEach((file) => {
                    if (file.startsWith(rem)) {
                        candidates.push(prefix + file);
                    }
                });
            }
        }
    }
    return candidates;
}

export function objectFind(
    repo: GitRepository,
    name: string,
    format?: Buffer,
    follow = true
) {
    const shas = objectResolve(repo, name);
    if (!shas) {
        throw new Error(`No such references ${name}`);
    }

    if (shas.length > 1) {
        throw new Error(
            `Ambigious reference ${name}. Candidates are ${shas.join(', ')}`
        );
    }

    let sha = shas[0];

    if (!format) {
        return sha;
    }

    while (true) {
        const obj = objectRead(repo, sha);

        if (!obj.format.equals(format)) {
            return sha;
        }
        if (!follow) {
            return;
        }

        // Follow tags
        if (obj instanceof GitTag) {
            sha = decode(obj.kvlm['object']);
        } else if (obj instanceof GitCommit && format.equals(encode('tree'))) {
            sha = decode(obj.kvlm['tree']);
        } else {
            return;
        }
    }
}

/**
 * Read on object object_id from Git repository repo
 * Return a GitObject whose exact type depends on the object
 */
export function objectRead(repo: GitRepository, sha: string): GitObject {
    const path = repoFile(
        repo,
        false,
        'objects',
        sha.slice(0, 2),
        sha.slice(2)
    );
    if (!path) {
        throw new Error(`Cannot find path ${path}`);
    }

    const raw = zlib.inflateSync(fs.readFileSync(path));

    const x = raw.indexOf(Buffer.from(' ', 'ascii'));
    const format = raw.slice(0, x);
    const y = raw.indexOf(Buffer.from('\x00', 'ascii'));
    const size = parseInt(raw.slice(x, y).toString('ascii'));

    if (size !== raw.length - y - 1) {
        throw new Error(`Malformed object ${sha}: bad length`);
    }

    const data = raw.slice(y + 1);

    if (format.equals(Buffer.from('commit', 'ascii'))) {
        return new GitCommit(repo, data);
    } else if (format.equals(Buffer.from('tree', 'ascii'))) {
        return new GitTree(repo, data);
    } else if (format.equals(Buffer.from('tag', 'ascii'))) {
        return new GitTag(repo, data);
    } else if (format.equals(Buffer.from('blob', 'ascii'))) {
        return new GitBlob(repo, data);
    }
    throw new Error(
        `Unkonwn type ${format.toString('ascii')} for object ${sha}`
    );
}
