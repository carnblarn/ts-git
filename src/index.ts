#!/usr/bin/env node

import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import pathLib from 'path';

import { directoryIsEmpty, exists, isDirectory, repoFind } from './misc';
import { objectFind, objectRead } from './object';
import { decode, encode } from './buffer';
import { refList } from './refs';

import { GitRepository } from './models/GitRepository';
import { GitTree } from './models/GitTree';
import { GitCommit } from './models/GitCommit';

import { log } from './commands/log';
import { treeCheckout } from './commands/checkout';
import { showRef } from './commands/showRef';
import { catFile } from './commands/catFile';
import { objectHash } from './commands/hashObject';
import { repoCreate } from './commands/init';
import { tagCreate } from './commands/tag';

commander.version('0.0.1').description('gts');

const getRepo = (): GitRepository => {
    const repo = repoFind();
    if (!repo) {
        throw new Error('No repo found');
    }
    return repo;
};

commander
    .command('init [path]')
    .description('Init a File')
    .action((path) => {
        repoCreate(path || '.');
        console.log(`Initialized empty Git repository in ${path}`);
    });

commander.command('test [path]').action((path) => {
    // console.log(pathLib.resolve(path));
    // fs.readFileSync(path);
    console.log(Buffer.from('close1', 'ascii'));
});

commander
    .command('hash-object <path>')
    .description('Compute object ID and optionally creates a blob from a file')
    .option('-t, --type <type>', 'Specify the type', 'blob')
    .option('-w, --write', 'Actually write the object into the database')
    .action((path, cmd) => {
        const sha = objectHash(
            path,
            Buffer.from(cmd.type, 'ascii'),
            new GitRepository('.'),
            !!cmd.write
        );
        console.log(sha);
    });

commander
    .command('cat-file <type> <object>')
    .description('Provide content of repository objects')
    .action((type, object) => {
        const repo = getRepo();
        catFile(repo, object, Buffer.from(type, 'ascii'));
    });

commander
    .command('log [commit]')
    .description('Display history of a given commit')
    .action((commit) => {
        const repo = getRepo();

        log(repo, objectFind(repo, commit || 'HEAD'), []);
    });

// 5efb9bc29c482e023e40e0a2b3b7e49cec842034
commander
    .command('ls-tree [sha]')
    .description('Pretty-print a tree object.')
    .action((sha) => {
        const repo = getRepo();

        const obj = objectRead(
            repo,
            objectFind(repo, sha, encode('tree'))
        ) as GitTree;

        obj.items.forEach((item) => {
            const one = '0'.repeat(6 - item.mode.length) + decode(item.mode);
            const two = decode(objectRead(repo, item.sha).format);
            const three = item.sha;
            const four = decode(item.path);

            console.log(`${one} ${two} ${three}\t${four}`);
        });
    });

// 10628d4d805847ea110b31bb921fca14323bb5cd
commander
    .command('checkout <commit> <path>')
    .description('Checkout a commit inside of a directory')
    .action((commit, path) => {
        const repo = getRepo();

        let obj = objectRead(repo, objectFind(repo, commit));

        // If the object is a commit, we grab its tree
        if (obj instanceof GitCommit) {
            obj = objectRead(repo, decode(obj.kvlm['tree']));
        }
        if (!(obj instanceof GitTree)) {
            throw new Error('This is not a tree');
        }

        // Verify that path is an empty directory
        if (exists(path)) {
            if (!isDirectory(path)) {
                throw new Error(`Not a directory ${path}`);
            }
            if (!directoryIsEmpty(path)) {
                throw new Error(`Not empty ${path}`);
            }
        } else {
            fs.mkdirSync(path);
        }

        treeCheckout(repo, obj, pathLib.resolve(path));
    });

commander
    .command('show-ref')
    .description('List references.')
    .action(() => {
        const repo = getRepo();
        const refs = refList(repo);

        showRef(repo, refs, true, 'refs');
    });

commander
    .command('tag [name] [object]')
    .description('List and create tags')
    .option('-a', 'Whether to create a tag object')
    .action((name, object, cmd) => {
        const repo = getRepo();
        console.log(cmd.a);

        if (name) {
            tagCreate(repo, name, object || 'HEAD', cmd.a ? 'object' : 'ref');
        } else {
            const refs = refList(repo);
            showRef(repo, refs['tags'], false);
        }
    });

commander
    .command('rev-parse [name]')
    .description('Parse revision identifiers')
    .action((name) => {
        const repo = getRepo();

        console.log(objectFind(repo, name, undefined, true));
    });

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp();
}
