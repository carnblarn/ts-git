import pathLib from 'path';
import fs from 'fs';
import { decode } from '../buffer';
import { GitRepository } from '../models/GitRepository';
import { GitTree } from '../models/GitTree';
import { objectRead } from '../object';
import { GitBlob } from '../models/GitObject';

export function treeCheckout(repo: GitRepository, tree: GitTree, path: string) {
    tree.items.forEach((item) => {
        const obj = objectRead(repo, item.sha);
        const dest = pathLib.join(path, decode(item.path));

        if (obj instanceof GitTree) {
            fs.mkdirSync(dest);
            treeCheckout(repo, obj, dest);
        } else if (obj instanceof GitBlob) {
            fs.writeFileSync(dest, obj.blobdata);
        }
    });
}
