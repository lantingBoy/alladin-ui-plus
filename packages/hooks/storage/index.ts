/**
 *  支持过期时间的localStorage库
 */
import Cookies from 'js-cookie';
import os from '../os';

class StoreF {
	public TOKEN_KEY: string = 'ACCESS__TOKEN__'; // token标识
	public USER_INFO_KEY: string = 'USER_INFO__'; // 用户信息标识
	private preId: string = 'hdzk-'; // 存放local的前缀标识
	private timeSign: string = '|-door-|';
	private storage: Storage = window.localStorage || localStorage;
	private status: {
		SUCCESS: number;
		FAILURE: number;
		OVERFLOW: number;
		TIMEOUT: number;
	} = {
		SUCCESS: 0,
		FAILURE: 1,
		OVERFLOW: 2,
		TIMEOUT: 3
	};

	public constructor(tokenKey?: string, userInfoKey?: any) {
		if (tokenKey) this.TOKEN_KEY = tokenKey;
		if (userInfoKey) this.USER_INFO_KEY = userInfoKey;
	}

	private getKey(key: string): string {
		return this.preId + key;
	}

	public setLocalStorage(
		key: string,
		value: string | number,
		time?: Date | number,
		cb?: (status: number, key: string, value: string | number) => void
	): void {
		let _status = this.status.SUCCESS;
		const _key = this.getKey(key);
		let _time;
		// 设置失效时间，未设置时间默认为一个月
		try {
			_time = time ? new Date(time).getTime() || (time as Date).getTime() : new Date().getTime() + 1000 * 60 * 60 * 24 * 31;
		} catch (e) {
			_time = new Date().getTime() + 1000 * 60 * 60 * 24 * 31;
		}
		try {
			this.storage.setItem(_key, _time + this.timeSign + value);
		} catch (e) {
			_status = this.status.OVERFLOW;
		}
		cb && cb.call(this, _status, _key, value);
	}

	getq() {
		console.log(this.preId);
	}

	getLocalStorage(key: string, cb?: (status: number, value: string | number | null) => void) {
		let status = this.status.SUCCESS;
		const _key = this.getKey(key);
		let value: string | null;
		const timeSignLen = this.timeSign.length;
		const that = this;
		let index: number | undefined;
		let time: number;
		let result: { status: any; value: any };
		try {
			value = that.storage.getItem(_key) || '' || null;
		} catch (e) {
			result = {
				status: that.status.FAILURE,
				value: null
			};
			cb && cb.call(this, result.status, result.value);
			return result;
		}
		if (value) {
			index = (value as string).indexOf(that.timeSign);
			time = +(value as string).slice(0, index);
			if (time > new Date().getTime() || time == 0) {
				value = (value as any).slice(index + timeSignLen);
			} else {
				(value = null), (status = that.status.TIMEOUT);
				that.removeLocalStorage(key);
			}
		} else {
			status = that.status.FAILURE;
		}
		result = {
			status: status,
			value: value
		};
		cb && cb.call(this, result.status, result.value);
		return result;
	}

	removeLocalStorage(key: string, cb?: (status: number, value: string | number | null) => void) {
		let status = this.status.FAILURE;
		const _key = this.getKey(key);
		let value;
		try {
			value = this.storage.getItem(_key);
		} catch (e) {
			console.error('获取本地存储失败', e);
		}
		if (value) {
			try {
				this.storage.removeItem(_key);
				status = this.status.SUCCESS;
			} catch (e) {
				console.error('删除本地存储失败', e);
			}
		}
		cb &&
			cb.call(this, status, status > 0 ? null : value ? value.slice(value.indexOf(this.timeSign) + this.timeSign.length) : null);
	}

	setCookie(key: string, value: any, timestamp?: number) {
		// timestamp:秒
		if (os.isFs) {
			const expires = timestamp ? new Date(timestamp * 1000) : undefined;
			return this.setLocalStorage(key, value, expires);
		} else {
			if (timestamp) {
				const expires = new Date(+new Date() * 1 + timestamp * 1000);
				return Cookies.set(key, value, { expires: expires });
			}
			return Cookies.set(key, value);
		}
	}

	getCookie(key: string) {
		return os.isFs ? this.getLocalStorage(key).value : Cookies.get(key) || '';
	}

	removeCookie(key: string) {
		if (os.isFs) {
			return this.removeLocalStorage(key);
		}
		return Cookies.remove(key);
	}

	setToken(token: any, expires?: any) {
		if (os.isFs) {
			const expiresTime = expires ? new Date(parseInt(expires + '000')) : undefined;
			this.setLocalStorage(this.TOKEN_KEY, token, expiresTime);
		} else {
			Cookies.set('expires', expires);
			Cookies.set(this.TOKEN_KEY, token, {
				expires: expires ? new Date(parseInt(expires + '000')) : 1
			});
		}
	}

	getToken() {
		if (os.isFs) {
			return this.getLocalStorage(this.TOKEN_KEY).value;
		}
		return Cookies.get(this.TOKEN_KEY) || '';
	}

	removeToken() {
		if (os.isFs) {
			this.removeLocalStorage(this.TOKEN_KEY);
		} else {
			Cookies.remove(this.TOKEN_KEY);
			Cookies.remove('expires');
			Cookies.remove(this.USER_INFO_KEY);
		}
	}
}

export default new StoreF();
