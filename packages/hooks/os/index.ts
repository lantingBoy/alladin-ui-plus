const ua = typeof navigator !== 'undefined'? navigator.userAgent : null;
const isAndroid = ua?ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1:false;
const isIos = ua? !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/):false;
const isFs = ua?!!navigator.userAgent.toLocaleLowerCase().includes('lark'):false;

const isPc = (): boolean => {
	const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
	let flag = true;
	for (let v = 0; v < Agents.length; v++) {
		if (ua&&ua.indexOf(Agents[v]) > 0) {
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
