# GTS

This is a limited version of Git written in TypeScript. The idea came from [Write yourself a Git!](https://wyag.thb.lt/) which is a rudimentary implementation written in Python. I've ported the general outline and structure to TypeScript and expanded the command list.

## Commands Supported

-   `init`
-   `hash-object`
-   `cat-file`
-   `log`
-   `ls-tree`
-   `checkout`
-   `show-ref`
-   `tag`
-   `rev-parse`

## Running

Node v14+ is required

```ts
npm install
npm run build
// this will add a `gts` cli utility
npm link
```
