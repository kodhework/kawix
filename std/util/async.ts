

export class Deferred<T> {
	private readonly _promise: Promise<T>
	public resolve: (value?: T | PromiseLike<T>) => void
	public reject: (reason?: any) => void
	constructor () {
		this._promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}
	get promise (): Promise<T> {
		return this._promise
	}
}

export class DelayedTask<T> {
	private _promise: Promise<T>
	private _value: T
	private _error: any
	private _generateddeferred: Deferred<T>

	private _end= false

	constructor(promise: Promise<T>){
		this._promise = promise
		this._promise.then((value)=>{
			this._value = value
			this._end = true
			this._check()
		}).catch((er)=>{
			this._error = er
			this._end = true
			this._check()
		})
	}

	_check(){
		if(this._generateddeferred && this._end){
			if(this._error) return this._generateddeferred.reject(this._error)
			return this._generateddeferred.resolve(this._value)
		}
	}

	get deferred(){
		if(!this._generateddeferred){
			this._generateddeferred= new Deferred<T>()
			setImmediate(this._check.bind(this))
		}
		return this._generateddeferred
	}

	get promise(){
		return this.deferred.promise
	}


}

export function sleep(timeout : number = 0) : Promise<void>{
	return new Promise<void>(function(resolve){
		setTimeout(resolve, timeout)
	})
}
