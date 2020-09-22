import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';
import { GitRepository } from '../models/GitRepository';
import { GitObject, GitBlob } from '../models/GitObject';
import { repoFile } from '../misc';
import { GitTree } from '../models/GitTree';
import { GitCommit } from '../models/GitCommit';
import { GitTag } from '../models/GitTag';

const spaceBuffer = Buffer.from(' ', 'ascii');

function objectWrite(obj: GitObject, actuallyWrite = true) {
    // Serialzie object data
    const data = obj.serialize();
    if (!data) {
        throw new Error('No data provided');
    }

    // Add header
    const result = Buffer.concat([
        obj.format,
        spaceBuffer,
        Buffer.from(`${data.length}`, 'ascii'),
        Buffer.from('\x00', 'ascii'),
        data,
    ]);

    // Compute hash
    const sha = crypto.createHash('sha1').update(result).digest('hex');
    if (actuallyWrite) {
        // Compute path
        const path = repoFile(
            obj.repo,
            true,
            'objects',
            sha.slice(0, 2),
            sha.slice(2)
        );
        if (path) {
            fs.writeFileSync(path, zlib.deflateSync(result));
        }
    }
    return sha;
}

export function objectHash(
    path: string,
    format: Buffer,
    repo: GitRepository,
    write = false
) {
    const data = fs.readFileSync(path);

    let obj: GitObject;

    // Choose constructor depending on
    // object type found in header.
    if (format.equals(Buffer.from('commit', 'ascii'))) {
        obj = new GitCommit(repo, data);
    } else if (format.equals(Buffer.from('tree', 'ascii'))) {
        obj = new GitTree(repo, data);
    } else if (format.equals(Buffer.from('tag', 'ascii'))) {
        obj = new GitTag(repo, data);
    } else if (format.equals(Buffer.from('blob', 'ascii'))) {
        obj = new GitBlob(repo, data);
    } else {
        throw new Error(`Unkonwn type ${format}`);
    }

    return objectWrite(obj, write);
}
