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

export function sleep(timeout : number = 0) : Promise<void>{
	return new Promise<void>(function(resolve){
		setTimeout(resolve, timeout)
	})
}