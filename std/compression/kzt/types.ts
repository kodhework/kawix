export interface FileStat{
    isdirectory?:boolean,
    isfile?: boolean,
    issymlink?:boolean,
    mtimeMs?: number,
    atimeMs?: number
}