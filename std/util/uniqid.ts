import uniqid from './_uniqid/mod'



// Commmon function signature
declare function f(prefix?: string): string;

// let x -> Workaround for ES6 imports
// Combined type because of assigning to function object in original module
declare let x: typeof f & { process: typeof f } & { time: typeof f }
x = uniqid
export = x
