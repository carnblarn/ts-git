import chalk from 'chalk';
import { decode, encode } from './buffer';

export function kvlmParse(
    raw: Buffer,
    start = 0,
    premade?: Record<string, Buffer[] | Buffer>
): Record<string, Buffer[] | Buffer> {
    const dict: Record<string, Buffer[] | Buffer> = { ...premade };

    // Search for the next space the next newline
    const space = raw.indexOf(encode(' '), start);
    const n1 = raw.indexOf(encode('\n'), start);

    // If space appears before newline, we have a keyword

    // Base Case
    // =========
    // If newline appears first ( or there's no space at all,
    // in which case find returns -1), we assume a blank line.
    // A blank line means the remained of the data is the message
    if (space < 0 || n1 < space) {
        if (n1 !== start) {
            throw new Error('Illegal space found');
        }
        dict[''] = raw.slice(start + 1);
        return dict;
    }

    // Recursive Case
    // ===========
    // we read a key-value pair and recurse for the next
    const key = decode(raw.slice(start, space));

    // Find the end of the value. Continuation lines begin with
    // a space, so we loop until we find a "\n" not followed by
    // a space
    let end = start;
    while (true) {
        end = raw.indexOf(encode('\n'), end + 1);

        if (!raw.slice(end + 1, end + 2).equals(encode(' '))) {
            break;
        }
    }
    // Grab the value
    // Also, drop the leading space on contiuation lines
    const value = raw.slice(space + 1, end);

    if (dict[key]) {
        let val = dict[key];
        if (Array.isArray(val)) {
            val.push(value);
        } else {
            val = [val, value];
        }
        dict[key] = val;
    } else {
        dict[key] = value;
    }

    return kvlmParse(raw, end + 1, dict);
}

export function kvlmSerialize(kvlm: Record<string, Buffer>) {
    let ret = encode('');
    const keys = Object.keys(kvlm);

    // Output fields
    keys.forEach((k) => {
        // Skip the message itself
        if (k === '') {
            return;
        }
        let val = kvlm[k];

        // Normalzie to a list
        if (!Array.isArray(val)) {
            val = [val];
        }

        val.forEach((v) => {
            ret = Buffer.concat([ret, encode(' '), v, encode('\n')]);
        });
    });
    // Append message
    ret = Buffer.concat([encode('\n'), kvlm['']]);
    return ret;
}
