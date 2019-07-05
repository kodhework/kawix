/* Copyright 2019 Kodhe contacto@kodhe.com*/
/** returns a promisified version of fs */
import fs from 'fs'
import Promisify from '../util/promisify'
export default Promisify.promisifyAllWithSuffix(fs)