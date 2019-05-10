import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

import AppendInitVect from './appendIv'
import getCipherKey from './cipherKey'

//const AppendInitVect = require('./appendIv');
//const getCipherKey = require('./cipherKey');

function encrypt({ file, outfile, readStream, writeStream, password }) {
	// Generate a secure, pseudo random initialization vector.
	const initVect = crypto.randomBytes(16);

	// Generate a cipher key from the password.
	const CIPHER_KEY = getCipherKey(password);
	if (file)
		readStream = fs.createReadStream(file);

	const gzip = zlib.createGzip();
	const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
	const appendInitVect = new AppendInitVect(initVect);
	// Create a write stream with a different file extension.
	if (outfile)
		writeStream = fs.createWriteStream(outfile);

	readStream
		.pipe(gzip)
		.pipe(cipher)
		.pipe(appendInitVect)
		.pipe(writeStream);

	return {
		cipher,
		gzip,
		readStream,
		writeStream
	}
}


function decrypt({ file, outfile, readStream, writeStream, password }) {
	// First, get the initialization vector from the file.
	//const readInitVect = fs.createReadStream(file, { end: 15 });

	let initVect;
	/*readInitVect.on('data', (chunk) => {
		initVect = chunk;
	});*/


	// Once we’ve got the initialization vector, we can decrypt the file.
	//readInitVect.on('close', () => {
	const cipherKey = getCipherKey(password);
	if (file)
		readStream = fs.createReadStream(file)

	let decipher
	const unzip = zlib.createUnzip();

	if (outfile)
		writeStream = fs.createWriteStream(outfile);

	initVect = Buffer.allocUnsafe(0)
	readStream.on("data", function (data) {
		if (initVect.length < 16) {
			d = data.slice(0, 16 - initVect.length)
			if (d.length) {
				initVect = Buffer.concat([initVect, d])
				data = data.slice(d.length)
			}
		}

		if (!decipher && initVect.length >= 16) {
			decipher = crypto.createDecipheriv('aes256', cipherKey, initVect);
			decipher.on("error", function (e) {
				readStream.emit("error", e)
			})
			decipher
				.pipe(unzip)
				.pipe(writeStream);
		}

		if (data.length) {
			if (decipher.write(data) === false) {

				readStream.pause()
				decipher.once("drain", readStream.resume.bind(readStream))
			}
		}
	})
	readStream.on("end", function () {
		decipher.end()
	})


	return {
		readStream,
		unzip,
		writeStream
	}
}

export default {
	encrypt,
	decrypt
}
export var kawixDynamic = {
	time: 15000
}