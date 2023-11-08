class RS {
	private toString = Object.prototype.toString;

	is(val: unknown, type: string) {
		return this.toString.call(val) === `[object ${type}]`;
	}

	isFunction<T = Function>(val: unknown): val is T {
		return this.is(val, 'Function');
	}

	/**
	 * @description: 是否已定义
	 */
	isDef<T = unknown>(val?: T): val is T {
		return typeof val !== 'undefined';
	}

	isUnDef = <T = unknown>(val?: T): val is T => {
		return !this.isDef(val);
	};

	/**
	 * @description: 是否为对象
	 */
	isObject = (val: any): val is Record<any, any> => {
		return val !== null && this.is(val, 'Object');
	};

	/**
	 * @description:  是否为时间
	 */
	isDate(val: unknown): val is Date {
		return this.is(val, 'Date');
	}

	/**
	 * @description:  是否为数值
	 */
	isNumber(val: unknown): val is number {
		return this.is(val, 'Number');
	}

	/**
	 * @description:  是否为AsyncFunction
	 */
	isAsyncFunction<T = any>(val: unknown): val is Promise<T> {
		return this.is(val, 'AsyncFunction');
	}

	/**
	 * @description:  是否为promise
	 */
	isPromise<T = any>(val: unknown): val is Promise<T> {
		return this.is(val, 'Promise') && this.isObject(val) && this.isFunction(val.then) && this.isFunction(val.catch);
	}

	/**
	 * @description:  是否为字符串
	 */
	isString(val: unknown): val is string {
		return this.is(val, 'String');
	}

	/**
	 * @description:  是否为boolean类型
	 */
	isBoolean(val: unknown): val is boolean {
		return this.is(val, 'Boolean');
	}

	/**
	 * @description:  是否为数组
	 */
	isArray(val: any): val is Array<any> {
		return val && Array.isArray(val);
	}

	/**
	 * @description: 是否客户端
	 */
	isClient = () => {
		return typeof window !== 'undefined';
	};
}

export default new RS();
