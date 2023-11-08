import { useRequest } from 'vue-hooks-plus';
import http from '../http';
// import type { BaseOptions, BaseResult } from "@ahooksjs/use-request/es/types";
// import { post, get } from '@/assets/libs/request';
/**
 * vue hooks 参考 https://nelsonyong.gitee.io/docs/hooks/
 * vue-hooks-plus 部分ts没有导出  暂时自己定义基本配置项 详细配置项没提示 请参考上边文档
 * usePost 基于vue-hooks-plus 封装
 *
 */
enum Method {
	'GET' = 'get',
	'POST' = 'post',
	'DELETE' = 'delete',
	'PUT' = 'put'
}
interface Options {
	manual?: boolean; // 是否手动调用
	defaultParams?: { [key: string]: any }; // 默认参数
	throttleWait?: number; // 节流时间
	debounceWait?: number; // 防抖时间
	pollingInterval?: number; // 轮询时间
	loadingDelay?: number; // loading延迟
	refreshOnWindowFocus?: boolean; // 在屏幕重新获取焦点或重新显示时，重新发起请求
	focusTimespan?: number; // 重新请求间隔
}

type ArgProps = {
	url: string;
	headers?: Record<string, any>;
	responseType?: XMLHttpRequestResponseType;
};
function usePost<T = any>(method: keyof typeof Method, arg?: string | ArgProps, usePostOptions?: Options) {
	return useRequest(
		(...postArgs: [any, any] | (Record<string, any> | undefined)[]) => {
			const isTypeofArgString = typeof arg === 'string';
			const url = isTypeofArgString ? arg : (arg as ArgProps).url;
			const headers = isTypeofArgString ? {} : arg?.headers;
			const argResponse = typeof arg !== 'string' && arg?.responseType ? { responseType: arg?.responseType } : {};
			// return http[Method[method]]<T>(url, { ...postArgs[0] }, { headers, ...argResponse });
			return http[Method[method]]<T>(url, postArgs[0], { headers, ...argResponse });
		},
		{
			manual: true,
			...usePostOptions
		} as any
	);
}

export default usePost;
