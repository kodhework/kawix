var deferred;

import Path from 'path';
import Tar from '../../compression/tar';
import Glob from '../../../dhs/glob/mod';
import fs from '../../fs/mod';

deferred = function(number) {
	var def;
	def = {};
	def.promise = new Promise(function(a, b) {
		def.resolve = a;
		return def.reject = b;
	});
	return def;
};


export var createTarball = async function(body = {}) {
	var cfiles, def, dest, dir, dist, e, f, file, files, i, json, kw, len, max, name, nfiles, out, pack, ref, ref1, stat, sw, tarball, udest, value, version;
	dir = Path.normalize((ref = body.dirname) != null ? ref : Path.join(__dirname, ".."));
	dist = (ref1 = body.outputfolder) != null ? ref1 : Path.join(dir, ".dist");
	def = deferred();
	Glob(dir + "/**", function(err, files) {
		if (err) {
			return def.reject(err);
		}
		return def.resolve(files);
	});
	files = (await def.promise);
	max = -1;
	nfiles = [];
	for (i = 0, len = files.length; i < len; i++) {
		file = files[i];
		stat = (await fs.lstatAsync(file));
		value = stat.mtimeMs;
		if (value > max) {
			max = value;
		}
		if (!stat.isDirectory()) {
			if ((body != null ? typeof body.filter === "function" ? body.filter(file) : void 0 : void 0) === false) {
				continue;
			} else if (Path.relative(dir, file).startsWith(".bundles")) {
				continue;
			}
			nfiles.push(file);
		}
	}
	files = nfiles;
	if (body != null ? body.getmodified : void 0) {
		return max;
	}
	name = body.name;
	if (!fs.existsSync(dist)) {
		await fs.mkdirAsync(dist);
	}
	out = Path.join(dist, max + ".kwa");
	if (!fs.existsSync(out)) {
		cfiles = files.map(function(a) {
			return Path.relative(dir, a);
		}).filter(function(a) {
			return a && (!a.startsWith(".dist"));
		});
		tarball = Tar.c({
			gzip: true,
			follow: true,
			C: dir
		}, cfiles);
		try {
			// save
			sw = fs.createWriteStream(out);
			def = deferred();
			tarball.on("error", def.reject);
			sw.on("finish", def.resolve);
			tarball.pipe(sw);
			await def.promise;
		} catch (error) {
			e = error;
			if (fs.existsSync(out)) {
				// delete file
				await fs.unlinkAsync(out);
			}
			throw e;
		}
	}
	kw = body.distfolder;
	pack = (await import(body.package));
	if (!fs.existsSync(kw)) {
		await fs.mkdirAsync(kw);
	}
	f = Path.join(kw, "info.json");
	json = {
		name: pack.name
	};
	if (fs.existsSync(f)) {
		json = (await import(f));
	}
	json.versions = json.versions || {};
	version = json.versions[pack.version];
	if (!version) {
		version = json.versions[pack.version] = {};
		version.created = Date.now();
	} else {
		udest = Path.join(kw, version.filename);
		if (fs.existsSync(udest)) {
			await fs.unlinkAsync(udest);
		}
	}
	stat = (await fs.statAsync(out));
	version.size = stat.size;
	version.filename = "./" + Path.basename(out);
	version.uploadid = Path.basename(out, ".kwa");
	dest = Path.join(kw, Path.basename(out));
	if (body != null ? body.after : void 0) {
		await (body != null ? body.after(out, dest, version) : void 0);
	} else {
		await fs.copyFileAsync(out, dest);
	}
	await fs.writeFileAsync(f, JSON.stringify(json, null, '\t'));
	return console.info({
		modified: max,
		file: `${max}.kwa`
	});
};

export default function(body) {
	if (body) {
		delete body.dirname;
	}
	return createTarball(body);
};
