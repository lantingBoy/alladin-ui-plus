const ua = navigator.userAgent;
const isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
const isIos = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
const isFs = !!navigator.userAgent.toLocaleLowerCase().includes('lark');

const isPc = (): boolean => {
	const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
	let flag = true;
	for (let v = 0; v < Agents.length; v++) {
		if (ua.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
};

const setPageCount = (current: number) => {
	if (current > 1) {
		sessionStorage.setItem('pageNum', `${current}`);
		sessionStorage.setItem('pageUrl', location.href);
	}
};

const os = {
	isFs,
	isIos,
	isAndroid,
	isPc: isPc(),
	setPageCount: (current: number) => setPageCount(current)
};

export default os;
