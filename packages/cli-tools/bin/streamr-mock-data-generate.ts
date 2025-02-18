#!/usr/bin/env node
import pkg from '../package.json'
import { createFnParseInt } from '../src/common'
import { createCommand } from '../src/command'

// From: https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
function randomString(
    length: number,
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string {
    let result = ''
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
}

function genArray<T>(size: number, elementFn: () => T): T[] {
    const arr = []
    for (let i=0; i < size; ++i) {
        arr.push(elementFn())
    }
    return arr
}

export const generate = (rate: number): void => {
    setInterval(() => {
        console.info(JSON.stringify({
            someText: randomString(64),
            aNumber: Math.random() * 10000,
            bNumber: Math.random(),
            yesOrNo: Math.random() > 0.5,
            arrayOfStrings: genArray(Math.floor(Math.random() * 20), () => randomString(8)),
            arrayOfIntegers: genArray(Math.floor(Math.random() * 10), () => Math.floor(Math.random() * 100))

        }))
    }, rate)
}

createCommand()
    .description('generate and print semi-random JSON data to stdout')
    .option('-r, --rate <n>', 'rate in milliseconds', createFnParseInt('--rate'), 500)
    .version(pkg.version)
    .action((options: any) => {
        generate(options.rate)
    })
    .parse()