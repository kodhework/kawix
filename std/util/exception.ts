var Exception;

Exception = class Exception extends Error {
	static create(message, innerException) {
		var e;
		e = new Exception(message);
		if (innerException) {
			e.innerException = innerException;
		}
		return e;
	}

	putCode(code) {
		this.code = code;
		return this;
	}

	putStack(stack) {
		this.stack = stack;
		return this;
	}

	putMessage(message) {
		this.message = message;
		return this;
	}

	raise() {
		throw this;
	}

};

export default Exception;
