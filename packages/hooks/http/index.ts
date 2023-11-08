import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ResultData, ResultEnum } from './interface';
import { checkStatus } from './helper/checkStatus';
import { ElMessage } from 'element-plus';
import storage from '../storage';
const config = {
	// 默认地址请求地址，可在 .env 开头文件中修改
	baseURL: '',
	// 设置超时时间（10s）
	timeout: ResultEnum.TIMEOUT as number,
	// 跨域时候允许携带凭证
	withCredentials: true
};
class RequestHttp {
	service: AxiosInstance;
	public constructor(config: AxiosRequestConfig) {
		// 实例化axios
		this.service = axios.create(config);
		/**
		 * @description 请求拦截器
		 * 客户端发送请求 -> [请求拦截器] -> 服务器
		 * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
		 */
		this.service.interceptors.request.use(
			(config: any) => {
				const Authstr: string = storage.getCookie('MOM_TOKEN') || '';
				const Authorization = `Bearer ${storage.getToken()}`;
				if (Authstr && Authstr!='null'&& Authstr!='undefined') {
					return { ...config, headers: { Authstr, ...config.headers } };
				}
				return { ...config, headers: { Authorization, ...config.headers } };
			},
			(error: AxiosError) => {
				return Promise.reject(error);
			}
		);
		/**
		 * @description 响应拦截器
		 *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
		 */
		this.service.interceptors.response.use(
			(response: AxiosResponse) => {
				const { data } = response;
				// * 登陆失效（code == 599）
				if (data.code == ResultEnum.OVERDUE) {
					ElMessage.error(data?.msg || data?.message);
					return Promise.reject(data);
				}
				// * 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
				if (data.code && data.code !== ResultEnum.SUCCESS && data.code !== 1000) {
					ElMessage.error(data.msg || data.message);
					return Promise.reject(data);
				}
				// * 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
				return data;
			},
			async (error: AxiosError) => {
				const { response } = error;
				// 请求超时单独判断，因为请求超时没有 response
				if (error.message.indexOf('timeout') !== -1) ElMessage.error('请求超时！请您稍后重试');
				// 根据响应的错误状态码，做不同的处理
				if (response) checkStatus(response.status);
				// token 失效，401拦截
				if (response && response.status === ResultEnum.UNAUTHORIZED) {
					// * 清空token
					storage.removeToken();
					// 刷新页面走基座认证逻辑
					location.reload();
				}
				return Promise.reject(error);
			}
		);
	}

	// * 常用请求方法封装
	get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
		return this.service.get(url, { params, ..._object }); // axios 将参数拼在url中
	}

	post<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
		return this.service.post(url, params, _object);
	}

	put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
		return this.service.put(url, params, _object);
	}

	delete<T>(url: string, params?: any): Promise<ResultData<T>> {
		return this.service.delete(url, { data: { ...params } }); // axios 将参数放在表体中
	}
}

export default new RequestHttp(config);
